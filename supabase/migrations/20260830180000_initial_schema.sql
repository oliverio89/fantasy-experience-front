BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  city TEXT CHECK (city IS NULL OR char_length(city) <= 100),
  role TEXT NOT NULL DEFAULT 'player'
    CHECK (role IN ('admin', 'master', 'player')),
  sistemas TEXT[] NOT NULL DEFAULT '{}',
  tipos_partida TEXT[] NOT NULL DEFAULT '{}',
  estilos TEXT[] NOT NULL DEFAULT '{}',
  idiomas TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  duracion_sesion TEXT[] NOT NULL DEFAULT '{}',
  numero_jugadores TEXT[] NOT NULL DEFAULT '{}',
  experiencia TEXT
    CHECK (experiencia IN ('Novato', 'Intermedio', 'Experto', 'Profesional')),
  disponibilidad TEXT CHECK (
    disponibilidad IN (
      'Disponible', 'Ocupado', 'Fuera de línea', 'Solo fines de semana',
      'Solo entre semana', 'Horario nocturno', 'Horario diurno'
    )
  ),
  precio_por_sesion TEXT
    CHECK (precio_por_sesion IN ('Gratis', '1-5€', '6-10€', '11-20€', '21-30€', '30€+')),
  timezone TEXT DEFAULT 'Europe/Madrid',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  game_system TEXT NOT NULL,
  game_type TEXT NOT NULL
    CHECK (game_type IN ('Digital', 'Presencial', 'Online', 'Híbrida')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'Español',
  min_age INTEGER CHECK (min_age BETWEEN 0 AND 99),
  start_date TIMESTAMPTZ,
  max_players INTEGER NOT NULL DEFAULT 4 CHECK (max_players BETWEEN 1 AND 20),
  price NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  city TEXT,
  schedule TEXT,
  temporalidad TEXT
    CHECK (temporalidad IN ('One-shot', 'Campaña corta', 'Campaña larga', 'Abierta')),
  recommendations TEXT,
  master_contact TEXT,
  tools_needed TEXT[],
  use_x_card BOOLEAN NOT NULL DEFAULT FALSE,
  camera_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  microphone_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, player_id)
);

CREATE TABLE public.master_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partida_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (master_id, player_id)
);

CREATE TABLE public.master_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  game_system TEXT,
  num_players INTEGER CHECK (num_players > 0),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  played_at TIMESTAMPTZ,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, city, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'city',
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' = 'master' THEN 'master'
      ELSE 'player'
    END
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.update_master_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_master_id UUID;
  average_rating NUMERIC;
  review_count INTEGER;
BEGIN
  target_master_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD.master_id
    ELSE NEW.master_id
  END;

  SELECT AVG(rating), COUNT(*)::INTEGER
  INTO average_rating, review_count
  FROM public.master_reviews
  WHERE master_id = target_master_id;

  UPDATE public.profiles
  SET rating = COALESCE(average_rating, 0), total_reviews = review_count
  WHERE id = target_master_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_rating_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.master_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_master_rating();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON public.profiles
FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "games_select_public" ON public.games
FOR SELECT USING (TRUE);
CREATE POLICY "games_insert_authenticated" ON public.games
FOR INSERT TO authenticated WITH CHECK (auth.uid() = master_id);
CREATE POLICY "games_update_own" ON public.games
FOR UPDATE TO authenticated USING (auth.uid() = master_id) WITH CHECK (auth.uid() = master_id);
CREATE POLICY "games_delete_own" ON public.games
FOR DELETE TO authenticated USING (auth.uid() = master_id);
CREATE POLICY "participants_select_public" ON public.game_participants
FOR SELECT USING (TRUE);
CREATE POLICY "participants_insert_own" ON public.game_participants
FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "participants_delete_own" ON public.game_participants
FOR DELETE TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "reviews_select_public" ON public.master_reviews
FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert_own" ON public.master_reviews
FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "reviews_update_own" ON public.master_reviews
FOR UPDATE TO authenticated USING (auth.uid() = player_id) WITH CHECK (auth.uid() = player_id);
CREATE POLICY "reviews_delete_own" ON public.master_reviews
FOR DELETE TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "master_videos_select_public" ON public.master_videos
FOR SELECT USING (TRUE);
CREATE POLICY "master_videos_insert_own" ON public.master_videos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = master_id);
CREATE POLICY "master_videos_update_own" ON public.master_videos
FOR UPDATE TO authenticated USING (auth.uid() = master_id) WITH CHECK (auth.uid() = master_id);
CREATE POLICY "master_videos_delete_own" ON public.master_videos
FOR DELETE TO authenticated USING (auth.uid() = master_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles, public.games, public.master_reviews, public.master_videos TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.game_participants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_videos TO authenticated;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('games-images', 'games-images', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('avatars', 'avatars', TRUE, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "games_images_select_public" ON storage.objects
FOR SELECT USING (bucket_id = 'games-images');
CREATE POLICY "games_images_insert_own" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'games-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
CREATE POLICY "games_images_delete_own" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'games-images' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_select_public" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_update_own" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_delete_own" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE INDEX idx_games_master_id ON public.games(master_id);
CREATE INDEX idx_games_game_type ON public.games(game_type);
CREATE INDEX idx_games_game_system ON public.games(game_system);
CREATE INDEX idx_games_start_date ON public.games(start_date);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_tags ON public.games USING GIN(tags);
CREATE INDEX idx_participants_game_id ON public.game_participants(game_id);
CREATE INDEX idx_participants_player_id ON public.game_participants(player_id);
CREATE INDEX idx_reviews_master_id ON public.master_reviews(master_id);

COMMIT;
