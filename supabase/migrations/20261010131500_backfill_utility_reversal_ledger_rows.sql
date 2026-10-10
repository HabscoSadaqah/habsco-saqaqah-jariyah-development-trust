-- Backfill statement-only credit rows for utility transactions whose wallets
-- were already refunded by the earlier finalizer. This never changes wallet balances.
INSERT INTO public.transactions (
  user_id, type, direction, amount, status, reference, description,
  metadata, created_by, created_at, reviewed_at, reviewed_by
)
SELECT
  t.user_id,
  'utility',
  'credit',
  t.amount,
  'approved',
  'HF-REV-UT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14)),
  'Utility reversal — ' || coalesce(t.description, 'Utility purchase'),
  jsonb_strip_nulls(jsonb_build_object(
    'transaction_kind', 'utility_reversal',
    'reversal_of_transaction_id', t.id::text,
    'reversal_of_reference', t.reference,
    'original_amount', t.amount,
    'service', t.metadata->>'service',
    'action', t.metadata->>'action',
    'provider', t.metadata->>'provider',
    'receiver', t.metadata->>'receiver',
    'phone', t.metadata->>'phone',
    'meter_type', t.metadata->>'meter_type',
    'provider_status', t.metadata->>'provider_status',
    'provider_reference', t.metadata->>'provider_reference',
    'refunded', true,
    'legacy_reversal_backfill', true
  )),
  t.user_id,
  coalesce(t.reviewed_at, t.created_at),
  coalesce(t.reviewed_at, t.created_at),
  t.user_id
FROM public.transactions t
WHERE t.type = 'utility'
  AND t.direction = 'debit'
  AND t.status IN ('rejected', 'failed')
  AND coalesce(t.metadata->>'refunded', 'false') = 'true'
  AND NOT EXISTS (
    SELECT 1
    FROM public.transactions r
    WHERE r.user_id = t.user_id
      AND r.metadata->>'reversal_of_transaction_id' = t.id::text
  );