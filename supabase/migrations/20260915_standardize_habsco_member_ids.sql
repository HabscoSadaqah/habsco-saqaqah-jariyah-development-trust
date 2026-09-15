-- Standardize Hassan Finance member IDs to HABSCO-001, HABSCO-002, ...
-- The live database migration was applied separately; this file keeps the change reproducible in source control.

create sequence if not exists public.habsco_member_id_seq;

with numbered as (
  select id, row_number() over (order by created_at, id)::bigint as n
  from public.profiles
)
update public.profiles p
set member_id = 'HABSCO-' || lpad(numbered.n::text, 3, '0')
from numbered
where p.id = numbered.id;

select setval(
  'public.habsco_member_id_seq',
  greatest(
    coalesce(
      (select max(substring(member_id from '^HABSCO-([0-9]+)$')::bigint)
       from public.profiles
       where member_id ~ '^HABSCO-[0-9]+$'),
      0
    ),
    1
  ),
  true
);

alter table public.profiles
  alter column member_id set default (
    'HABSCO-' || lpad(nextval('public.habsco_member_id_seq')::text, 3, '0')
  );

update public.member_id_issuance mi
set member_id = p.member_id,
    issued_at = now()
from public.profiles p
where mi.user_id = p.id;

insert into public.member_id_issuance(user_id, member_id, issued_by)
select p.id, p.member_id,
       (select id from public.profiles
        where role='admin' and status='active'
        order by created_at, id limit 1)
from public.profiles p
where not exists (
  select 1 from public.member_id_issuance mi where mi.user_id = p.id
);

create or replace function public.admin_issue_member_id(p_user_id uuid, p_member_id text)
returns text
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_admin uuid := auth.uid();
  v_id text := upper(trim(p_member_id));
  v_num bigint;
  v_last bigint;
begin
  if not exists(select 1 from public.profiles where id=v_admin and role='admin' and status='active') then
    raise exception 'Administrator access required';
  end if;
  if v_id !~ '^HABSCO-[0-9]{3,}$' then
    raise exception 'Member ID must use format HABSCO-001';
  end if;
  if not exists(select 1 from public.profiles where id=p_user_id) then
    raise exception 'Member not found';
  end if;
  if exists(select 1 from public.profiles where member_id=v_id and id<>p_user_id) then
    raise exception 'Member ID already issued';
  end if;

  v_num := substring(v_id from '^HABSCO-([0-9]+)$')::bigint;
  select last_value into v_last from public.habsco_member_id_seq;

  update public.profiles set member_id=v_id where id=p_user_id;
  insert into public.member_id_issuance(user_id,member_id,issued_by)
  values(p_user_id,v_id,v_admin)
  on conflict(user_id) do update
    set member_id=excluded.member_id,
        issued_by=excluded.issued_by,
        issued_at=now();

  if v_num > v_last then
    perform setval('public.habsco_member_id_seq',v_num,true);
  end if;
  return v_id;
end;
$$;

create or replace function public.member_dashboard_balances()
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_uid uuid := auth.uid();
  v_wallet numeric(18,2) := 0;
  v_savings numeric(18,2) := 0;
  v_shares numeric(18,2) := 0;
  v_special numeric(18,2) := 0;
  v_member_id text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  select member_id into v_member_id from public.profiles where id=v_uid;
  select coalesce(balance,0) into v_wallet from public.wallets where user_id=v_uid;
  select coalesce(savings_balance,0),coalesce(shares_balance,0),coalesce(special_savings_balance,0)
    into v_savings,v_shares,v_special
    from public.member_cooperative_accounts where user_id=v_uid;
  return jsonb_build_object(
    'member_id', v_member_id,
    'available', v_wallet,
    'savings', v_savings,
    'shares', v_shares,
    'special_savings', v_special,
    'cooperative', v_savings+v_shares+v_special,
    'total', v_wallet+v_savings+v_shares+v_special
  );
end;
$$;
