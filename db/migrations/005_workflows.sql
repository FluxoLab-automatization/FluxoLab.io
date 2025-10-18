-- Workflow & Execution infrastructure (phase 3–5)
-- Requires: pgcrypto extension for gen_random_uuid()

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    CREATE EXTENSION pgcrypto;
  END IF;
END $$;

-- Domain enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exec_status') THEN
    CREATE TYPE exec_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'canceled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'step_status') THEN
    CREATE TYPE step_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'skipped');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'respond_mode') THEN
    CREATE TYPE respond_mode AS ENUM ('immediate', 'on_last_node', 'via_node');
  END IF;
END $$;

-- Drop legacy tables if they exist (ensures fresh schema)
DROP TABLE IF EXISTS execution_steps CASCADE;
DROP TABLE IF EXISTS executions CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS webhook_registrations CASCADE;
DROP TABLE IF EXISTS workflow_versions CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;

-- Credentials (encrypted)
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS data_encrypted BYTEA;
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS data_iv BYTEA;
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS key_id TEXT;
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users (id);
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users (id);
ALTER TABLE IF EXISTS credentials ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
      FROM information_schema.columns
     WHERE table_name = 'credentials'
       AND column_name = 'workspace_id'
  ) THEN
    BEGIN
      ALTER TABLE credentials
        ADD CONSTRAINT credentials_workspace_fk
        FOREIGN KEY (workspace_id)
        REFERENCES workspaces (id)
        ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_table THEN NULL;
    END;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS credentials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,
  data_encrypted  BYTEA NOT NULL,
  data_iv         BYTEA NOT NULL,
  key_id          TEXT NOT NULL,
  created_by      UUID REFERENCES users (id),
  updated_by      UUID REFERENCES users (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  UNIQUE (workspace_id, name)
);

-- Workflows (metadata) + versions (definition JSON)
CREATE TABLE IF NOT EXISTS workflows (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  active_version_id   UUID,
  tags                TEXT[] NOT NULL DEFAULT '{}',
  created_by          UUID REFERENCES users (id),
  updated_by          UUID REFERENCES users (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ,
  UNIQUE (workspace_id, name)
);

CREATE TABLE IF NOT EXISTS workflow_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows (id) ON DELETE CASCADE,
  version         INT  NOT NULL,
  definition      JSONB NOT NULL,
  checksum        TEXT NOT NULL,
  created_by      UUID REFERENCES users (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workflow_id, version)
);

ALTER TABLE workflows
  ADD CONSTRAINT workflows_active_version_fk
  FOREIGN KEY (active_version_id)
  REFERENCES workflow_versions (id)
  DEFERRABLE INITIALLY DEFERRED;

-- Webhook registrations and delivered events
CREATE TABLE IF NOT EXISTS webhook_registrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  workflow_id     UUID NOT NULL REFERENCES workflows (id) ON DELETE CASCADE,
  token           TEXT NOT NULL UNIQUE,
  path            TEXT NOT NULL,
  method          TEXT NOT NULL CHECK (method IN ('GET', 'POST')),
  respond_mode    respond_mode NOT NULL DEFAULT 'via_node',
  description     TEXT,
  enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES users (id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  webhook_id          UUID NOT NULL REFERENCES webhook_registrations (id) ON DELETE CASCADE,
  correlation_id      UUID NOT NULL,
  http_method         TEXT NOT NULL,
  headers             JSONB NOT NULL,
  query_params        JSONB NOT NULL DEFAULT '{}'::JSONB,
  body_json           JSONB,
  raw_body            BYTEA,
  signature           TEXT,
  idempotency_key     TEXT,
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'received'
    CHECK (status IN ('received', 'enqueued', 'processed', 'failed')),
  UNIQUE (webhook_id, idempotency_key)
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS executions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  workflow_id         UUID NOT NULL REFERENCES workflows (id) ON DELETE CASCADE,
  workflow_version_id UUID NOT NULL REFERENCES workflow_versions (id) ON DELETE RESTRICT,
  trigger_event_id    UUID REFERENCES webhook_events (id),
  correlation_id      UUID,
  status              exec_status NOT NULL DEFAULT 'queued',
  started_at          TIMESTAMPTZ,
  finished_at         TIMESTAMPTZ,
  error               JSONB,
  queue_job_id        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS execution_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id    UUID NOT NULL REFERENCES executions (id) ON DELETE CASCADE,
  node_id         TEXT NOT NULL,
  node_name       TEXT NOT NULL,
  status          step_status NOT NULL DEFAULT 'queued',
  attempt         INT NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  input_items     JSONB,
  output_items    JSONB,
  logs            JSONB,
  error           JSONB
);

-- Activities (light audit)
CREATE TABLE IF NOT EXISTS activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users (id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows (workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_workflow_versions_workflow ON workflow_versions (workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_workspace ON webhook_registrations (workspace_id, token);
CREATE INDEX IF NOT EXISTS idx_webhook_events_workspace ON webhook_events (workspace_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_workspace ON executions (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_execution_steps_exec ON execution_steps (execution_id, started_at);
CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities (workspace_id, created_at DESC);

