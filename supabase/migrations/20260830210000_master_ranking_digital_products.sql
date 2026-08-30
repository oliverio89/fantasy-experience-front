-- Métricas verificadas de Másters y productos digitales descargables.
-- Las sesiones en mesa/online consumen plazas; los productos Digitales no.

BEGIN;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS digital_asset_path TEXT,
  ADD COLUMN IF NOT EXISTS digital_file_name TEXT,
  ADD COLUMN IF NOT EXISTS digital_file_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS digital_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS digital_version INTEGER NOT NULL DEFAULT 1
    CHECK (digital_version BETWEEN 1 AND 10000);

ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_digital_asset_path_length,
  ADD CONSTRAINT games_digital_asset_path_length
    CHECK (
      digital_asset_path IS NULL
      OR char_length(digital_asset_path) BETWEEN 3 AND 500
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_asset_extension,
  ADD CONSTRAINT games_digital_asset_extension
    CHECK (
      digital_asset_path IS NULL
      OR lower(digital_asset_path) ~ '\.(pdf|zip|rar)$'
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_file_name_length,
  ADD CONSTRAINT games_digital_file_name_length
    CHECK (
      digital_file_name IS NULL
      OR char_length(btrim(digital_file_name)) BETWEEN 1 AND 180
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_file_name_extension,
  ADD CONSTRAINT games_digital_file_name_extension
    CHECK (
      digital_file_name IS NULL
      OR lower(digital_file_name) ~ '\.(pdf|zip|rar)$'
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_file_size,
  ADD CONSTRAINT games_digital_file_size
    CHECK (
      digital_file_size_bytes IS NULL
      OR digital_file_size_bytes BETWEEN 1 AND 104857600
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_mime_type,
  ADD CONSTRAINT games_digital_mime_type
    CHECK (
      digital_mime_type IS NULL
      OR digital_mime_type IN (
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'application/vnd.rar',
        'application/x-rar-compressed',
        'application/octet-stream'
      )
    ) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_digital_metadata_consistent,
  ADD CONSTRAINT games_digital_metadata_consistent
    CHECK (
      digital_asset_path IS NULL
      OR (
        digital_file_name IS NOT NULL
        AND digital_file_size_bytes IS NOT NULL
        AND digital_mime_type IS NOT NULL
        AND (
          (
            lower(digital_asset_path) ~ '\.pdf$'
            AND lower(digital_file_name) ~ '\.pdf$'
            AND digital_mime_type = 'application/pdf'
          )
          OR (
            lower(digital_asset_path) ~ '\.zip$'
            AND lower(digital_file_name) ~ '\.zip$'
            AND digital_mime_type IN ('application/zip', 'application/x-zip-compressed')
          )
          OR (
            lower(digital_asset_path) ~ '\.rar$'
            AND lower(digital_file_name) ~ '\.rar$'
            AND digital_mime_type IN (
              'application/vnd.rar',
              'application/x-rar-compressed',
              'application/octet-stream'
            )
          )
        )
      )
    ) NOT VALID;

ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS fulfillment_type TEXT NOT NULL DEFAULT 'reservation'
    CHECK (fulfillment_type IN ('reservation', 'digital_download'));

CREATE TABLE IF NOT EXISTS public.digital_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  payment_order_id UUID NOT NULL UNIQUE
    REFERENCES public.payment_orders(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked', 'refunded')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  UNIQUE (game_id, buyer_id)
);

ALTER TABLE public.digital_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_entitlements FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "digital_entitlements_select_involved"
  ON public.digital_entitlements;
CREATE POLICY "digital_entitlements_select_involved"
  ON public.digital_entitlements FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = game_id AND games.master_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

REVOKE ALL ON public.digital_entitlements FROM PUBLIC, anon, authenticated;
GRANT SELECT (
  id, game_id, buyer_id, status, granted_at, revoked_at,
  last_downloaded_at, download_count
) ON public.digital_entitlements TO authenticated;
GRANT ALL ON public.digital_entitlements TO service_role;

CREATE INDEX IF NOT EXISTS idx_digital_entitlements_buyer
  ON public.digital_entitlements(buyer_id, granted_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_entitlements_game_status
  ON public.digital_entitlements(game_id, status);

INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
VALUES (
  'digital-products',
  'digital-products',
  FALSE,
  104857600,
  ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/vnd.rar',
    'application/x-rar-compressed',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "digital_products_select_own" ON storage.objects;
CREATE POLICY "digital_products_select_own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "digital_products_insert_own" ON storage.objects;
CREATE POLICY "digital_products_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'digital-products'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('master', 'admin')
    )
  );

DROP POLICY IF EXISTS "digital_products_update_own" ON storage.objects;
CREATE POLICY "digital_products_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
    AND NOT EXISTS (
      SELECT 1
      FROM public.games AS game
      JOIN public.digital_entitlements AS entitlement
        ON entitlement.game_id = game.id AND entitlement.status = 'active'
      WHERE game.digital_asset_path = name
    )
  )
  WITH CHECK (
    bucket_id = 'digital-products'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "digital_products_delete_own" ON storage.objects;
CREATE POLICY "digital_products_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'digital-products'
    AND auth.uid()::TEXT = (storage.foldername(name))[1]
    AND NOT EXISTS (
      SELECT 1
      FROM public.games AS game
      JOIN public.digital_entitlements AS entitlement
        ON entitlement.game_id = game.id AND entitlement.status = 'active'
      WHERE game.digital_asset_path = name
    )
  );

-- Los productos digitales no reservan plazas ni modifican el aforo.
CREATE OR REPLACE FUNCTION public.recompute_game_capacity(p_game_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_type TEXT;
  confirmed_count INTEGER;
  held_count INTEGER;
BEGIN
  IF p_game_id IS NULL THEN
    RETURN;
  END IF;

  SELECT game_type INTO target_type
  FROM public.games
  WHERE id = p_game_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF target_type = 'Digital' THEN
    UPDATE public.games
    SET
      current_players = 0,
      pending_players = 0,
      status = CASE WHEN status = 'full' THEN 'active' ELSE status END,
      updated_at = NOW()
    WHERE id = p_game_id;
    RETURN;
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO confirmed_count
  FROM public.game_participants
  WHERE game_id = p_game_id;

  SELECT COUNT(*)::INTEGER
  INTO held_count
  FROM public.payment_orders
  WHERE game_id = p_game_id
    AND fulfillment_type = 'reservation'
    AND (
      (status = 'pending' AND expires_at > NOW())
      OR (status = 'creating' AND created_at > NOW() - INTERVAL '5 minutes')
    );

  UPDATE public.games
  SET
    current_players = confirmed_count,
    pending_players = held_count,
    status = CASE
      WHEN status IN ('cancelled', 'completed') THEN status
      WHEN confirmed_count + held_count >= max_players THEN 'full'
      ELSE 'active'
    END,
    updated_at = NOW()
  WHERE id = p_game_id;
END;
$$;

REVOKE ALL ON FUNCTION public.recompute_game_capacity(UUID) FROM PUBLIC;

-- Pedido sin inventario para una descarga. El importe siempre sale de games.
CREATE OR REPLACE FUNCTION public.prepare_digital_payment_order(
  p_game_id UUID,
  p_buyer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game public.games%ROWTYPE;
  existing_order public.payment_orders%ROWTYPE;
  created_order public.payment_orders%ROWTYPE;
  recent_attempts INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;
  IF p_game_id IS NULL OR p_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Solicitud de pago no válida';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_buyer_id::TEXT, 0));

  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND OR target_game.game_type <> 'Digital' THEN
    RAISE EXCEPTION 'Aventura digital no encontrada';
  END IF;
  IF target_game.master_id = p_buyer_id THEN
    RAISE EXCEPTION 'No puedes comprar tu propia aventura';
  END IF;
  IF target_game.status <> 'active' THEN
    RAISE EXCEPTION 'La aventura digital no está disponible';
  END IF;
  IF target_game.digital_asset_path IS NULL
    OR target_game.digital_file_name IS NULL THEN
    RAISE EXCEPTION 'La descarga todavía no está disponible';
  END IF;
  IF target_game.price < 0.50 THEN
    RAISE EXCEPTION 'El precio mínimo para cobrar con tarjeta es 0,50 €';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.digital_entitlements
    WHERE game_id = p_game_id AND buyer_id = p_buyer_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Ya has comprado esta aventura';
  END IF;

  UPDATE public.payment_orders
  SET status = CASE WHEN status = 'pending' THEN 'expired' ELSE 'failed' END
  WHERE game_id = p_game_id
    AND player_id = p_buyer_id
    AND fulfillment_type = 'digital_download'
    AND (
      (status = 'pending' AND expires_at <= NOW())
      OR (status = 'creating' AND created_at <= NOW() - INTERVAL '5 minutes')
    );

  SELECT * INTO existing_order
  FROM public.payment_orders
  WHERE game_id = p_game_id
    AND player_id = p_buyer_id
    AND fulfillment_type = 'digital_download'
    AND (
      (status = 'pending' AND expires_at > NOW())
      OR (status = 'creating' AND created_at > NOW() - INTERVAL '5 minutes')
    )
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'orderId', existing_order.id,
      'gameId', existing_order.game_id,
      'gameTitle', existing_order.game_title,
      'amountCents', existing_order.amount_cents,
      'currency', existing_order.currency,
      'status', existing_order.status,
      'checkoutUrl', existing_order.checkout_url,
      'expiresAt', existing_order.expires_at,
      'fulfillmentType', existing_order.fulfillment_type
    );
  END IF;

  SELECT COUNT(*)::INTEGER INTO recent_attempts
  FROM public.payment_orders
  WHERE player_id = p_buyer_id
    AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_attempts >= 10 THEN
    RAISE EXCEPTION 'Demasiados intentos de pago. Inténtalo más tarde';
  END IF;

  INSERT INTO public.payment_orders (
    game_id, player_id, game_title, amount_cents, currency, fulfillment_type
  ) VALUES (
    p_game_id,
    p_buyer_id,
    target_game.title,
    ROUND(target_game.price * 100)::INTEGER,
    target_game.currency,
    'digital_download'
  )
  RETURNING * INTO created_order;

  RETURN jsonb_build_object(
    'orderId', created_order.id,
    'gameId', created_order.game_id,
    'gameTitle', created_order.game_title,
    'amountCents', created_order.amount_cents,
    'currency', created_order.currency,
    'status', created_order.status,
    'checkoutUrl', created_order.checkout_url,
    'expiresAt', created_order.expires_at,
    'fulfillmentType', created_order.fulfillment_type
  );
END;
$$;

REVOKE ALL ON FUNCTION public.prepare_digital_payment_order(UUID, UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_digital_payment_order(UUID, UUID)
  TO service_role;

-- Reconciliación Stripe específica de descargas: concede o revoca el derecho,
-- pero nunca crea una participación ni ocupa una plaza.
CREATE OR REPLACE FUNCTION public.process_digital_stripe_event(
  p_event_id TEXT,
  p_event_type TEXT,
  p_object JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_order public.payment_orders%ROWTYPE;
  target_game public.games%ROWTYPE;
  stored_result JSONB;
  response_result JSONB := jsonb_build_object('processed', TRUE);
  session_id TEXT := p_object ->> 'sessionId';
  payment_intent_id TEXT := p_object ->> 'paymentIntentId';
  order_id_text TEXT := p_object ->> 'orderId';
  amount_total INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;
  IF p_event_id IS NULL OR p_event_id !~ '^evt_[A-Za-z0-9_]+$' THEN
    RAISE EXCEPTION 'Evento de Stripe no válido';
  END IF;

  SELECT result INTO stored_result
  FROM public.stripe_webhook_events
  WHERE event_id = p_event_id;
  IF FOUND THEN
    RETURN stored_result || jsonb_build_object('duplicate', TRUE);
  END IF;

  IF p_event_type = 'checkout.session.completed' THEN
    SELECT * INTO target_order
    FROM public.payment_orders
    WHERE stripe_checkout_session_id = session_id
      AND fulfillment_type = 'digital_download'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Pedido digital asociado a Stripe no encontrado';
    END IF;
    IF order_id_text IS DISTINCT FROM target_order.id::TEXT
      OR (p_object ->> 'playerId') IS DISTINCT FROM target_order.player_id::TEXT
      OR (p_object ->> 'gameId') IS DISTINCT FROM target_order.game_id::TEXT
      OR lower(p_object ->> 'currency') IS DISTINCT FROM target_order.currency
      OR (p_object ->> 'paymentStatus') IS DISTINCT FROM 'paid' THEN
      RAISE EXCEPTION 'Los datos firmados del pago no coinciden con el pedido';
    END IF;

    amount_total := (p_object ->> 'amountTotal')::INTEGER;
    IF amount_total IS DISTINCT FROM target_order.amount_cents
      OR payment_intent_id IS NULL
      OR payment_intent_id !~ '^pi_[A-Za-z0-9_]+$' THEN
      RAISE EXCEPTION 'El importe o la referencia del pago no son válidos';
    END IF;

    IF target_order.status = 'paid' THEN
      response_result := jsonb_build_object(
        'processed', TRUE, 'orderId', target_order.id,
        'status', 'paid', 'needsRefund', FALSE,
        'fulfillmentType', 'digital_download'
      );
    ELSIF target_order.status IN ('refund_pending', 'refunded') THEN
      response_result := jsonb_build_object(
        'processed', TRUE, 'orderId', target_order.id,
        'status', target_order.status, 'needsRefund', FALSE,
        'fulfillmentType', 'digital_download'
      );
    ELSE
      SELECT * INTO target_game
      FROM public.games
      WHERE id = target_order.game_id
      FOR UPDATE;

      IF NOT FOUND
        OR target_game.game_type <> 'Digital'
        OR target_game.status <> 'active'
        OR target_game.digital_asset_path IS NULL THEN
        UPDATE public.payment_orders
        SET status = 'refund_pending',
            stripe_payment_intent_id = payment_intent_id,
            paid_at = COALESCE(paid_at, NOW()),
            checkout_url = NULL
        WHERE id = target_order.id;
        response_result := jsonb_build_object(
          'processed', TRUE, 'orderId', target_order.id,
          'status', 'refund_pending', 'needsRefund', TRUE,
          'paymentIntentId', payment_intent_id
        );
      ELSE
        UPDATE public.payment_orders
        SET status = 'paid',
            stripe_payment_intent_id = payment_intent_id,
            paid_at = COALESCE(paid_at, NOW()),
            checkout_url = NULL
        WHERE id = target_order.id;

        INSERT INTO public.digital_entitlements (
          game_id, buyer_id, payment_order_id, status
        ) VALUES (
          target_order.game_id, target_order.player_id, target_order.id, 'active'
        )
        ON CONFLICT (game_id, buyer_id) DO UPDATE SET
          payment_order_id = EXCLUDED.payment_order_id,
          status = 'active',
          granted_at = NOW(),
          revoked_at = NULL;

        response_result := jsonb_build_object(
          'processed', TRUE, 'orderId', target_order.id,
          'status', 'paid', 'needsRefund', FALSE,
          'fulfillmentType', 'digital_download'
        );
      END IF;
    END IF;
  ELSIF p_event_type = 'checkout.session.expired' THEN
    UPDATE public.payment_orders
    SET status = 'expired', checkout_url = NULL
    WHERE stripe_checkout_session_id = session_id
      AND fulfillment_type = 'digital_download'
      AND status IN ('creating', 'pending')
    RETURNING * INTO target_order;
    response_result := jsonb_build_object(
      'processed', TRUE,
      'orderId', CASE WHEN target_order.id IS NULL THEN NULL ELSE target_order.id END,
      'status', 'expired', 'needsRefund', FALSE
    );
  ELSIF p_event_type = 'charge.refunded'
    AND COALESCE((p_object ->> 'fullyRefunded')::BOOLEAN, FALSE) THEN
    SELECT * INTO target_order
    FROM public.payment_orders
    WHERE stripe_payment_intent_id = payment_intent_id
      AND fulfillment_type = 'digital_download'
    FOR UPDATE;
    IF FOUND THEN
      UPDATE public.payment_orders
      SET status = 'refunded', refunded_at = COALESCE(refunded_at, NOW())
      WHERE id = target_order.id;

      UPDATE public.digital_entitlements
      SET status = 'refunded', revoked_at = COALESCE(revoked_at, NOW())
      WHERE payment_order_id = target_order.id;

      response_result := jsonb_build_object(
        'processed', TRUE, 'orderId', target_order.id,
        'status', 'refunded', 'needsRefund', FALSE
      );
    ELSE
      response_result := jsonb_build_object(
        'processed', TRUE, 'ignored', TRUE, 'needsRefund', FALSE
      );
    END IF;
  ELSE
    response_result := jsonb_build_object(
      'processed', TRUE, 'ignored', TRUE, 'needsRefund', FALSE
    );
  END IF;

  INSERT INTO public.stripe_webhook_events (
    event_id, event_type, order_id, result
  ) VALUES (
    p_event_id, p_event_type, target_order.id, response_result
  );
  RETURN response_result;
END;
$$;

REVOKE ALL ON FUNCTION public.process_digital_stripe_event(TEXT, TEXT, JSONB)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.process_digital_stripe_event(TEXT, TEXT, JSONB)
  TO service_role;

-- Publicación y edición: una sesión necesita fecha/contacto; un producto
-- Digital necesita un archivo privado y no necesita fecha ni aforo real.
DROP POLICY IF EXISTS "games_insert_master" ON public.games;
CREATE POLICY "games_insert_master"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_publish_game(master_id)
    AND description IS NOT NULL
    AND image_url IS NOT NULL
    AND (
      (
        game_type = 'Digital'
        AND price >= 0.50
        AND start_date IS NULL
        AND digital_asset_path IS NOT NULL
        AND digital_asset_path LIKE master_id::TEXT || '/%'
        AND digital_file_name IS NOT NULL
        AND digital_file_size_bytes IS NOT NULL
        AND digital_mime_type IS NOT NULL
      )
      OR (
        game_type <> 'Digital'
        AND start_date IS NOT NULL
        AND start_date > NOW()
        AND master_contact IS NOT NULL
        AND char_length(btrim(master_contact)) > 0
        AND digital_asset_path IS NULL
        AND (game_type NOT IN ('Presencial', 'Híbrida') OR char_length(btrim(city)) > 0)
      )
    )
  );

DROP POLICY IF EXISTS "games_update_before_start" ON public.games;
CREATE POLICY "games_update_own_product"
  ON public.games FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = master_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    (
      auth.uid() = master_id
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
    AND description IS NOT NULL
    AND image_url IS NOT NULL
    AND (
      (
        game_type = 'Digital'
        AND price >= 0.50
        AND start_date IS NULL
        AND digital_asset_path IS NOT NULL
        AND digital_asset_path LIKE master_id::TEXT || '/%'
        AND digital_file_name IS NOT NULL
        AND digital_file_size_bytes IS NOT NULL
        AND digital_mime_type IS NOT NULL
      )
      OR (
        game_type <> 'Digital'
        AND start_date IS NOT NULL
        AND start_date > NOW()
        AND master_contact IS NOT NULL
        AND char_length(btrim(master_contact)) > 0
        AND digital_asset_path IS NULL
        AND (game_type NOT IN ('Presencial', 'Híbrida') OR char_length(btrim(city)) > 0)
      )
    )
  );

GRANT SELECT (
  digital_file_name, digital_file_size_bytes, digital_mime_type, digital_version
) ON public.games TO anon, authenticated;
GRANT INSERT (
  digital_asset_path, digital_file_name, digital_file_size_bytes,
  digital_mime_type, digital_version
) ON public.games TO authenticated;
GRANT UPDATE (
  digital_asset_path, digital_file_name, digital_file_size_bytes,
  digital_mime_type, digital_version
) ON public.games TO authenticated;

-- Las reseñas de Máster sólo pertenecen a sesiones realmente dirigidas.
DROP POLICY IF EXISTS "reviews_insert_verified_participant"
  ON public.master_reviews;
CREATE POLICY "reviews_insert_verified_participant"
  ON public.master_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = player_id
    AND partida_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.games
      JOIN public.game_participants
        ON game_participants.game_id = games.id
      WHERE games.id = partida_id
        AND games.master_id = master_id
        AND games.game_type <> 'Digital'
        AND games.status = 'completed'
        AND game_participants.player_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "reviews_update_verified_participant"
  ON public.master_reviews;
CREATE POLICY "reviews_update_verified_participant"
  ON public.master_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (
    auth.uid() = player_id
    AND partida_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.games
      JOIN public.game_participants
        ON game_participants.game_id = games.id
      WHERE games.id = partida_id
        AND games.master_id = master_id
        AND games.game_type <> 'Digital'
        AND games.status = 'completed'
        AND game_participants.player_id = auth.uid()
    )
  );

-- Comentarios públicos anonimizados. No expone IDs de jugadores.
CREATE OR REPLACE FUNCTION public.get_public_master_reviews(
  p_master_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  partida_id UUID,
  game_title TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    review.id,
    review.partida_id,
    game.title,
    review.rating,
    review.comment,
    review.created_at
  FROM public.master_reviews AS review
  JOIN public.games AS game ON game.id = review.partida_id
  WHERE review.master_id = p_master_id
    AND game.game_type <> 'Digital'
    AND game.status = 'completed'
  ORDER BY review.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 50)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

REVOKE ALL ON FUNCTION public.get_public_master_reviews(UUID, INTEGER, INTEGER)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_master_reviews(UUID, INTEGER, INTEGER)
  TO anon, authenticated;

-- Ranking verificable. La media usa ponderación bayesiana para evitar que una
-- única reseña de 5 estrellas supere a un historial amplio y consistente.
CREATE OR REPLACE FUNCTION public.get_master_public_stats()
RETURNS TABLE (
  master_id UUID,
  published_sessions BIGINT,
  completed_sessions BIGINT,
  cancelled_sessions BIGINT,
  players_served BIGINT,
  digital_products BIGINT,
  digital_sales BIGINT,
  average_rating NUMERIC,
  review_count BIGINT,
  ranking_score NUMERIC,
  is_featured BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH session_stats AS (
    SELECT
      profile.id AS master_id,
      COUNT(game.id) FILTER (WHERE game.game_type <> 'Digital') AS published_sessions,
      COUNT(game.id) FILTER (
        WHERE game.game_type <> 'Digital'
          AND game.status = 'completed'
          AND EXISTS (
            SELECT 1 FROM public.game_participants AS participant
            WHERE participant.game_id = game.id
          )
      ) AS completed_sessions,
      COUNT(game.id) FILTER (
        WHERE game.game_type <> 'Digital' AND game.status = 'cancelled'
      ) AS cancelled_sessions,
      COUNT(game.id) FILTER (WHERE game.game_type = 'Digital') AS digital_products
    FROM public.profiles AS profile
    LEFT JOIN public.games AS game ON game.master_id = profile.id
    WHERE profile.role IN ('master', 'admin')
    GROUP BY profile.id
  ),
  player_stats AS (
    SELECT game.master_id, COUNT(participant.id)::BIGINT AS players_served
    FROM public.games AS game
    JOIN public.game_participants AS participant ON participant.game_id = game.id
    WHERE game.game_type <> 'Digital' AND game.status = 'completed'
    GROUP BY game.master_id
  ),
  review_stats AS (
    SELECT
      review.master_id,
      AVG(review.rating)::NUMERIC AS average_rating,
      COUNT(*)::BIGINT AS review_count
    FROM public.master_reviews AS review
    JOIN public.games AS game ON game.id = review.partida_id
    WHERE game.game_type <> 'Digital' AND game.status = 'completed'
    GROUP BY review.master_id
  ),
  sales_stats AS (
    SELECT game.master_id, COUNT(entitlement.id)::BIGINT AS digital_sales
    FROM public.digital_entitlements AS entitlement
    JOIN public.games AS game ON game.id = entitlement.game_id
    WHERE entitlement.status = 'active'
    GROUP BY game.master_id
  ),
  global_rating AS (
    SELECT COALESCE(AVG(review.rating), 4.20)::NUMERIC AS value
    FROM public.master_reviews AS review
    JOIN public.games AS game ON game.id = review.partida_id
    WHERE game.game_type <> 'Digital' AND game.status = 'completed'
  ),
  metrics AS (
    SELECT
      session.master_id,
      session.published_sessions,
      session.completed_sessions,
      session.cancelled_sessions,
      COALESCE(player.players_served, 0)::BIGINT AS players_served,
      session.digital_products,
      COALESCE(sale.digital_sales, 0)::BIGINT AS digital_sales,
      COALESCE(review.average_rating, 0)::NUMERIC AS average_rating,
      COALESCE(review.review_count, 0)::BIGINT AS review_count,
      global_rating.value AS global_average
    FROM session_stats AS session
    LEFT JOIN player_stats AS player ON player.master_id = session.master_id
    LEFT JOIN review_stats AS review ON review.master_id = session.master_id
    LEFT JOIN sales_stats AS sale ON sale.master_id = session.master_id
    CROSS JOIN global_rating
  )
  SELECT
    metrics.master_id,
    metrics.published_sessions,
    metrics.completed_sessions,
    metrics.cancelled_sessions,
    metrics.players_served,
    metrics.digital_products,
    metrics.digital_sales,
    ROUND(metrics.average_rating, 2),
    metrics.review_count,
    ROUND(
      GREATEST(
        0,
        (
          (
            (metrics.average_rating * metrics.review_count + metrics.global_average * 5)
            / NULLIF(metrics.review_count + 5, 0)
          ) / 5 * 70
        )
        + LEAST(20, LN(1 + metrics.completed_sessions) * 7)
        + LEAST(10, LN(1 + metrics.review_count) * 4)
        - CASE
            WHEN metrics.published_sessions > 0
            THEN (metrics.cancelled_sessions::NUMERIC / metrics.published_sessions) * 20
            ELSE 0
          END
      )::NUMERIC,
      2
    ) AS ranking_score,
    (
      metrics.completed_sessions >= 3
      AND metrics.review_count >= 3
      AND metrics.average_rating >= 4
      AND (
        metrics.published_sessions = 0
        OR metrics.cancelled_sessions::NUMERIC / metrics.published_sessions <= 0.25
      )
    ) AS is_featured
  FROM metrics;
$$;

REVOKE ALL ON FUNCTION public.get_master_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_master_public_stats() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.has_digital_entitlement(p_game_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.digital_entitlements
      WHERE game_id = p_game_id
        AND buyer_id = auth.uid()
        AND status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM public.games
      WHERE id = p_game_id AND master_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.has_digital_entitlement(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_digital_entitlement(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_owned_digital_asset(p_game_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game public.games%ROWTYPE;
BEGIN
  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id;

  IF NOT FOUND OR (
    target_game.master_id <> auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ) THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'path', target_game.digital_asset_path,
    'fileName', target_game.digital_file_name,
    'fileSizeBytes', target_game.digital_file_size_bytes,
    'mimeType', target_game.digital_mime_type,
    'version', target_game.digital_version
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_owned_digital_asset(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_owned_digital_asset(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_digital_download(
  p_game_id UUID,
  p_buyer_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;

  UPDATE public.digital_entitlements
  SET
    last_downloaded_at = NOW(),
    download_count = download_count + 1
  WHERE game_id = p_game_id
    AND buyer_id = p_buyer_id
    AND status = 'active';
END;
$$;

REVOKE ALL ON FUNCTION public.record_digital_download(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_digital_download(UUID, UUID)
  TO service_role;

-- Un producto se puede retirar del catálogo sin invalidar las compras previas.
-- Las sesiones conservan las reglas estrictas de cancelación y finalización.
CREATE OR REPLACE FUNCTION public.set_game_status(
  p_game_id UUID,
  p_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game public.games%ROWTYPE;
BEGIN
  IF p_status NOT IN ('active', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Estado no permitido';
  END IF;

  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF target_game.master_id <> auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar esta partida';
  END IF;

  IF target_game.game_type = 'Digital' THEN
    IF p_status NOT IN ('active', 'cancelled') THEN
      RAISE EXCEPTION 'Una aventura digital sólo puede publicarse o retirarse';
    END IF;
    IF p_status = 'active' AND (
      target_game.digital_asset_path IS NULL
      OR target_game.digital_file_name IS NULL
      OR target_game.price < 0.50
    ) THEN
      RAISE EXCEPTION 'La aventura digital no está lista para publicarse';
    END IF;

    UPDATE public.games
    SET status = p_status, updated_at = NOW()
    WHERE id = p_game_id;
    RETURN;
  END IF;

  IF p_status = 'cancelled' AND EXISTS (
    SELECT 1 FROM public.payment_orders
    WHERE game_id = p_game_id
      AND status IN ('creating', 'pending', 'paid', 'refund_pending')
  ) THEN
    RAISE EXCEPTION 'Cancela esta partida desde el flujo seguro de pagos';
  END IF;
  IF p_status = 'completed' AND (
    target_game.status NOT IN ('active', 'full')
    OR target_game.start_date IS NULL
    OR target_game.start_date > NOW()
  ) THEN
    RAISE EXCEPTION 'Solo puedes completar una partida que ya haya comenzado';
  END IF;
  IF target_game.status = 'completed' AND p_status <> 'completed' THEN
    RAISE EXCEPTION 'Una partida completada no puede reabrirse';
  END IF;
  IF p_status = 'active'
    AND target_game.start_date IS NOT NULL
    AND target_game.start_date <= NOW() THEN
    RAISE EXCEPTION 'No puedes reactivar una partida que ya ha comenzado';
  END IF;

  UPDATE public.games
  SET status = CASE
      WHEN p_status = 'active'
        AND current_players + pending_players >= max_players THEN 'full'
      ELSE p_status
    END,
    updated_at = NOW()
  WHERE id = p_game_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_game_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_game_status(UUID, TEXT) TO authenticated;

COMMIT;
