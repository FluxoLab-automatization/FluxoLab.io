-- 009_activity_backfill.sql
-- Seed minimal activity records for workspaces created antes da migração workspace-aware.
BEGIN;

SET LOCAL search_path TO public;

WITH no_activity AS (
  SELECT w.id AS workspace_id,
         w.owner_id,
         w.created_at
  FROM public.workspaces w
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.activities a
    WHERE a.workspace_id = w.id
  )
)
INSERT INTO public.activities (
  workspace_id,
  user_id,
  action,
  entity_type,
  entity_id,
  metadata
)
SELECT
  na.workspace_id,
  na.owner_id,
  'workspace_bootstrap',
  'workspace',
  na.workspace_id,
  jsonb_build_object(
    'source',
    'migration_009_activity_backfill',
    'message',
    'Atividade gerada automaticamente para preservar historico apos alinhamento de schema.',
    'created_at',
    na.created_at
  )
FROM no_activity na;

-- Complementa com um lembrete padrao para configuração de webhooks.
INSERT INTO public.activities (
  workspace_id,
  user_id,
  action,
  entity_type,
  entity_id,
  metadata
)
SELECT
  na.workspace_id,
  NULL,
  'Revise as configuracoes de webhooks e gere um token atualizado.',
  'system',
  NULL,
  jsonb_build_object(
    'source',
    'migration_009_activity_backfill',
    'category',
    'webhooks',
    'url',
    'https://fluxolab.dev/docs/webhooks'
  )
FROM (
  SELECT DISTINCT workspace_id
  FROM public.activities
  WHERE metadata ->> 'source' = 'migration_009_activity_backfill'
) na
WHERE NOT EXISTS (
  SELECT 1
  FROM public.activities existing
  WHERE existing.workspace_id = na.workspace_id
    AND existing.entity_type = 'system'
    AND existing.metadata ->> 'category' = 'webhooks'
);

COMMIT;
