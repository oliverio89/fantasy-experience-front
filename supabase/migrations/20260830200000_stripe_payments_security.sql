-- Stripe Checkout, inventario de plazas y endurecimiento de las operaciones
-- financieras. Los importes y las plazas siempre se deciden en PostgreSQL;
-- el navegador nunca confirma un pago.

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS pending_players INTEGER NOT NULL DEFAULT 0
    CHECK (pending_players >= 0),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'eur'
    CHECK (currency = 'eur');

ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_capacity_consistent;
ALTER TABLE public.games
  ADD CONSTRAINT games_capacity_consistent
  CHECK (current_players + pending_players <= max_players) NOT VALID;
ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_stripe_minimum_price;
ALTER TABLE public.games
  ADD CONSTRAINT games_stripe_minimum_price
  CHECK (price = 0 OR price >= 0.50) NOT VALID;

-- El hardening anterior usa SELECT por columna para ocultar master_contact.
-- Se habilitan sólo los dos nuevos datos públicos del aforo/precio.
GRANT SELECT (pending_players, currency)
  ON public.games TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  game_title TEXT NOT NULL CHECK (char_length(game_title) BETWEEN 1 AND 200),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 50),
  currency TEXT NOT NULL DEFAULT 'eur' CHECK (currency = 'eur'),
  status TEXT NOT NULL DEFAULT 'creating' CHECK (
    status IN (
      'creating', 'pending', 'paid', 'expired', 'failed',
      'refund_pending', 'refunded'
    )
  ),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  checkout_url TEXT,
  expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_one_active_checkout
  ON public.payment_orders(game_id, player_id)
  WHERE status IN ('creating', 'pending');
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_one_paid_reservation
  ON public.payment_orders(game_id, player_id)
  WHERE status IN ('paid', 'refund_pending');
CREATE INDEX IF NOT EXISTS idx_payment_orders_player_created
  ON public.payment_orders(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_game_status
  ON public.payment_orders(game_id, status);

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY CHECK (char_length(event_id) BETWEEN 8 AND 255),
  event_type TEXT NOT NULL CHECK (char_length(event_type) BETWEEN 3 AND 120),
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  result JSONB NOT NULL DEFAULT '{}'::JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_orders FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.stripe_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_orders, public.stripe_webhook_events TO service_role;

CREATE OR REPLACE FUNCTION public.recompute_game_capacity(p_game_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  confirmed_count INTEGER;
  held_count INTEGER;
BEGIN
  IF p_game_id IS NULL THEN
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

CREATE OR REPLACE FUNCTION public.sync_game_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game_id UUID;
BEGIN
  target_game_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.game_id
    ELSE NEW.game_id
  END;
  PERFORM public.recompute_game_capacity(target_game_id);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_game_capacity_after_change
  ON public.game_participants;
CREATE TRIGGER sync_game_capacity_after_change
AFTER INSERT OR DELETE ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_game_capacity();

DROP TRIGGER IF EXISTS sync_game_capacity_after_payment_change
  ON public.payment_orders;
CREATE TRIGGER sync_game_capacity_after_payment_change
AFTER INSERT OR UPDATE OF status, expires_at OR DELETE ON public.payment_orders
FOR EACH ROW EXECUTE FUNCTION public.sync_game_capacity();

CREATE OR REPLACE FUNCTION public.set_payment_order_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_payment_order_updated_at ON public.payment_orders;
CREATE TRIGGER set_payment_order_updated_at
BEFORE UPDATE ON public.payment_orders
FOR EACH ROW EXECUTE FUNCTION public.set_payment_order_updated_at();

-- Sólo una Edge Function con service_role puede abrir un pedido. Así se evita
-- que un cliente reserve inventario manipulando RPC internos.
CREATE OR REPLACE FUNCTION public.prepare_payment_order(
  p_game_id UUID,
  p_player_id UUID
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
  confirmed_reservations INTEGER;
  held_reservations INTEGER;
  occupied_seats INTEGER;
  recent_attempts INTEGER;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;

  IF p_game_id IS NULL OR p_player_id IS NULL THEN
    RAISE EXCEPTION 'Solicitud de pago no válida';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_player_id::TEXT, 0));

  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Perfil de jugador no encontrado';
  END IF;
  IF target_game.master_id = p_player_id THEN
    RAISE EXCEPTION 'No puedes reservar tu propia partida';
  END IF;
  IF target_game.status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'La partida no admite nuevas reservas';
  END IF;
  IF target_game.start_date IS NOT NULL AND target_game.start_date <= NOW() THEN
    RAISE EXCEPTION 'La partida ya ha comenzado';
  END IF;
  IF target_game.price = 0 THEN
    RAISE EXCEPTION 'Esta partida no requiere pago';
  END IF;
  IF target_game.price < 0.50 THEN
    RAISE EXCEPTION 'El precio mínimo para cobrar con tarjeta es 0,50 €';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.game_participants
    WHERE game_id = p_game_id AND player_id = p_player_id
  ) THEN
    RAISE EXCEPTION 'Ya tienes una plaza confirmada en esta partida';
  END IF;

  UPDATE public.payment_orders
  SET status = CASE WHEN status = 'pending' THEN 'expired' ELSE 'failed' END
  WHERE game_id = p_game_id
    AND player_id = p_player_id
    AND (
      (status = 'pending' AND expires_at <= NOW())
      OR (status = 'creating' AND created_at <= NOW() - INTERVAL '5 minutes')
    );

  SELECT * INTO existing_order
  FROM public.payment_orders
  WHERE game_id = p_game_id
    AND player_id = p_player_id
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
      'expiresAt', existing_order.expires_at
    );
  END IF;

  SELECT COUNT(*)::INTEGER INTO recent_attempts
  FROM public.payment_orders
  WHERE player_id = p_player_id
    AND created_at > NOW() - INTERVAL '1 hour';
  IF recent_attempts >= 10 THEN
    RAISE EXCEPTION 'Demasiados intentos de pago. Inténtalo más tarde';
  END IF;

  SELECT COUNT(*)::INTEGER INTO confirmed_reservations
  FROM public.game_participants AS participant
  JOIN public.games AS game ON game.id = participant.game_id
  WHERE participant.player_id = p_player_id
    AND game.status IN ('active', 'full')
    AND (game.start_date IS NULL OR game.start_date > NOW());

  SELECT COUNT(*)::INTEGER INTO held_reservations
  FROM public.payment_orders AS payment
  JOIN public.games AS game ON game.id = payment.game_id
  WHERE payment.player_id = p_player_id
    AND game.status IN ('active', 'full')
    AND (game.start_date IS NULL OR game.start_date > NOW())
    AND (
      (payment.status = 'pending' AND payment.expires_at > NOW())
      OR (
        payment.status = 'creating'
        AND payment.created_at > NOW() - INTERVAL '5 minutes'
      )
    );
  IF confirmed_reservations + held_reservations >= 5 THEN
    RAISE EXCEPTION 'Has alcanzado el límite de 5 reservas activas';
  END IF;

  SELECT
    (SELECT COUNT(*) FROM public.game_participants WHERE game_id = p_game_id)
    +
    (SELECT COUNT(*) FROM public.payment_orders
      WHERE game_id = p_game_id
        AND (
          (status = 'pending' AND expires_at > NOW())
          OR (status = 'creating' AND created_at > NOW() - INTERVAL '5 minutes')
        ))
  INTO occupied_seats;

  IF occupied_seats >= target_game.max_players THEN
    PERFORM public.recompute_game_capacity(p_game_id);
    RAISE EXCEPTION 'La partida está completa';
  END IF;

  INSERT INTO public.payment_orders (
    game_id, player_id, game_title, amount_cents, currency
  ) VALUES (
    p_game_id,
    p_player_id,
    target_game.title,
    ROUND(target_game.price * 100)::INTEGER,
    target_game.currency
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
    'expiresAt', created_order.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.activate_payment_order(
  p_order_id UUID,
  p_player_id UUID,
  p_session_id TEXT,
  p_checkout_url TEXT,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_order public.payment_orders%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;
  IF p_session_id !~ '^cs_(test_|live_)?[A-Za-z0-9_]+$'
    OR p_checkout_url !~ '^https://checkout\.stripe\.com/'
    OR p_expires_at < NOW() + INTERVAL '25 minutes'
    OR p_expires_at > NOW() + INTERVAL '24 hours 5 minutes' THEN
    RAISE EXCEPTION 'Sesión de Stripe no válida';
  END IF;

  SELECT * INTO target_order
  FROM public.payment_orders
  WHERE id = p_order_id AND player_id = p_player_id
  FOR UPDATE;
  IF NOT FOUND OR target_order.status NOT IN ('creating', 'pending') THEN
    RAISE EXCEPTION 'Pedido de pago no disponible';
  END IF;
  IF target_order.stripe_checkout_session_id IS NOT NULL
    AND target_order.stripe_checkout_session_id <> p_session_id THEN
    RAISE EXCEPTION 'El pedido ya tiene otra sesión de pago';
  END IF;

  UPDATE public.payment_orders
  SET status = 'pending',
      stripe_checkout_session_id = p_session_id,
      checkout_url = p_checkout_url,
      expires_at = p_expires_at
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_payment_order(
  p_order_id UUID,
  p_player_id UUID
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
  UPDATE public.payment_orders
  SET status = 'failed'
  WHERE id = p_order_id
    AND player_id = p_player_id
    AND status = 'creating';
END;
$$;

CREATE OR REPLACE FUNCTION public.process_stripe_event(
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
  occupied_without_order INTEGER;
  player_commitments INTEGER;
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
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Pedido asociado a Stripe no encontrado';
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
        'status', 'paid', 'needsRefund', FALSE
      );
    ELSIF target_order.status IN ('refund_pending', 'refunded') THEN
      response_result := jsonb_build_object(
        'processed', TRUE, 'orderId', target_order.id,
        'status', target_order.status,
        'needsRefund', target_order.status = 'refund_pending',
        'paymentIntentId', COALESCE(
          target_order.stripe_payment_intent_id, payment_intent_id
        )
      );
    ELSE
      SELECT * INTO target_game
      FROM public.games
      WHERE id = target_order.game_id
      FOR UPDATE;

      IF NOT FOUND
        OR target_game.status IN ('cancelled', 'completed')
        OR (
          target_game.start_date IS NOT NULL
          AND target_game.start_date <= NOW()
        ) THEN
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
        SELECT
          (SELECT COUNT(*) FROM public.game_participants
            WHERE game_id = target_order.game_id)
          +
          (SELECT COUNT(*) FROM public.payment_orders
            WHERE game_id = target_order.game_id
              AND id <> target_order.id
              AND (
                (status = 'pending' AND expires_at > NOW())
                OR (
                  status = 'creating'
                  AND created_at > NOW() - INTERVAL '5 minutes'
                )
              ))
        INTO occupied_without_order;

        SELECT
          (SELECT COUNT(*)
            FROM public.game_participants AS participant
            JOIN public.games AS game ON game.id = participant.game_id
            WHERE participant.player_id = target_order.player_id
              AND game.status IN ('active', 'full')
              AND (game.start_date IS NULL OR game.start_date > NOW()))
          +
          (SELECT COUNT(*)
            FROM public.payment_orders AS payment
            JOIN public.games AS game ON game.id = payment.game_id
            WHERE payment.player_id = target_order.player_id
              AND payment.id <> target_order.id
              AND game.status IN ('active', 'full')
              AND (game.start_date IS NULL OR game.start_date > NOW())
              AND (
                (payment.status = 'pending' AND payment.expires_at > NOW())
                OR (
                  payment.status = 'creating'
                  AND payment.created_at > NOW() - INTERVAL '5 minutes'
                )
              ))
        INTO player_commitments;

        IF occupied_without_order >= target_game.max_players
          OR player_commitments >= 5 THEN
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

          INSERT INTO public.game_participants (game_id, player_id)
          VALUES (target_order.game_id, target_order.player_id)
          ON CONFLICT (game_id, player_id) DO NOTHING;

          response_result := jsonb_build_object(
            'processed', TRUE, 'orderId', target_order.id,
            'status', 'paid', 'needsRefund', FALSE
          );
        END IF;
      END IF;
    END IF;
  ELSIF p_event_type = 'checkout.session.expired' THEN
    UPDATE public.payment_orders
    SET status = 'expired', checkout_url = NULL
    WHERE stripe_checkout_session_id = session_id
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
    FOR UPDATE;
    IF FOUND THEN
      UPDATE public.payment_orders
      SET status = 'refunded', refunded_at = COALESCE(refunded_at, NOW())
      WHERE id = target_order.id;

      DELETE FROM public.game_participants AS participant
      USING public.games AS game
      WHERE participant.game_id = target_order.game_id
        AND participant.player_id = target_order.player_id
        AND game.id = participant.game_id
        AND game.status IN ('active', 'full');

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
    p_event_id,
    p_event_type,
    CASE
      WHEN response_result ->> 'orderId' IS NULL THEN NULL
      ELSE (response_result ->> 'orderId')::UUID
    END,
    response_result
  );

  RETURN response_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_payment_refunded(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_order public.payment_orders%ROWTYPE;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;
  SELECT * INTO target_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido no encontrado';
  END IF;

  UPDATE public.payment_orders
  SET status = 'refunded', refunded_at = COALESCE(refunded_at, NOW())
  WHERE id = p_order_id AND status IN ('paid', 'refund_pending', 'refunded');

  DELETE FROM public.game_participants AS participant
  USING public.games AS game
  WHERE participant.game_id = target_order.game_id
    AND participant.player_id = target_order.player_id
    AND game.id = participant.game_id
    AND game.status IN ('active', 'full');
END;
$$;

CREATE OR REPLACE FUNCTION public.prepare_game_cancellation(
  p_game_id UUID,
  p_actor_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game public.games%ROWTYPE;
  cancellation_orders JSONB;
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Operación no permitida';
  END IF;

  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF target_game.master_id <> p_actor_id AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_actor_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para cancelar esta partida';
  END IF;
  IF target_game.status = 'completed' THEN
    RAISE EXCEPTION 'Una partida completada no puede cancelarse';
  END IF;

  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'orderId', id,
      'status', status,
      'sessionId', stripe_checkout_session_id,
      'paymentIntentId', stripe_payment_intent_id
    )),
    '[]'::JSONB
  )
  INTO cancellation_orders
  FROM public.payment_orders
  WHERE game_id = p_game_id
    AND status IN ('creating', 'pending', 'paid', 'refund_pending');

  UPDATE public.games
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_game_id;

  UPDATE public.payment_orders
  SET status = CASE
        WHEN status IN ('creating', 'pending') THEN 'expired'
        ELSE 'refund_pending'
      END,
      checkout_url = NULL
  WHERE game_id = p_game_id
    AND status IN ('creating', 'pending', 'paid', 'refund_pending');

  RETURN jsonb_build_object(
    'gameId', p_game_id,
    'orders', cancellation_orders
  );
END;
$$;

-- Las partidas de pago sólo se confirman mediante el webhook.
CREATE OR REPLACE FUNCTION public.join_game(p_game_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  target_game public.games%ROWTYPE;
  participant_count INTEGER;
  held_count INTEGER;
  active_reservations INTEGER;
  active_holds INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(current_user_id::TEXT, 0));
  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Partida no encontrada'; END IF;
  IF target_game.master_id = current_user_id THEN
    RAISE EXCEPTION 'No puedes apuntarte a tu propia partida';
  END IF;
  IF target_game.price > 0 THEN
    RAISE EXCEPTION 'Esta partida requiere pago seguro con Stripe';
  END IF;
  IF target_game.status IN ('cancelled', 'completed') THEN
    RAISE EXCEPTION 'La partida no admite nuevas reservas';
  END IF;
  IF target_game.start_date IS NOT NULL AND target_game.start_date <= NOW() THEN
    RAISE EXCEPTION 'La partida ya ha comenzado';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.game_participants
    WHERE game_id = p_game_id AND player_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'Ya estás apuntado a esta partida';
  END IF;

  SELECT COUNT(*)::INTEGER INTO active_reservations
  FROM public.game_participants AS participant
  JOIN public.games AS game ON game.id = participant.game_id
  WHERE participant.player_id = current_user_id
    AND game.status IN ('active', 'full')
    AND (game.start_date IS NULL OR game.start_date > NOW());
  SELECT COUNT(*)::INTEGER INTO active_holds
  FROM public.payment_orders AS payment
  JOIN public.games AS game ON game.id = payment.game_id
  WHERE payment.player_id = current_user_id
    AND game.status IN ('active', 'full')
    AND (game.start_date IS NULL OR game.start_date > NOW())
    AND (
      (payment.status = 'pending' AND payment.expires_at > NOW())
      OR (
        payment.status = 'creating'
        AND payment.created_at > NOW() - INTERVAL '5 minutes'
      )
    );
  IF active_reservations + active_holds >= 5 THEN
    RAISE EXCEPTION 'Has alcanzado el límite de 5 reservas activas';
  END IF;

  SELECT COUNT(*)::INTEGER INTO participant_count
  FROM public.game_participants WHERE game_id = p_game_id;
  SELECT COUNT(*)::INTEGER INTO held_count
  FROM public.payment_orders
  WHERE game_id = p_game_id
    AND (
      (status = 'pending' AND expires_at > NOW())
      OR (status = 'creating' AND created_at > NOW() - INTERVAL '5 minutes')
    );
  IF participant_count + held_count >= target_game.max_players THEN
    PERFORM public.recompute_game_capacity(p_game_id);
    RAISE EXCEPTION 'La partida está completa';
  END IF;

  INSERT INTO public.game_participants (game_id, player_id)
  VALUES (p_game_id, current_user_id);
  RETURN jsonb_build_object(
    'gameId', p_game_id,
    'currentPlayers', participant_count + held_count + 1,
    'maxPlayers', target_game.max_players
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_game(p_game_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  deleted_count INTEGER;
  target_game public.games%ROWTYPE;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  SELECT * INTO target_game
  FROM public.games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Partida no encontrada'; END IF;
  IF target_game.status IN ('cancelled', 'completed')
    OR (target_game.start_date IS NOT NULL AND target_game.start_date <= NOW()) THEN
    RAISE EXCEPTION 'No puedes abandonar una partida iniciada o cerrada';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.payment_orders
    WHERE game_id = p_game_id
      AND player_id = current_user_id
      AND status IN ('paid', 'refund_pending')
  ) THEN
    RAISE EXCEPTION 'Las reservas pagadas se cancelan mediante soporte para gestionar el reembolso';
  END IF;

  DELETE FROM public.game_participants
  WHERE game_id = p_game_id AND player_id = current_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  IF deleted_count = 0 THEN
    RAISE EXCEPTION 'No estabas apuntado a esta partida';
  END IF;
  RETURN jsonb_build_object('gameId', p_game_id, 'left', TRUE);
END;
$$;

-- Los cobros y sesiones pendientes deben pasar por cancel-game para expirar o
-- devolver dinero; las partidas gratuitas mantienen el RPC original.
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
  SELECT * INTO target_game FROM public.games WHERE id = p_game_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Partida no encontrada'; END IF;
  IF target_game.master_id <> auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar esta partida';
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

CREATE OR REPLACE FUNCTION public.protect_financial_game_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() <> 'service_role'
    AND (
      OLD.price IS DISTINCT FROM NEW.price
      OR OLD.currency IS DISTINCT FROM NEW.currency
      OR OLD.start_date IS DISTINCT FROM NEW.start_date
      OR OLD.max_players IS DISTINCT FROM NEW.max_players
      OR OLD.master_id IS DISTINCT FROM NEW.master_id
    )
    AND EXISTS (
      SELECT 1 FROM public.payment_orders
      WHERE game_id = OLD.id
        AND status IN ('creating', 'pending', 'paid', 'refund_pending')
    ) THEN
    RAISE EXCEPTION 'No puedes cambiar precio, fecha o plazas con pagos activos';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_financial_game_fields_before_update
  ON public.games;
CREATE TRIGGER protect_financial_game_fields_before_update
BEFORE UPDATE ON public.games
FOR EACH ROW EXECUTE FUNCTION public.protect_financial_game_fields();

CREATE OR REPLACE FUNCTION public.game_has_financial_orders(p_game_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.payment_orders
    WHERE game_id = p_game_id
      AND status IN ('paid', 'refund_pending')
  );
$$;

REVOKE ALL ON FUNCTION public.game_has_financial_orders(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.game_has_financial_orders(UUID) TO authenticated;

DROP POLICY IF EXISTS "games_update_before_start" ON public.games;
CREATE POLICY "games_update_before_start"
  ON public.games FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = master_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    (
      auth.uid() = master_id
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
    AND start_date IS NOT NULL
    AND start_date > NOW()
    AND description IS NOT NULL
    AND image_url IS NOT NULL
    AND master_contact IS NOT NULL
    AND char_length(btrim(master_contact)) > 0
    AND current_players + pending_players <= max_players
    AND (game_type NOT IN ('Presencial', 'Híbrida') OR char_length(btrim(city)) > 0)
  );

DROP POLICY IF EXISTS "games_delete_without_reservations" ON public.games;
CREATE POLICY "games_delete_without_reservations"
  ON public.games FOR DELETE
  TO authenticated
  USING (
    current_players = 0
    AND pending_players = 0
    AND NOT public.game_has_financial_orders(id)
    AND (
      auth.uid() = master_id
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Privilegios por columna: el cliente no puede falsificar estado, aforo,
-- rating, moneda o timestamps ni siquiera si descubre la API REST.
REVOKE INSERT, UPDATE ON public.games FROM authenticated;
GRANT INSERT (
  master_id, title, description, image_url, game_system, game_type, tags,
  language, min_age, start_date, max_players, price, city, schedule,
  temporalidad, recommendations, master_contact, tools_needed,
  use_x_card, camera_mandatory, microphone_mandatory
) ON public.games TO authenticated;
GRANT UPDATE (
  title, description, image_url, game_system, game_type, tags,
  language, min_age, start_date, max_players, price, city, schedule,
  temporalidad, recommendations, master_contact, tools_needed,
  use_x_card, camera_mandatory, microphone_mandatory
) ON public.games TO authenticated;

REVOKE ALL ON FUNCTION public.prepare_payment_order(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_payment_order(UUID, UUID, TEXT, TEXT, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fail_payment_order(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_stripe_event(TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_payment_refunded(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.prepare_game_cancellation(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prepare_payment_order(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_payment_order(UUID, UUID, TEXT, TEXT, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_payment_order(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_stripe_event(TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_payment_refunded(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.prepare_game_cancellation(UUID, UUID) TO service_role;

REVOKE ALL ON FUNCTION public.join_game(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_game(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_game_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_game(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_game(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_game_status(UUID, TEXT) TO authenticated;

-- El borrado autoservicio se pausa mientras existan cobros o reembolsos vivos.
-- Soporte puede resolverlos y después completar la supresión/anonimización.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = current_user_id) THEN
    RAISE EXCEPTION 'Cuenta no encontrada';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM public.payment_orders AS payment
    LEFT JOIN public.games AS game ON game.id = payment.game_id
    WHERE payment.player_id = current_user_id
      AND (
        payment.status IN ('creating', 'pending', 'refund_pending')
        OR (
          payment.status = 'paid'
          AND game.status IN ('active', 'full')
          AND (game.start_date IS NULL OR game.start_date > NOW())
        )
      )
  ) OR EXISTS (
    SELECT 1
    FROM public.payment_orders AS payment
    JOIN public.games AS game ON game.id = payment.game_id
    WHERE game.master_id = current_user_id
      AND (
        payment.status IN ('creating', 'pending', 'refund_pending')
        OR (
          payment.status = 'paid'
          AND game.status IN ('active', 'full')
          AND (game.start_date IS NULL OR game.start_date > NOW())
        )
      )
  ) THEN
    RAISE EXCEPTION 'Contacta con soporte para resolver pagos activos antes de eliminar la cuenta';
  END IF;

  DELETE FROM auth.users WHERE id = current_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Cuenta no encontrada'; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
