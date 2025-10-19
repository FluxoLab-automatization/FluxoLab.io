-- 008_webhooks_activities_alignment.sql
BEGIN;

SET LOCAL search_path TO public;

ALTER TABLE IF EXISTS public.executions
  DROP CONSTRAINT IF EXISTS executions_trigger_event_id_fkey;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'webhook_registrations'
      AND column_name = 'token_hash'
  ) THEN
    -- Estrutura legada (001_init) sem conceito de workspace; descartamos dados incompatíveis.
    DROP TABLE IF EXISTS public.webhook_events;
    DROP TABLE IF EXISTS public.webhook_registrations;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.webhook_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  path text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST')),
  respond_mode respond_mode NOT NULL DEFAULT 'via_node',
  description text,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  webhook_id uuid NOT NULL REFERENCES public.webhook_registrations(id) ON DELETE CASCADE,
  correlation_id uuid NOT NULL,
  http_method text NOT NULL,
  headers jsonb NOT NULL,
  query_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_json jsonb,
  raw_body bytea,
  signature text,
  idempotency_key text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  status text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'enqueued', 'processed', 'failed')),
  UNIQUE (webhook_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_workspace
  ON public.webhook_registrations (workspace_id, token);

CREATE INDEX IF NOT EXISTS idx_webhook_events_workspace
  ON public.webhook_events (workspace_id, received_at DESC);

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.executions
      ADD CONSTRAINT executions_trigger_event_id_fkey
      FOREIGN KEY (trigger_event_id) REFERENCES public.webhook_events(id);
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'activities'
      AND column_name = 'payload'
  ) THEN
    -- Estrutura legada (002_fluxolab_core) não suporta metadata por workspace; recriaremos a tabela.
    DROP TABLE IF EXISTS public.activities;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_workspace
  ON public.activities (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_created_at
  ON public.activities (user_id, created_at DESC);

COMMIT;
