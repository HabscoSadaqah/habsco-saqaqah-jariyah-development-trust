-- Idempotent utility finalization: preserves the original debit and records a separate credit reversal.
CREATE OR REPLACE FUNCTION public.utility_finalize_transaction(p_transaction_id uuid, p_success boolean, p_provider_reference text DEFAULT NULL::text, p_provider_status text DEFAULT NULL::text, p_provider_response jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_tx public.transactions%rowtype;
  v_fee numeric(18,2) := 0;
  v_token text;
  v_meta jsonb;
  v_provider_status text;
  v_final_status text;
  v_reversal_ref text;
BEGIN
  SELECT * INTO v_tx
  FROM public.transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF v_tx.id IS NULL THEN
    RAISE EXCEPTION 'Utility transaction not found.';
  END IF;
  IF v_tx.type <> 'utility' OR v_tx.direction <> 'debit' THEN
    RAISE EXCEPTION 'Invalid utility transaction.';
  END IF;

  v_provider_status := lower(regexp_replace(coalesce(p_provider_status, ''), '\s+', '_', 'g'));

  -- If a previous version refunded the wallet but did not create a ledger row,
  -- add only the missing statement row. Do not credit the wallet a second time.
  IF v_tx.status <> 'pending' THEN
    IF v_tx.status IN ('rejected', 'failed')
       AND coalesce(v_tx.metadata->>'refunded', 'false') = 'true' THEN
      SELECT reference INTO v_reversal_ref
      FROM public.transactions
      WHERE user_id = v_tx.user_id
        AND metadata->>'reversal_of_transaction_id' = v_tx.id::text
      LIMIT 1;

      IF v_reversal_ref IS NULL THEN
        v_reversal_ref := 'HF-REV-UT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14));
        INSERT INTO public.transactions(
          user_id, type, direction, amount, status, reference, description, metadata, created_by
        ) VALUES (
          v_tx.user_id,
          'utility',
          'credit',
          v_tx.amount,
          'approved',
          v_reversal_ref,
          'Utility reversal — ' || coalesce(v_tx.description, 'Utility purchase'),
          coalesce(v_tx.metadata, '{}'::jsonb) || jsonb_build_object(
            'transaction_kind', 'utility_reversal',
            'reversal_of_transaction_id', v_tx.id::text,
            'reversal_of_reference', v_tx.reference,
            'original_amount', v_tx.amount,
            'provider_status', coalesce(p_provider_status, v_tx.metadata->>'provider_status'),
            'provider_reference', coalesce(p_provider_reference, v_tx.metadata->>'provider_reference'),
            'refunded', true
          ),
          v_tx.user_id
        );
        UPDATE public.transactions
        SET metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('reversal_reference', v_reversal_ref)
        WHERE id = v_tx.id;
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'reference', v_tx.reference,
      'status', v_tx.status,
      'amount', v_tx.amount,
      'service_charge', coalesce((v_tx.metadata->>'service_charge')::numeric, 0),
      'reversal_reference', v_reversal_ref
    );
  END IF;

  v_fee := round(coalesce((v_tx.metadata->>'service_charge')::numeric, 0), 2);
  v_token := nullif(trim(coalesce(
    p_provider_response->'provider_history'->'requery'->>'token',
    p_provider_response->'provider_history'->'vend'->>'token',
    p_provider_response->'provider_history'->>'token',
    p_provider_response->>'token',
    ''
  )), '');
  v_meta := coalesce(v_tx.metadata, '{}'::jsonb) || jsonb_build_object(
    'provider_reference', p_provider_reference,
    'provider_status', p_provider_status,
    'provider_response', coalesce(p_provider_response, '{}'::jsonb),
    'service_fee_collected', v_fee,
    'service_fee_destination', 'admin_service_balance',
    'transaction_kind', 'utility_service_fee'
  );
  IF v_token IS NOT NULL THEN
    v_meta := v_meta || jsonb_build_object('token', v_token, 'electricity_token', v_token);
  END IF;

  IF p_success THEN
    IF v_fee > 0 THEN
      UPDATE public.cooperative_wallets
      SET service_balance = coalesce(service_balance, 0) + v_fee, updated_at = now()
      WHERE id = 1;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Cooperative service balance wallet is unavailable.';
      END IF;
    END IF;

    UPDATE public.transactions
    SET status = 'approved',
        reviewed_at = now(),
        reviewed_by = v_tx.user_id,
        metadata = v_meta
    WHERE id = v_tx.id;

    RETURN jsonb_build_object(
      'reference', v_tx.reference,
      'provider_reference', p_provider_reference,
      'status', 'approved',
      'amount', v_tx.amount,
      'service_charge', v_fee,
      'token', v_token
    );
  END IF;

  -- Only a confirmed terminal failure/rejection reaches this branch.
  v_final_status := CASE
    WHEN v_provider_status IN ('rejected', 'declined') THEN 'rejected'
    WHEN v_provider_status IN ('failed', 'failure', 'failed_transaction', 'cancelled', 'canceled', 'error') THEN 'failed'
    ELSE 'rejected'
  END;

  UPDATE public.wallets
  SET balance = balance + v_tx.amount, updated_at = now()
  WHERE user_id = v_tx.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Member wallet is unavailable; utility reversal was not completed.';
  END IF;

  -- Preserve the original debit and add a separate, idempotent credit row.
  SELECT reference INTO v_reversal_ref
  FROM public.transactions
  WHERE user_id = v_tx.user_id
    AND metadata->>'reversal_of_transaction_id' = v_tx.id::text
  LIMIT 1;

  IF v_reversal_ref IS NULL THEN
    v_reversal_ref := 'HF-REV-UT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 14));
    INSERT INTO public.transactions(
      user_id, type, direction, amount, status, reference, description, metadata, created_by
    ) VALUES (
      v_tx.user_id,
      'utility',
      'credit',
      v_tx.amount,
      'approved',
      v_reversal_ref,
      'Utility reversal — ' || coalesce(v_tx.description, 'Utility purchase'),
      v_meta || jsonb_build_object(
        'transaction_kind', 'utility_reversal',
        'reversal_of_transaction_id', v_tx.id::text,
        'reversal_of_reference', v_tx.reference,
        'original_amount', v_tx.amount,
        'provider_status', coalesce(p_provider_status, 'failed'),
        'refunded', true
      ),
      v_tx.user_id
    );
  END IF;

  UPDATE public.transactions
  SET status = v_final_status,
      reviewed_at = now(),
      reviewed_by = v_tx.user_id,
      metadata = v_meta || jsonb_build_object(
        'refunded', true,
        'reversal_reference', v_reversal_ref,
        'final_status', v_final_status
      )
  WHERE id = v_tx.id;

  RETURN jsonb_build_object(
    'reference', v_tx.reference,
    'provider_reference', p_provider_reference,
    'status', v_final_status,
    'amount', v_tx.amount,
    'service_charge', v_fee,
    'reversal_reference', v_reversal_ref,
    'token', v_token
  );
END;
$function$

