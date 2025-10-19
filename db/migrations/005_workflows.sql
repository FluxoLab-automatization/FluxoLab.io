-- 005_workflows.sql  (infraestrutura de workflows + execuções)
BEGIN;

-- Schema alvo explícito
SET LOCAL search_path TO public;

-- Extensão necessária
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
    CREATE EXTENSION pgcrypto;
  END IF;
END $$;

-- Tipos de domínio
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='exec_status') THEN
    CREATE TYPE exec_status AS ENUM ('queued','running','succeeded','failed','canceled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='step_status') THEN
    CREATE TYPE step_status AS ENUM ('queued','running','succeeded','failed','skipped');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='respond_mode') THEN
    CREATE TYPE respond_mode AS ENUM ('immediate','on_last_node','via_node');
  END IF;
END $$;

-- CREDENTIALS (cria antes de qualquer uso)
DO $$
BEGIN
  IF to_regclass('public.credentials') IS NULL THEN
    CREATE TABLE public.credentials (
      id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
      name            text NOT NULL,
      type            text NOT NULL,
      data_encrypted  bytea NOT NULL,
      data_iv         bytea NOT NULL,
      key_id          text NOT NULL,
      created_by      uuid REFERENCES public.users(id),
      updated_by      uuid REFERENCES public.users(id),
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now(),
      deleted_at      timestamptz,
      UNIQUE (workspace_id, name)
    );
  END IF;
END $$;

-- WORKFLOWS
CREATE TABLE IF NOT EXISTS public.workflows (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name                text NOT NULL,
  status              text NOT NULL CHECK (status IN ('draft','active','archived')),
  active_version_id   uuid,
  tags                text[] NOT NULL DEFAULT '{}',
  created_by          uuid REFERENCES public.users(id),
  updated_by          uuid REFERENCES public.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  UNIQUE (workspace_id, name)
);

CREATE TABLE IF NOT EXISTS public.workflow_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  version         int  NOT NULL,
  definition      jsonb NOT NULL,
  checksum        text NOT NULL,
  created_by      uuid REFERENCES public.users(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, version)
);

-- (sem IF NOT EXISTS; usa bloco com duplicate_object)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.workflows
      ADD CONSTRAINT workflows_active_version_fk
      FOREIGN KEY (active_version_id)
      REFERENCES public.workflow_versions(id)
      DEFERRABLE INITIALLY DEFERRED;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- WEBHOOKS
CREATE TABLE IF NOT EXISTS public.webhook_registrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id     uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  token           text NOT NULL UNIQUE,
  path            text NOT NULL,
  method          text NOT NULL CHECK (method IN ('GET','POST')),
  respond_mode    respond_mode NOT NULL DEFAULT 'via_node',
  description     text,
  enabled         boolean NOT NULL DEFAULT true,
  created_by      uuid REFERENCES public.users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  webhook_id          uuid NOT NULL REFERENCES public.webhook_registrations(id) ON DELETE CASCADE,
  correlation_id      uuid NOT NULL,
  http_method         text NOT NULL,
  headers             jsonb NOT NULL,
  query_params        jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_json           jsonb,
  raw_body            bytea,
  signature           text,
  idempotency_key     text,
  received_at         timestamptz NOT NULL DEFAULT now(),
  processed_at        timestamptz,
  status              text NOT NULL DEFAULT 'received'
    CHECK (status IN ('received','enqueued','processed','failed')),
  UNIQUE (webhook_id, idempotency_key)
);

-- EXECUÇÕES
CREATE TABLE IF NOT EXISTS public.executions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  workflow_id         uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  workflow_version_id uuid NOT NULL REFERENCES public.workflow_versions(id) ON DELETE RESTRICT,
  trigger_event_id    uuid REFERENCES public.webhook_events(id),
  correlation_id      uuid,
  status              exec_status NOT NULL DEFAULT 'queued',
  started_at          timestamptz,
  finished_at         timestamptz,
  error               jsonb,
  queue_job_id        text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.execution_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    uuid NOT NULL REFERENCES public.executions(id) ON DELETE CASCADE,
  node_id         text NOT NULL,
  node_name       text NOT NULL,
  status          step_status NOT NULL DEFAULT 'queued',
  attempt         int NOT NULL DEFAULT 0,
  started_at      timestamptz,
  finished_at     timestamptz,
  input_items     jsonb,
  output_items    jsonb,
  logs            jsonb,
  error           jsonb
);

-- ACTIVITIES
CREATE TABLE IF NOT EXISTS public.activities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES public.users(id),
  action          text NOT NULL,
  entity_type     text NOT NULL,
  entity_id       uuid NOT NULL,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ÍNDICES (condicionais)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workflows' AND column_name='workspace_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows (workspace_id, status)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workflow_versions' AND column_name='workflow_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow ON public.workflow_versions (workflow_id, created_at DESC)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='webhook_registrations' AND column_name='workspace_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_webhook_registrations_workspace ON public.webhook_registrations (workspace_id, token)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='webhook_events' AND column_name='workspace_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_webhook_events_workspace ON public.webhook_events (workspace_id, received_at DESC)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='executions' AND column_name='workspace_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_executions_workspace ON public.executions (workspace_id, created_at DESC)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='execution_steps' AND column_name='execution_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_execution_steps_exec ON public.execution_steps (execution_id, started_at)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='activities' AND column_name='workspace_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_activities_workspace ON public.activities (workspace_id, created_at DESC)';
  END IF;
END $$;

COMMIT;
