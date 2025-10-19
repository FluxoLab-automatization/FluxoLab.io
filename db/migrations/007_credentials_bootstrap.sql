-- 007_credentials_bootstrap.sql
BEGIN;

SET LOCAL search_path TO public;

DO $$
BEGIN
  IF to_regclass('public.credentials') IS NULL THEN
    RAISE EXCEPTION 'Expected table public.credentials from migration 005_workflows';
  END IF;
END $$;

WITH fallback_workspace AS (
  SELECT id
  FROM public.workspaces
  ORDER BY created_at
  LIMIT 1
)
UPDATE public.credentials c
SET workspace_id = COALESCE(
  (
    SELECT ranked.workspace_id
    FROM (
      SELECT
        wm.workspace_id,
        ROW_NUMBER() OVER (
          PARTITION BY wm.user_id
          ORDER BY
            CASE WHEN wm.user_id = ws.owner_id THEN 0 ELSE 1 END,
            COALESCE(array_position(ARRAY['admin', 'editor', 'observador'], p.code), 99),
            CASE
              WHEN wm.status = 'active' THEN 0
              WHEN wm.status = 'invited' THEN 1
              WHEN wm.status = 'suspended' THEN 2
              ELSE 3
            END,
            wm.created_at
        ) AS rn
      FROM public.workspace_members wm
      LEFT JOIN public.workspaces ws ON ws.id = wm.workspace_id
      LEFT JOIN public.profiles p ON p.id = wm.profile_id
      WHERE wm.user_id = c.created_by
        AND wm.status <> 'removed'
    ) ranked
    WHERE ranked.rn = 1
  ),
  (SELECT id FROM fallback_workspace)
)
WHERE c.workspace_id IS NULL;

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.credentials
      ADD CONSTRAINT credentials_workspace_fk
      FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'credentials'
      AND column_name = 'workspace_id'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.credentials WHERE workspace_id IS NULL LIMIT 1
  ) THEN
    ALTER TABLE public.credentials
      ALTER COLUMN workspace_id SET NOT NULL;
  END IF;
END $$;

COMMIT;
