# Fantasy Experience — Documentación de Base de Datos

> Base de datos: **Supabase (PostgreSQL)**
> Este documento recoge la estructura completa necesaria para que la aplicación funcione.
> Los SQL de cada sección se pueden copiar directamente en el **SQL Editor de Supabase**.

---

## Diagrama de relaciones (ER)

```
┌─────────────────┐         ┌─────────────────────┐         ┌─────────────────┐
│   auth.users    │         │       profiles       │         │  master_reviews │
│  (Supabase Auth)│────────▶│ id (FK auth.users)   │◀────────│  master_id (FK) │
│                 │  1:1    │ full_name            │  1:N    │  player_id (FK) │
│ id              │         │ role                 │         │  partida_id (FK)│
│ email           │         │ bio                  │         │  rating         │
│ ...             │         │ sistemas[]           │         │  comment        │
└─────────────────┘         │ experiencia          │         └─────────────────┘
                            │ disponibilidad       │
                            │ precio_por_sesion    │         ┌─────────────────┐
                            │ idiomas[]            │         │ game_participants│
                            │ avatar_url           │◀────────│  game_id (FK)   │
                            └──────────┬───────────┘  N:M   │  player_id (FK) │
                                       │ 1:N               │  joined_at      │
                                       ▼                    └─────────────────┘
                            ┌─────────────────────┐                ▲
                            │        games         │────────────────┘
                            │ id                   │  1:N
                            │ master_id (FK)       │
                            │ title                │
                            │ game_system          │
                            │ game_type            │
                            │ start_date           │
                            │ max_players          │
                            │ price                │
                            │ tags[]               │
                            │ ...                  │
                            └─────────────────────┘
```

---

## Storage Buckets

| Bucket | Visibilidad | Uso | Límite |
|---|---|---|---|
| `games-images` | Público | Portadas e imágenes de partidas | 5 MB por archivo |
| `avatars` | Público | Avatares de usuarios | 2 MB por archivo |

---

## Tablas

---

### `profiles`

Extiende a `auth.users`. Se crea automáticamente al registrarse un usuario (ver Trigger).

```sql
CREATE TABLE public.profiles (
  -- Identidad
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT,
  last_name       TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  bio             TEXT,

  -- Rol en la plataforma
  role            TEXT NOT NULL DEFAULT 'player'
                  CHECK (role IN ('admin', 'master', 'player')),

  -- Preferencias de juego (arrays de valores predefinidos)
  sistemas        TEXT[] DEFAULT '{}',      -- Sistemas de juego que domina
  tipos_partida   TEXT[] DEFAULT '{}',      -- Digital, Presencial, Online, Híbrida
  estilos         TEXT[] DEFAULT '{}',      -- Narrativo, Táctico, Sandbox...
  idiomas         TEXT[] DEFAULT '{}',      -- Español, Inglés...
  tags            TEXT[] DEFAULT '{}',      -- Tags libres del perfil
  duracion_sesion TEXT[] DEFAULT '{}',      -- 2-3 horas, 3-4 horas...
  numero_jugadores TEXT[] DEFAULT '{}',     -- 1-2 jugadores, 3-4 jugadores...

  -- Info como Master (solo relevante si role = 'master')
  experiencia       TEXT CHECK (experiencia IN ('Novato','Intermedio','Experto','Profesional')),
  disponibilidad    TEXT CHECK (disponibilidad IN (
                      'Disponible','Ocupado','Fuera de línea',
                      'Solo fines de semana','Solo entre semana',
                      'Horario nocturno','Horario diurno'
                    )),
  precio_por_sesion TEXT CHECK (precio_por_sesion IN (
                      'Gratis','1-5€','6-10€','11-20€','21-30€','30€+'
                    )),
  timezone          TEXT DEFAULT 'Europe/Madrid',

  -- Métricas (calculadas/actualizadas por trigger o función)
  rating            NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews     INTEGER DEFAULT 0,

  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Valores posibles por campo:**

| Campo | Valores |
|---|---|
| `role` | `player` (default), `master`, `admin` |
| `sistemas` | Ver lista completa en `src/types/masters.ts` → `SISTEMAS_JUEGO` |
| `tipos_partida` | `Digital`, `Presencial`, `Online`, `Híbrida` |
| `estilos` | `Narrativo`, `Táctico`, `Sandbox`, `Railroad`, `One-shot`, `Campaña`, `Horror`, `Comedia`, `Serio`, `Mixto` |
| `idiomas` | `Español`, `Inglés`, `Francés`, `Alemán`, `Italiano`, `Portugués`, `Bilingüe (ES/EN)` |
| `duracion_sesion` | `2-3 horas`, `3-4 horas`, `4-6 horas`, `6+ horas`, `Flexible` |
| `numero_jugadores` | `1-2 jugadores`, `3-4 jugadores`, `5-6 jugadores`, `7+ jugadores`, `Flexible` |
| `experiencia` | `Novato`, `Intermedio`, `Experto`, `Profesional` |
| `disponibilidad` | `Disponible`, `Ocupado`, `Fuera de línea`, `Solo fines de semana`, `Solo entre semana`, `Horario nocturno`, `Horario diurno` |
| `precio_por_sesion` | `Gratis`, `1-5€`, `6-10€`, `11-20€`, `21-30€`, `30€+` |

---

### `games`

Partidas publicadas por Masters.

```sql
CREATE TABLE public.games (
  -- Identidad
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Info básica (Paso 1 del wizard)
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  game_system TEXT NOT NULL,
  game_type   TEXT NOT NULL CHECK (game_type IN ('Digital','Presencial','Online','Híbrida')),
  tags        TEXT[] DEFAULT '{}',
  language    TEXT DEFAULT 'Español',
  min_age     INTEGER DEFAULT 16,

  -- Logística (Paso 2 del wizard)
  start_date          TIMESTAMPTZ,
  max_players         INTEGER NOT NULL DEFAULT 4,
  price               NUMERIC(6,2) DEFAULT 0,
  city                TEXT,                    -- Solo si game_type = 'Presencial'
  schedule            TEXT,                    -- Descripción del horario
  temporalidad        TEXT CHECK (temporalidad IN ('One-shot','Campaña corta','Campaña larga','Abierta')),
  recommendations     TEXT,                    -- Recomendaciones/requisitos previos

  -- Herramientas y requerimientos (Paso 3 del wizard)
  master_contact       TEXT,
  tools_needed         TEXT[],                  -- VTT, Discord, etc.
  use_x_card           BOOLEAN DEFAULT FALSE,
  camera_mandatory     BOOLEAN DEFAULT FALSE,
  microphone_mandatory BOOLEAN DEFAULT TRUE,

  -- Métricas
  rating      NUMERIC(3,2) DEFAULT 0,

  -- Estado
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','full','cancelled','completed')),

  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Valores posibles por campo:**

| Campo | Valores |
|---|---|
| `game_type` | `Digital`, `Presencial`, `Online`, `Híbrida` |
| `temporalidad` | `One-shot`, `Campaña corta`, `Campaña larga`, `Abierta` |
| `status` | `active` (por defecto), `full` (llena), `cancelled`, `completed` |
| `game_system` | Ver `src/types/masters.ts` → `SISTEMAS_JUEGO` |
| `tags` | Ver `src/constants.ts` → `PRESET_TAGS` |

---

### `game_participants`

Tabla de unión para jugadores apuntados a partidas.

```sql
CREATE TABLE public.game_participants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id     UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),

  -- Un jugador no puede estar dos veces en la misma partida
  UNIQUE(game_id, player_id)
);
```

---

### `master_reviews`

Reseñas de jugadores sobre Masters. **Tabla futura** — los tipos ya están definidos en el frontend (`src/types/masters.ts`).

```sql
CREATE TABLE public.master_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partida_id  UUID REFERENCES public.games(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Un jugador solo puede dejar una review por master
  UNIQUE(master_id, player_id)
);
```

---

## Triggers

### 1. Crear perfil al registrarse

Cuando Supabase Auth crea un usuario, automáticamente genera su fila en `profiles`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Actualizar `updated_at` automáticamente

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### 3. Actualizar rating del master al crear/modificar/borrar reviews

```sql
CREATE OR REPLACE FUNCTION public.update_master_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_master_id UUID;
  v_avg       NUMERIC;
  v_count     INTEGER;
BEGIN
  -- Determinar el master_id según operación
  IF TG_OP = 'DELETE' THEN
    v_master_id := OLD.master_id;
  ELSE
    v_master_id := NEW.master_id;
  END IF;

  -- Recalcular media y total
  SELECT AVG(rating), COUNT(*)
  INTO v_avg, v_count
  FROM public.master_reviews
  WHERE master_id = v_master_id;

  -- Actualizar el perfil
  UPDATE public.profiles
  SET rating = COALESCE(v_avg, 0),
      total_reviews = COALESCE(v_count, 0)
  WHERE id = v_master_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.master_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_master_rating();
```

---

## Row Level Security (RLS)

Activar RLS en todas las tablas y definir políticas.

### `profiles`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver perfiles públicos
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Solo el propio usuario puede editar su perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

### `games`

```sql
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver partidas activas
CREATE POLICY "games_select_public"
  ON public.games FOR SELECT
  USING (true);

-- Solo usuarios autenticados pueden crear partidas
CREATE POLICY "games_insert_authenticated"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = master_id);

-- Solo el master de la partida puede editarla
CREATE POLICY "games_update_own"
  ON public.games FOR UPDATE
  USING (auth.uid() = master_id);

-- Solo el master puede eliminarla
CREATE POLICY "games_delete_own"
  ON public.games FOR DELETE
  USING (auth.uid() = master_id);
```

### `game_participants`

```sql
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver participantes
CREATE POLICY "participants_select_public"
  ON public.game_participants FOR SELECT
  USING (true);

-- Solo el propio usuario puede apuntarse
CREATE POLICY "participants_insert_own"
  ON public.game_participants FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Solo el propio usuario puede desapuntarse
CREATE POLICY "participants_delete_own"
  ON public.game_participants FOR DELETE
  USING (auth.uid() = player_id);
```

### `master_reviews`

```sql
ALTER TABLE public.master_reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver reviews
CREATE POLICY "reviews_select_public"
  ON public.master_reviews FOR SELECT
  USING (true);

-- Solo el propio jugador puede crear su review
CREATE POLICY "reviews_insert_own"
  ON public.master_reviews FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Solo el propio jugador puede editar su review
CREATE POLICY "reviews_update_own"
  ON public.master_reviews FOR UPDATE
  USING (auth.uid() = player_id);

-- Solo el propio jugador puede borrar su review
CREATE POLICY "reviews_delete_own"
  ON public.master_reviews FOR DELETE
  USING (auth.uid() = player_id);
```

---

## Storage — Políticas de buckets

### Bucket `games-images`

```sql
-- Crear bucket (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('games-images', 'games-images', true)
ON CONFLICT DO NOTHING;

-- Cualquiera puede ver imágenes
CREATE POLICY "games_images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'games-images');

-- Solo autenticados pueden subir, en su propia carpeta (userId/filename)
CREATE POLICY "games_images_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'games-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Solo el dueño puede borrar
CREATE POLICY "games_images_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'games-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Bucket `avatars`

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Índices recomendados

```sql
-- Búsquedas frecuentes en games
CREATE INDEX idx_games_master_id    ON public.games(master_id);
CREATE INDEX idx_games_game_type    ON public.games(game_type);
CREATE INDEX idx_games_game_system  ON public.games(game_system);
CREATE INDEX idx_games_start_date   ON public.games(start_date);
CREATE INDEX idx_games_status       ON public.games(status);
CREATE INDEX idx_games_tags         ON public.games USING GIN(tags);

-- Búsquedas en participants
CREATE INDEX idx_participants_game_id   ON public.game_participants(game_id);
CREATE INDEX idx_participants_player_id ON public.game_participants(player_id);

-- Búsquedas en reviews
CREATE INDEX idx_reviews_master_id ON public.master_reviews(master_id);

-- Búsqueda de perfiles por rol (para listar masters)
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Búsqueda full-text en títulos de partidas
CREATE INDEX idx_games_title_search ON public.games USING GIN(to_tsvector('spanish', title));
```

---

## Orden de ejecución en Supabase

Copiar y ejecutar en este orden en el **SQL Editor**:

1. Crear tabla `profiles`
2. Crear tabla `games`
3. Crear tabla `game_participants`
4. Crear tabla `master_reviews`
5. Crear triggers (`handle_new_user`, `set_updated_at`, `update_master_rating`)
6. Activar RLS y crear políticas (profiles, games, participants, reviews)
7. Crear buckets y políticas de storage
8. Crear índices

---

## Variables de entorno necesarias en el frontend

En el fichero `.env` local (nunca subir a git):

```env
VITE_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

En GitHub Actions → Settings → Secrets and variables → Actions:
- `VITE_PUBLIC_SUPABASE_URL`
- `VITE_ANON_KEY`

---

## Correspondencia frontend ↔ base de datos

### `profiles` (DB) ↔ `Profile` (frontend)

| DB column | Frontend field | Tipo |
|---|---|---|
| `id` | `id` | `string` (UUID) |
| `first_name` | `firstName` | `string` |
| `last_name` | `lastName` | `string` |
| `full_name` | `fullName` | `string` |
| `avatar_url` | `avatarUrl` | `string \| null` |
| `bio` | `bio` | `string` |
| `role` | `userRole` (AuthContext) | `'admin' \| 'master' \| 'player'` |
| `sistemas` | `sistemas` | `string[]` |
| `tipos_partida` | `tiposPartida` | `string[]` |
| `estilos` | `estilos` | `string[]` |
| `idiomas` | `idiomas` | `string[]` |
| `tags` | `tags` | `string[]` |
| `duracion_sesion` | `duracionSesion` | `string[]` |
| `numero_jugadores` | `numeroJugadores` | `string[]` |
| `experiencia` | `experiencia` | `ExperienciaMaster` |
| `disponibilidad` | `disponibilidad` | `DisponibilidadMaster` |
| `precio_por_sesion` | `precioPorSesion` | `RangoPrecio` |
| `timezone` | `timezone` | `string` |
| `rating` | `rating` | `number` |
| `total_reviews` | `totalReviews` | `number` |
| `updated_at` | `updatedAt` | `string` |

### `games` (DB) ↔ `Partida` (frontend)

| DB column | Frontend field | Tipo |
|---|---|---|
| `id` | `id` | `string` |
| `master_id` | `masterId` | `string` |
| `profiles.full_name` | `masterName` | `string` |
| `title` | `titulo` | `string` |
| `description` | `descripcion` | `string` |
| `image_url` | `imagenUrl` | `string` |
| `game_system` | `sistemaJuego` | `string` |
| `game_type` | `tipoPartida` | `string` |
| `start_date` | `fecha` | `string` |
| `max_players` | `jugadores` | `string` |
| `game_participants.count` | `jugadoresActuales` | `number` |
| `price` | `precio` | `string` |
| `city` | `ciudad` | `string` |
| `schedule` | `horario` | `string` |
| `tags` | `tags` | `string[]` |
| `language` | `idioma` | `string` |
| `min_age` | `edadMinima` | `number` |
| `temporalidad` | `temporalidad` | `string` |
| `recommendations` | `recomendaciones` | `string` |
| `master_contact` | `contactoMaster` | `string` |
| `tools_needed` | `herramientas` | `string[]` |
| `use_x_card` | `usoTarjetaX` | `boolean` |
| `camera_mandatory` | `obligatorioCamara` | `boolean` |
| `microphone_mandatory` | `obligatorioMicrofono` | `boolean` |
| `rating` | `rating` | `number` |
| `created_at` | — | `string` |
