-- 006_workspace_defaults.sql (corrigido)
BEGIN;

SET LOCAL search_path TO public;

-- 1) Coluna em users (sem FK inline)
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS default_workspace_id uuid;

-- 2) FK para workspaces (idempotente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'default_workspace_id'
  ) THEN
    BEGIN
      ALTER TABLE public.users
        ADD CONSTRAINT users_default_workspace_fk
        FOREIGN KEY (default_workspace_id)
        REFERENCES public.workspaces(id)
        ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- ja existe
    END;
  END IF;
END $$;

-- 3) Indice
CREATE INDEX IF NOT EXISTS idx_users_default_workspace
  ON public.users (default_workspace_id);

-- 4) Definir default_workspace_id com a melhor membership por usuario
--    (prioridade: owner > admin > editor > viewer; empate: mais antigo e ativos)
WITH ranked AS (
  SELECT
    wm.user_id,
    wm.workspace_id,
    ROW_NUMBER() OVER (
      PARTITION BY wm.user_id
      ORDER BY
        CASE WHEN wm.user_id = w.owner_id THEN 0 ELSE 1 END,
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
  LEFT JOIN public.workspaces w ON w.id = wm.workspace_id
  LEFT JOIN public.profiles p ON p.id = wm.profile_id
  WHERE wm.status <> 'removed'
)
UPDATE public.users u
SET default_workspace_id = r.workspace_id
FROM ranked r
WHERE u.id = r.user_id
  AND r.rn = 1
  AND u.default_workspace_id IS NULL;

-- 5) Fallback: se ainda nulo, use o primeiro workspace existente da org
UPDATE public.users u
SET default_workspace_id = w.id
FROM LATERAL (
  SELECT id FROM public.workspaces ORDER BY created_at LIMIT 1
) w
WHERE u.default_workspace_id IS NULL;

COMMIT;
