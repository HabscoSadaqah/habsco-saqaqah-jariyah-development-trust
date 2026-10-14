alter function public.wallet_board_credit_debit_transfer_with_denominations(uuid, uuid, text, numeric, numeric, jsonb, jsonb) security definer;
alter function public.wallet_board_credit_debit_transfer_with_denominations(uuid, uuid, text, numeric, numeric, jsonb, jsonb) set search_path = public, pg_temp;
