create table if not exists public.member_donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  amount numeric(14,2) not null check (amount > 0),
  project text not null check (project in ('waqf_shops','solar_boreholes','vocational_learning','empowerment','general_sadaqah')),
  reference text not null unique,
  status text not null default 'received' check (status in ('received','reversed')),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.member_donations enable row level security;
drop policy if exists member_read_own_donations on public.member_donations;
create policy member_read_own_donations on public.member_donations
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.member_donations from anon, authenticated;
grant select on public.member_donations to authenticated;

create or replace function public.member_make_donation(
  p_amount numeric,
  p_project text,
  p_transaction_pin text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $function$
declare
  v_uid uuid := auth.uid();
  v_pin_hash text;
  v_balance numeric;
  v_ref text;
  v_id uuid;
  v_project text := coalesce(nullif(trim(p_project), ''), 'general_sadaqah');
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if p_amount is null or p_amount < 100 then raise exception 'Minimum donation is ₦100.'; end if;
  if v_project not in ('waqf_shops','solar_boreholes','vocational_learning','empowerment','general_sadaqah') then
    raise exception 'Choose a valid HABSCO charity project.';
  end if;
  if p_transaction_pin is null or p_transaction_pin !~ '^[0-9]{6}$' then
    raise exception 'Enter your 6-digit transaction PIN.';
  end if;
  select transaction_pin_hash into v_pin_hash
    from public.profiles where id = v_uid and status = 'active' for update;
  if not found then raise exception 'Your HABSCO account is not active.'; end if;
  if v_pin_hash is null then raise exception 'Set your transaction PIN before donating.'; end if;
  if extensions.crypt(p_transaction_pin, v_pin_hash) <> v_pin_hash then
    raise exception 'Incorrect transaction PIN.';
  end if;
  select balance into v_balance from public.wallets where user_id = v_uid for update;
  if v_balance is null then raise exception 'Wallet not found.'; end if;
  if v_balance < p_amount then raise exception 'Insufficient wallet balance.'; end if;

  v_ref := 'HSD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16));
  update public.wallets set balance = balance - p_amount, updated_at = now() where user_id = v_uid;
  insert into public.member_donations(user_id, amount, project, reference, status)
    values (v_uid, round(p_amount, 2), v_project, v_ref, 'received') returning id into v_id;
  insert into public.transactions(user_id, reference, type, amount, status, description, direction, created_by, metadata)
    values (v_uid, v_ref, 'donation', round(p_amount, 2), 'approved',
      'Sadaqah Jariyah donation · ' || replace(v_project, '_', ' '), 'debit', v_uid,
      jsonb_build_object('donation_id', v_id, 'project', v_project, 'ledger', 'member_donations'));
  return jsonb_build_object('id', v_id, 'reference', v_ref, 'amount', round(p_amount, 2),
    'project', v_project, 'status', 'received');
end;
$function$;

revoke all on function public.member_make_donation(numeric, text, text) from public, anon;
grant execute on function public.member_make_donation(numeric, text, text) to authenticated;
