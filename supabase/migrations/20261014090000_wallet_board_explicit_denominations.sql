create or replace function public.wallet_board_credit_debit_transfer_with_denominations(
  p_from_item_id uuid,
  p_to_item_id uuid,
  p_from_direction text,
  p_from_amount numeric,
  p_to_amount numeric,
  p_from_paid_denominations jsonb default '[]'::jsonb,
  p_from_change_denominations jsonb default '[]'::jsonb
)
returns public.wallet_board_transfers
language plpgsql
security invoker
set search_path = public, pg_temp
as $function$
declare
  u uuid := auth.uid();
  r public.wallet_board_transfers;
  paid jsonb := coalesce(p_from_paid_denominations, '[]'::jsonb);
  change_given jsonb := coalesce(p_from_change_denominations, '[]'::jsonb);
begin
  if u is null then
    raise exception 'Authentication required.';
  end if;
  if jsonb_typeof(paid) <> 'array' or jsonb_typeof(change_given) <> 'array' then
    raise exception 'Cash denominations must be arrays.';
  end if;

  -- Preserve the existing balance/transfer logic; append only the calculator entries.
  r := public.wallet_board_credit_debit_transfer(
    p_from_item_id, p_to_item_id, p_from_direction, p_from_amount, p_to_amount
  );

  update public.wallet_board_transfers t
  set metadata = coalesce(t.metadata, '{}'::jsonb) || jsonb_build_object(
    'from_paid_denominations', paid,
    'from_change_denominations', change_given,
    'denomination_source', 'wallet_board_calculator'
  ),
  updated_at = now()
  where t.id = r.id and t.user_id = u
  returning t.* into r;

  if not found then
    raise exception 'Unable to save cash denomination entries.';
  end if;
  return r;
end;
$function$;

revoke all on function public.wallet_board_credit_debit_transfer_with_denominations(uuid, uuid, text, numeric, numeric, jsonb, jsonb) from public;
grant execute on function public.wallet_board_credit_debit_transfer_with_denominations(uuid, uuid, text, numeric, numeric, jsonb, jsonb) to authenticated;
