\set ON_ERROR_STOP on

DO $$
DECLARE
  unsafe_policy_count INTEGER;
  rls_missing_count INTEGER;
BEGIN
  IF to_regprocedure('public.get_master_public_stats()') IS NULL THEN
    RAISE EXCEPTION 'Falta public.get_master_public_stats()';
  END IF;

  IF to_regprocedure('public.has_digital_entitlement(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Falta public.has_digital_entitlement(uuid)';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'currency'
  ) OR NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'games' AND column_name = 'digital_asset_path'
  ) THEN
    RAISE EXCEPTION 'Faltan columnas de pagos o productos digitales';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.games
    WHERE game_type NOT IN ('Digital', 'Presencial', 'Online', 'Híbrida')
       OR status NOT IN ('active', 'full', 'cancelled', 'completed')
  ) THEN
    RAISE EXCEPTION 'Quedan modalidades o estados sin normalizar';
  END IF;

  SELECT COUNT(*) INTO unsafe_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname IN (
      'Public profiles are viewable by everyone',
      'Public profiles are viewable by everyone.',
      'Users can insert own profile',
      'Users can insert their own profile.',
      'Users can update own profile',
      'Users can update their own profile.',
      'Authenticated users can create games',
      'Masters can delete own games',
      'Masters can update own games',
      'Public games are viewable by everyone',
      'Participants are viewable by everyone',
      'Users can join games',
      'Users can leave games'
    );

  IF unsafe_policy_count <> 0 THEN
    RAISE EXCEPTION 'Persisten % políticas heredadas inseguras', unsafe_policy_count;
  END IF;

  SELECT COUNT(*) INTO rls_missing_count
  FROM pg_class AS relation
  JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
  WHERE namespace.nspname = 'public'
    AND relation.relname IN (
      'profiles', 'games', 'game_participants', 'master_reviews',
      'master_videos', 'notifications', 'payment_orders', 'digital_entitlements'
    )
    AND NOT relation.relrowsecurity;

  IF rls_missing_count <> 0 THEN
    RAISE EXCEPTION 'Hay % tablas sensibles sin RLS', rls_missing_count;
  END IF;
END;
$$;

SELECT 'profiles' AS relation, COUNT(*) AS row_count FROM public.profiles
UNION ALL SELECT 'games', COUNT(*) FROM public.games
UNION ALL SELECT 'game_participants', COUNT(*) FROM public.game_participants
UNION ALL SELECT 'master_reviews', COUNT(*) FROM public.master_reviews
UNION ALL SELECT 'master_videos', COUNT(*) FROM public.master_videos
UNION ALL SELECT 'payment_orders', COUNT(*) FROM public.payment_orders
UNION ALL SELECT 'digital_entitlements', COUNT(*) FROM public.digital_entitlements
ORDER BY relation;

SELECT COUNT(*) AS ranked_masters FROM public.get_master_public_stats();
