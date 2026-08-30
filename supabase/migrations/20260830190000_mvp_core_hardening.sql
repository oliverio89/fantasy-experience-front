BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version TEXT;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length
    CHECK (full_name IS NULL OR char_length(btrim(full_name)) BETWEEN 2 AND 80) NOT VALID,
  ADD CONSTRAINT profiles_bio_length
    CHECK (bio IS NULL OR char_length(bio) <= 2000) NOT VALID,
  ADD CONSTRAINT profiles_city_length
    CHECK (city IS NULL OR char_length(city) <= 100) NOT VALID,
  ADD CONSTRAINT profiles_timezone_length
    CHECK (timezone IS NULL OR char_length(timezone) <= 64) NOT VALID,
  ADD CONSTRAINT profiles_sistemas_limit
    CHECK (cardinality(sistemas) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_tipos_partida_limit
    CHECK (cardinality(tipos_partida) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_estilos_limit
    CHECK (cardinality(estilos) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_idiomas_limit
    CHECK (cardinality(idiomas) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_tags_limit
    CHECK (cardinality(tags) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_duracion_sesion_limit
    CHECK (cardinality(duracion_sesion) <= 20) NOT VALID,
  ADD CONSTRAINT profiles_numero_jugadores_limit
    CHECK (cardinality(numero_jugadores) <= 20) NOT VALID;

ALTER TABLE public.games
  ADD CONSTRAINT games_title_length
    CHECK (char_length(btrim(title)) BETWEEN 3 AND 120) NOT VALID,
  ADD CONSTRAINT games_description_length
    CHECK (description IS NULL OR char_length(btrim(description)) BETWEEN 20 AND 5000) NOT VALID,
  ADD CONSTRAINT games_system_length
    CHECK (char_length(btrim(game_system)) BETWEEN 1 AND 80) NOT VALID,
  ADD CONSTRAINT games_tags_limit
    CHECK (cardinality(tags) <= 20) NOT VALID,
  ADD CONSTRAINT games_city_length
    CHECK (city IS NULL OR char_length(city) <= 100) NOT VALID,
  ADD CONSTRAINT games_contact_length
    CHECK (master_contact IS NULL OR char_length(master_contact) <= 500) NOT VALID,
  ADD CONSTRAINT games_image_url_length
    CHECK (image_url IS NULL OR char_length(image_url) <= 2048) NOT VALID,
  ADD CONSTRAINT games_language_length
    CHECK (language IS NULL OR char_length(language) <= 50) NOT VALID,
  ADD CONSTRAINT games_schedule_length
    CHECK (schedule IS NULL OR char_length(schedule) <= 100) NOT VALID,
  ADD CONSTRAINT games_recommendations_length
    CHECK (recommendations IS NULL OR char_length(recommendations) <= 2000) NOT VALID,
  ADD CONSTRAINT games_tools_limit
    CHECK (cardinality(tools_needed) <= 20) NOT VALID;

ALTER TABLE public.master_videos
  ADD CONSTRAINT master_videos_youtube_url
    CHECK (
      youtube_url ~* '^https://(((www|m)\.)?(youtube\.com|youtube-nocookie\.com)/|youtu\.be/)'
    ) NOT VALID,
  ADD CONSTRAINT master_videos_title_length
    CHECK (char_length(btrim(title)) BETWEEN 3 AND 150) NOT VALID,
  ADD CONSTRAINT master_videos_description_length
    CHECK (description IS NULL OR char_length(description) <= 2000) NOT VALID;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('games-images', 'games-images', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

-- Nunca aceptar el rol admin desde metadata controlada por el registro público.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data ->> 'legal_accepted', 'false') <> 'true' THEN
    RAISE EXCEPTION 'Debes aceptar los términos y la política de privacidad';
  END IF;

  INSERT INTO public.profiles (
    id, full_name, avatar_url, city, role, terms_accepted_at, terms_version
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'city',
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' = 'master' THEN 'master'
      ELSE 'player'
    END,
    NOW(),
    COALESCE(NEW.raw_user_meta_data ->> 'legal_version', '2026-08-30')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- El contador público evita exponer la identidad de todos los participantes.
ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS current_players INTEGER NOT NULL DEFAULT 0
  CHECK (current_players >= 0);

UPDATE public.games AS game
SET current_players = (
  SELECT COUNT(*)::INTEGER
  FROM public.game_participants AS participant
  WHERE participant.game_id = game.id
);

ALTER TABLE public.games
  ADD CONSTRAINT games_capacity_consistent
  CHECK (current_players <= max_players) NOT VALID;

CREATE OR REPLACE FUNCTION public.sync_game_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game_id UUID;
  participant_count INTEGER;
BEGIN
  target_game_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.game_id
    ELSE NEW.game_id
  END;

  SELECT COUNT(*)::INTEGER
  INTO participant_count
  FROM public.game_participants
  WHERE game_id = target_game_id;

  UPDATE public.games
  SET
    current_players = participant_count,
    status = CASE
      WHEN status IN ('cancelled', 'completed') THEN status
      WHEN participant_count >= max_players THEN 'full'
      ELSE 'active'
    END,
    updated_at = NOW()
  WHERE id = target_game_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_game_capacity_after_change
  ON public.game_participants;
CREATE TRIGGER sync_game_capacity_after_change
AFTER INSERT OR DELETE ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.sync_game_capacity();

CREATE OR REPLACE FUNCTION public.can_publish_game(requested_master_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    auth.uid() = requested_master_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid() AND role IN ('master', 'admin')
    )
    AND (
      SELECT COUNT(*)
      FROM public.games
      WHERE master_id = auth.uid() AND status IN ('active', 'full')
    ) < CASE
      WHEN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ) THEN 50
      ELSE 5
    END;
$$;

-- Serializa las publicaciones de un mismo usuario para que el límite no pueda
-- superarse con dos peticiones simultáneas.
CREATE OR REPLACE FUNCTION public.enforce_game_publication_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_role TEXT;
  active_games INTEGER;
  game_limit INTEGER;
BEGIN
  IF current_user_id IS NULL OR current_user_id <> NEW.master_id THEN
    RAISE EXCEPTION 'No tienes permiso para publicar esta partida';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(current_user_id::TEXT, 0)
  );

  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = current_user_id;

  IF current_role NOT IN ('master', 'admin') THEN
    RAISE EXCEPTION 'Solo los perfiles de Máster pueden publicar partidas';
  END IF;

  game_limit := CASE WHEN current_role = 'admin' THEN 50 ELSE 5 END;
  SELECT COUNT(*)::INTEGER INTO active_games
  FROM public.games
  WHERE master_id = current_user_id AND status IN ('active', 'full');

  IF active_games >= game_limit THEN
    RAISE EXCEPTION 'Has alcanzado el límite de % partidas publicadas', game_limit;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_game_publication_limit_before_insert
  ON public.games;
CREATE TRIGGER enforce_game_publication_limit_before_insert
BEFORE INSERT ON public.games
FOR EACH ROW EXECUTE FUNCTION public.enforce_game_publication_limit();

CREATE OR REPLACE FUNCTION public.can_current_user_view_profile(
  requested_profile_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS requested_profile
    WHERE requested_profile.id = requested_profile_id
      AND (
        requested_profile.role IN ('master', 'admin')
        OR requested_profile.id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles AS current_profile
          WHERE current_profile.id = auth.uid() AND current_profile.role = 'admin'
        )
        OR EXISTS (
          SELECT 1
          FROM public.game_participants AS participant
          JOIN public.games AS game ON game.id = participant.game_id
          WHERE participant.player_id = requested_profile_id
            AND game.master_id = auth.uid()
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_current_user_view_profile(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_current_user_view_profile(UUID)
  TO anon, authenticated;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_visible" ON public.profiles;
CREATE POLICY "profiles_select_visible"
  ON public.profiles FOR SELECT
  USING (public.can_current_user_view_profile(id));

CREATE OR REPLACE FUNCTION public.is_current_user_game_participant(
  requested_game_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1
    FROM public.game_participants
    WHERE game_id = requested_game_id AND player_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_current_user_game_participant(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_game_participant(UUID)
  TO anon, authenticated;

-- El catálogo es público; el historial sólo lo ven las personas implicadas.
DROP POLICY IF EXISTS "games_select_public" ON public.games;
DROP POLICY IF EXISTS "games_select_visible" ON public.games;
CREATE POLICY "games_select_visible"
  ON public.games FOR SELECT
  USING (
    status IN ('active', 'full')
    OR auth.uid() = master_id
    OR public.is_current_user_game_participant(id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "games_insert_authenticated" ON public.games;
DROP POLICY IF EXISTS "games_insert_master" ON public.games;
CREATE POLICY "games_insert_master"
  ON public.games FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_publish_game(master_id)
    AND description IS NOT NULL
    AND image_url IS NOT NULL
    AND start_date IS NOT NULL
    AND start_date > NOW()
    AND master_contact IS NOT NULL
    AND char_length(btrim(master_contact)) > 0
    AND (game_type NOT IN ('Presencial', 'Híbrida') OR char_length(btrim(city)) > 0)
  );

DROP POLICY IF EXISTS "games_update_own" ON public.games;
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
    AND (game_type NOT IN ('Presencial', 'Híbrida') OR char_length(btrim(city)) > 0)
  );

-- Una partida con reservas conserva su historial: se cancela, no se elimina.
DROP POLICY IF EXISTS "games_delete_own" ON public.games;
CREATE POLICY "games_delete_without_reservations"
  ON public.games FOR DELETE
  TO authenticated
  USING (
    current_players = 0
    AND (
      auth.uid() = master_id
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Las columnas de confianza nunca se escriben directamente desde el cliente.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, full_name, avatar_url, bio, city, role, sistemas,
  tipos_partida, estilos, idiomas, tags, duracion_sesion, numero_jugadores,
  experiencia, disponibilidad, precio_por_sesion, timezone, rating,
  total_reviews, created_at, updated_at
) ON public.profiles TO anon, authenticated;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  full_name, avatar_url, bio, city, sistemas,
  tipos_partida, estilos, idiomas, tags, duracion_sesion,
  numero_jugadores, experiencia, disponibilidad, precio_por_sesion,
  timezone, updated_at
) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "master_videos_insert_own" ON public.master_videos;
CREATE POLICY "master_videos_insert_master"
  ON public.master_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = master_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('master', 'admin')
    )
  );
DROP POLICY IF EXISTS "master_videos_update_own" ON public.master_videos;
CREATE POLICY "master_videos_update_own"
  ON public.master_videos FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = master_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('master', 'admin')
    )
  )
  WITH CHECK (auth.uid() = master_id);
DROP POLICY IF EXISTS "master_videos_delete_own" ON public.master_videos;
CREATE POLICY "master_videos_delete_own"
  ON public.master_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = master_id);

REVOKE INSERT, UPDATE ON public.master_videos FROM authenticated;
GRANT INSERT (
  master_id, youtube_url, title, description, game_system, num_players,
  duration_minutes, played_at
) ON public.master_videos TO authenticated;
GRANT UPDATE (
  youtube_url, title, description, game_system, num_players,
  duration_minutes, played_at
) ON public.master_videos TO authenticated;

REVOKE INSERT, UPDATE ON public.games FROM authenticated;
GRANT INSERT (
  master_id, title, description, image_url, game_system, game_type, tags,
  language, min_age, start_date, max_players, price, city, schedule,
  temporalidad, recommendations, master_contact, tools_needed,
  use_x_card, camera_mandatory, microphone_mandatory
) ON public.games TO authenticated;

-- Los datos de contacto no forman parte del catálogo público.
REVOKE SELECT ON public.games FROM anon, authenticated;
GRANT SELECT (
  id, master_id, title, description, image_url, game_system, game_type, tags,
  language, min_age, start_date, max_players, price, city, schedule,
  temporalidad, recommendations, tools_needed, use_x_card,
  camera_mandatory, microphone_mandatory, rating, status, current_players,
  created_at, updated_at
) ON public.games TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_game_contact(p_game_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  contact TEXT;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  SELECT games.master_contact
  INTO contact
  FROM public.games
  WHERE games.id = p_game_id
    AND (
      games.master_id = current_user_id
      OR EXISTS (
        SELECT 1 FROM public.game_participants
        WHERE game_id = p_game_id AND player_id = current_user_id
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = current_user_id AND role = 'admin'
      )
    );

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN contact;
END;
$$;

REVOKE ALL ON FUNCTION public.get_game_contact(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_game_contact(UUID) TO authenticated;
GRANT UPDATE (
  title, description, image_url, game_system, game_type, tags,
  language, min_age, start_date, max_players, price, city, schedule,
  temporalidad, recommendations, master_contact, tools_needed,
  use_x_card, camera_mandatory, microphone_mandatory, updated_at
) ON public.games TO authenticated;

DROP POLICY IF EXISTS "participants_select_public"
  ON public.game_participants;
DROP POLICY IF EXISTS "participants_select_involved"
  ON public.game_participants;
CREATE POLICY "participants_select_involved"
  ON public.game_participants FOR SELECT
  TO authenticated
  USING (
    auth.uid() = player_id
    OR EXISTS (
      SELECT 1 FROM public.games
      WHERE games.id = game_id AND games.master_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Las altas y bajas de participantes solo pasan por las funciones atómicas.
REVOKE INSERT, DELETE ON public.game_participants FROM anon, authenticated;

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
  active_reservations INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(current_user_id::TEXT, 0)
  );

  SELECT * INTO target_game
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF target_game.master_id = current_user_id THEN
    RAISE EXCEPTION 'No puedes apuntarte a tu propia partida';
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

  IF active_reservations >= 5 THEN
    RAISE EXCEPTION 'Has alcanzado el límite de 5 reservas activas';
  END IF;

  SELECT COUNT(*)::INTEGER INTO participant_count
  FROM public.game_participants
  WHERE game_id = p_game_id;

  IF participant_count >= target_game.max_players THEN
    UPDATE public.games SET status = 'full' WHERE id = p_game_id;
    RAISE EXCEPTION 'La partida está completa';
  END IF;

  INSERT INTO public.game_participants (game_id, player_id)
  VALUES (p_game_id, current_user_id);

  RETURN jsonb_build_object(
    'gameId', p_game_id,
    'currentPlayers', participant_count + 1,
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
  FROM public.games
  WHERE id = p_game_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF target_game.status IN ('cancelled', 'completed')
    OR (target_game.start_date IS NOT NULL AND target_game.start_date <= NOW()) THEN
    RAISE EXCEPTION 'No puedes abandonar una partida iniciada o cerrada';
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
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Partida no encontrada';
  END IF;
  IF target_game.master_id <> auth.uid() AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para cambiar esta partida';
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
      WHEN p_status = 'active' AND current_players >= max_players THEN 'full'
      ELSE p_status
    END,
    updated_at = NOW()
  WHERE id = p_game_id;
END;
$$;

REVOKE ALL ON FUNCTION public.join_game(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_game(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_game_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_game(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_game(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_game_status(UUID, TEXT) TO authenticated;

-- Los perfiles anonimizados conservan la integridad del historial de terceros.
-- Las altas de perfiles siguen estando reservadas al trigger de auth.
DO $$
DECLARE
  profile_auth_fk RECORD;
BEGIN
  FOR profile_auth_fk IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND confrelid = 'auth.users'::regclass
      AND contype = 'f'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.profiles DROP CONSTRAINT %I',
      profile_auth_fk.conname
    );
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.anonymize_user_data(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user_id) THEN
    RETURN;
  END IF;

  UPDATE public.games
  SET status = 'cancelled', updated_at = NOW()
  WHERE master_id = target_user_id AND status IN ('active', 'full');

  DELETE FROM public.game_participants AS participant
  USING public.games AS game
  WHERE participant.game_id = game.id
    AND participant.player_id = target_user_id
    AND game.status IN ('active', 'full');

  DELETE FROM public.master_reviews WHERE player_id = target_user_id;
  DELETE FROM public.master_videos WHERE master_id = target_user_id;
  EXECUTE 'DELETE FROM public.notifications WHERE recipient_id = $1'
    USING target_user_id;

  DELETE FROM public.games
  WHERE master_id = target_user_id AND current_players = 0;

  UPDATE public.games
  SET
    title = 'Partida de usuario eliminado',
    description = NULL,
    image_url = NULL,
    tags = '{}',
    city = NULL,
    schedule = NULL,
    recommendations = NULL,
    master_contact = NULL,
    tools_needed = '{}',
    updated_at = NOW()
  WHERE master_id = target_user_id;

  UPDATE public.profiles
  SET
    first_name = NULL,
    last_name = NULL,
    full_name = 'Usuario eliminado',
    avatar_url = NULL,
    bio = NULL,
    city = NULL,
    role = 'player',
    sistemas = '{}',
    tipos_partida = '{}',
    estilos = '{}',
    idiomas = '{}',
    tags = '{}',
    duracion_sesion = '{}',
    numero_jugadores = '{}',
    experiencia = NULL,
    disponibilidad = NULL,
    precio_por_sesion = NULL,
    timezone = NULL,
    rating = 0,
    total_reviews = 0,
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_user_data(UUID) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.anonymize_deleted_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.anonymize_user_data(OLD.id);
  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymize_deleted_auth_user() FROM PUBLIC;
DROP TRIGGER IF EXISTS anonymize_before_auth_user_delete ON auth.users;
CREATE TRIGGER anonymize_before_auth_user_delete
BEFORE DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.anonymize_deleted_auth_user();

-- Borrado autoservicio: cancela actividad, retira datos personales y elimina
-- exclusivamente al usuario de la sesión sin destruir reservas de terceros.
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

  DELETE FROM auth.users WHERE id = current_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cuenta no encontrada';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- Las reseñas solo corresponden a partidas completadas en las que participó el autor.
ALTER TABLE public.master_reviews
  DROP CONSTRAINT IF EXISTS master_reviews_master_id_player_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_one_per_game_player
  ON public.master_reviews(partida_id, player_id)
  WHERE partida_id IS NOT NULL;
ALTER TABLE public.master_reviews
  DROP CONSTRAINT IF EXISTS master_reviews_comment_length;
ALTER TABLE public.master_reviews
  ADD CONSTRAINT master_reviews_comment_length
  CHECK (char_length(btrim(comment)) BETWEEN 10 AND 1000) NOT VALID;

DROP POLICY IF EXISTS "reviews_select_public" ON public.master_reviews;
DROP POLICY IF EXISTS "reviews_select_involved" ON public.master_reviews;
CREATE POLICY "reviews_select_involved"
  ON public.master_reviews FOR SELECT
  USING (
    auth.uid() = player_id
    OR auth.uid() = master_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "reviews_insert_own" ON public.master_reviews;
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
        AND games.status = 'completed'
        AND game_participants.player_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "reviews_update_own" ON public.master_reviews;
DROP POLICY IF EXISTS "reviews_update_verified_participant" ON public.master_reviews;
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
        AND games.status = 'completed'
        AND game_participants.player_id = auth.uid()
    )
  );

REVOKE INSERT, UPDATE ON public.master_reviews FROM authenticated;
GRANT INSERT (partida_id, master_id, player_id, rating, comment)
  ON public.master_reviews TO authenticated;
GRANT UPDATE (rating, comment) ON public.master_reviews TO authenticated;

CREATE INDEX IF NOT EXISTS idx_games_active_start_date
  ON public.games(status, start_date);
CREATE INDEX IF NOT EXISTS idx_games_master_status
  ON public.games(master_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

-- Avisos internos de reserva y ciclo de vida.
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'reservation_created', 'reservation_cancelled',
      'game_cancelled', 'game_completed'
    )
  ),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());

REVOKE ALL ON public.notifications FROM anon, authenticated;
GRANT SELECT, UPDATE (read_at), DELETE ON public.notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_reservation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_game_id UUID;
  target_player_id UUID;
  target_master_id UUID;
  game_title TEXT;
  player_name TEXT;
BEGIN
  target_game_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.game_id
    ELSE NEW.game_id
  END;
  target_player_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.player_id
    ELSE NEW.player_id
  END;

  SELECT games.master_id, games.title
  INTO target_master_id, game_title
  FROM public.games
  WHERE games.id = target_game_id;

  SELECT COALESCE(profiles.full_name, 'Un jugador')
  INTO player_name
  FROM public.profiles
  WHERE profiles.id = target_player_id;

  IF target_master_id IS NULL
    OR game_title IS NULL
    OR NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = target_master_id
    ) THEN
    RETURN NULL;
  END IF;
  player_name := COALESCE(player_name, 'Un jugador');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (
      recipient_id, type, title, message, link
    ) VALUES (
      target_master_id,
      'reservation_created',
      'Nueva reserva',
      player_name || ' se ha apuntado a ' || game_title,
      '/detailsgame/' || target_game_id
    );
    INSERT INTO public.notifications (
      recipient_id, type, title, message, link
    ) VALUES (
      target_player_id,
      'reservation_created',
      'Reserva confirmada',
      'Tu plaza en ' || game_title || ' está confirmada',
      '/detailsgame/' || target_game_id
    );
  ELSE
    INSERT INTO public.notifications (
      recipient_id, type, title, message, link
    ) VALUES (
      target_master_id,
      'reservation_cancelled',
      'Reserva cancelada',
      player_name || ' ha cancelado su reserva en ' || game_title,
      '/detailsgame/' || target_game_id
    );
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS notify_reservation_after_change
  ON public.game_participants;
CREATE TRIGGER notify_reservation_after_change
AFTER INSERT OR DELETE ON public.game_participants
FOR EACH ROW EXECUTE FUNCTION public.notify_reservation_change();

CREATE OR REPLACE FUNCTION public.notify_game_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status
    AND NEW.status IN ('cancelled', 'completed') THEN
    INSERT INTO public.notifications (
      recipient_id, type, title, message, link
    )
    SELECT
      participant.player_id,
      CASE
        WHEN NEW.status = 'cancelled' THEN 'game_cancelled'
        ELSE 'game_completed'
      END,
      CASE
        WHEN NEW.status = 'cancelled' THEN 'Partida cancelada'
        ELSE 'Partida completada'
      END,
      CASE
        WHEN NEW.status = 'cancelled'
          THEN NEW.title || ' ha sido cancelada por el Máster'
        ELSE NEW.title || ' ha finalizado. Ya puedes dejar tu reseña'
      END,
      '/detailsgame/' || NEW.id
    FROM public.game_participants AS participant
    WHERE participant.game_id = NEW.id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS notify_game_status_after_update ON public.games;
CREATE TRIGGER notify_game_status_after_update
AFTER UPDATE OF status ON public.games
FOR EACH ROW EXECUTE FUNCTION public.notify_game_status_change();

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications(recipient_id, created_at DESC);

COMMIT;
