-- Puente idempotente para instalaciones creadas con el esquema histórico.
-- Normaliza tipos y valores antes de aplicar el hardening del MVP.

BEGIN;

-- La instalación histórica usaba el enum user_role. El esquema actual utiliza
-- TEXT para poder aplicar las mismas restricciones en instalaciones nuevas y
-- existentes sin depender de un tipo global previo.
DO $$
DECLARE
  role_data_type TEXT;
BEGIN
  SELECT data_type INTO role_data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role';

  IF role_data_type IS DISTINCT FROM 'text' THEN
    ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE public.profiles
      ALTER COLUMN role TYPE TEXT USING role::TEXT;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE role IS NOT NULL AND role NOT IN ('admin', 'master', 'player')
  ) THEN
    RAISE EXCEPTION 'Hay roles históricos que no se pueden migrar automáticamente';
  END IF;
END;
$$;

UPDATE public.profiles
SET
  role = COALESCE(role, 'player'),
  sistemas = COALESCE(sistemas, '{}'::TEXT[]),
  tipos_partida = COALESCE(tipos_partida, '{}'::TEXT[]),
  estilos = COALESCE(estilos, '{}'::TEXT[]),
  idiomas = COALESCE(idiomas, '{}'::TEXT[]),
  tags = COALESCE(tags, '{}'::TEXT[]),
  duracion_sesion = COALESCE(duracion_sesion, '{}'::TEXT[]),
  numero_jugadores = COALESCE(numero_jugadores, '{}'::TEXT[]),
  timezone = COALESCE(timezone, 'Europe/Madrid'),
  rating = COALESCE(rating, 0),
  total_reviews = COALESCE(total_reviews, 0),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'player',
  ALTER COLUMN role SET NOT NULL,
  ALTER COLUMN sistemas SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN sistemas SET NOT NULL,
  ALTER COLUMN tipos_partida SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN tipos_partida SET NOT NULL,
  ALTER COLUMN estilos SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN estilos SET NOT NULL,
  ALTER COLUMN idiomas SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN idiomas SET NOT NULL,
  ALTER COLUMN tags SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN duracion_sesion SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN duracion_sesion SET NOT NULL,
  ALTER COLUMN numero_jugadores SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN numero_jugadores SET NOT NULL,
  ALTER COLUMN timezone SET DEFAULT 'Europe/Madrid',
  ALTER COLUMN rating SET DEFAULT 0,
  ALTER COLUMN rating SET NOT NULL,
  ALTER COLUMN total_reviews SET DEFAULT 0,
  ALTER COLUMN total_reviews SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_compat_role_check,
  ADD CONSTRAINT profiles_compat_role_check
    CHECK (role IN ('admin', 'master', 'player')) NOT VALID;

-- Las fechas históricas no tenían hora. Se conservan como medianoche en la
-- zona del negocio para obtener TIMESTAMPTZ sin desplazar el día original.
DO $$
DECLARE
  start_date_type TEXT;
BEGIN
  SELECT data_type INTO start_date_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'start_date';

  IF start_date_type = 'date' THEN
    ALTER TABLE public.games
      ALTER COLUMN start_date TYPE TIMESTAMPTZ
      USING (start_date::TIMESTAMP AT TIME ZONE 'Europe/Madrid');
  END IF;
END;
$$;

-- La edad histórica admitía valores como "+18". Sólo se convierten los
-- formatos numéricos conocidos; un valor no interpretable queda sin edad.
DO $$
DECLARE
  min_age_type TEXT;
BEGIN
  SELECT data_type INTO min_age_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'min_age';

  IF min_age_type <> 'integer' THEN
    ALTER TABLE public.games
      ALTER COLUMN min_age TYPE INTEGER
      USING (
        CASE
          WHEN btrim(min_age::TEXT) ~ '^\+?[0-9]{1,2}$'
            THEN replace(btrim(min_age::TEXT), '+', '')::INTEGER
          ELSE NULL
        END
      );
  END IF;
END;
$$;

-- tools_needed era una cadena separada por comas y ahora es una lista.
DO $$
DECLARE
  tools_data_type TEXT;
BEGIN
  SELECT data_type INTO tools_data_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'games'
    AND column_name = 'tools_needed';

  IF tools_data_type <> 'ARRAY' THEN
    ALTER TABLE public.games
      ALTER COLUMN tools_needed TYPE TEXT[]
      USING (
        CASE
          WHEN tools_needed IS NULL OR btrim(tools_needed::TEXT) = '' THEN NULL
          ELSE regexp_split_to_array(btrim(tools_needed::TEXT), '\s*,\s*')
        END
      );
  END IF;
END;
$$;

UPDATE public.games
SET
  -- Las descripciones breves del prototipo se conservan y se marcan para que
  -- el master pueda completarlas más adelante sin incumplir el nuevo mínimo.
  description = CASE
    WHEN description IS NOT NULL AND char_length(btrim(description)) < 20
      THEN btrim(description) || ' · Información pendiente.'
    ELSE description
  END,
  game_type = CASE lower(btrim(game_type))
    WHEN 'digital' THEN 'Digital'
    WHEN 'online' THEN 'Online'
    WHEN 'presencial' THEN 'Presencial'
    WHEN 'híbrida' THEN 'Híbrida'
    WHEN 'hibrida' THEN 'Híbrida'
    ELSE game_type
  END,
  status = CASE lower(COALESCE(btrim(status), 'active'))
    WHEN 'open' THEN 'active'
    WHEN 'active' THEN 'active'
    WHEN 'full' THEN 'full'
    WHEN 'closed' THEN 'cancelled'
    WHEN 'canceled' THEN 'cancelled'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'completed' THEN 'completed'
    ELSE status
  END,
  game_system = COALESCE(NULLIF(btrim(game_system), ''), 'Sistema por concretar'),
  tags = COALESCE(tags, '{}'::TEXT[]),
  language = COALESCE(NULLIF(btrim(language), ''), 'Español'),
  max_players = COALESCE(max_players, 4),
  price = COALESCE(price, 0),
  use_x_card = COALESCE(use_x_card, FALSE),
  camera_mandatory = COALESCE(camera_mandatory, FALSE),
  microphone_mandatory = COALESCE(microphone_mandatory, TRUE),
  rating = COALESCE(rating, 0),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.games
    WHERE game_type IS NULL
      OR game_type NOT IN ('Digital', 'Presencial', 'Online', 'Híbrida')
  ) THEN
    RAISE EXCEPTION 'Hay modalidades históricas que requieren revisión manual';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.games
    WHERE status IS NULL
      OR status NOT IN ('active', 'full', 'cancelled', 'completed')
  ) THEN
    RAISE EXCEPTION 'Hay estados históricos que requieren revisión manual';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.games
    WHERE max_players NOT BETWEEN 1 AND 20 OR price < 0
  ) THEN
    RAISE EXCEPTION 'Hay aforos o precios históricos fuera de rango';
  END IF;
END;
$$;

ALTER TABLE public.games
  ALTER COLUMN game_system SET DEFAULT 'Sistema por concretar',
  ALTER COLUMN game_system SET NOT NULL,
  ALTER COLUMN game_type SET NOT NULL,
  ALTER COLUMN tags SET DEFAULT '{}'::TEXT[],
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN language SET DEFAULT 'Español',
  ALTER COLUMN language SET NOT NULL,
  ALTER COLUMN max_players SET DEFAULT 4,
  ALTER COLUMN max_players SET NOT NULL,
  ALTER COLUMN price SET DEFAULT 0,
  ALTER COLUMN price SET NOT NULL,
  ALTER COLUMN use_x_card SET DEFAULT FALSE,
  ALTER COLUMN use_x_card SET NOT NULL,
  ALTER COLUMN camera_mandatory SET DEFAULT FALSE,
  ALTER COLUMN camera_mandatory SET NOT NULL,
  ALTER COLUMN microphone_mandatory SET DEFAULT TRUE,
  ALTER COLUMN microphone_mandatory SET NOT NULL,
  ALTER COLUMN rating SET DEFAULT 0,
  ALTER COLUMN rating SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.games
  DROP CONSTRAINT IF EXISTS games_compat_game_type_check,
  ADD CONSTRAINT games_compat_game_type_check
    CHECK (game_type IN ('Digital', 'Presencial', 'Online', 'Híbrida')) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_compat_status_check,
  ADD CONSTRAINT games_compat_status_check
    CHECK (status IN ('active', 'full', 'cancelled', 'completed')) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_compat_max_players_check,
  ADD CONSTRAINT games_compat_max_players_check
    CHECK (max_players BETWEEN 1 AND 20) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_compat_price_check,
  ADD CONSTRAINT games_compat_price_check
    CHECK (price >= 0) NOT VALID,
  DROP CONSTRAINT IF EXISTS games_compat_min_age_check,
  ADD CONSTRAINT games_compat_min_age_check
    CHECK (min_age IS NULL OR min_age BETWEEN 0 AND 99) NOT VALID;

-- Elimina las políticas duplicadas del primer prototipo. Si permanecieran,
-- PostgreSQL las combinaría con OR y anularía parte del hardening posterior.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users can create games" ON public.games;
DROP POLICY IF EXISTS "Masters can delete own games" ON public.games;
DROP POLICY IF EXISTS "Masters can update own games" ON public.games;
DROP POLICY IF EXISTS "Public games are viewable by everyone" ON public.games;

DROP POLICY IF EXISTS "Participants are viewable by everyone" ON public.game_participants;
DROP POLICY IF EXISTS "Users can join games" ON public.game_participants;
DROP POLICY IF EXISTS "Users can leave games" ON public.game_participants;

COMMIT;
