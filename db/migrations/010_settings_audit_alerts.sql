-- 010_settings_audit_alerts.sql
BEGIN;

SET LOCAL search_path TO public;

-- Alertas de uso por workspace
CREATE TABLE IF NOT EXISTS public.workspace_usage_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  metric text NOT NULL CHECK (metric IN ('webhooks', 'users', 'workflows', 'all')),
  threshold numeric(12, 2) NOT NULL,
  condition text NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals')),
  window_size text NOT NULL DEFAULT '24h',
  channel text NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'slack', 'webhook')),
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_workspace
  ON public.workspace_usage_alerts (workspace_id, metric);

-- Auditoria de operações com API keys
CREATE TABLE IF NOT EXISTS public.workspace_api_key_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.workspace_api_keys(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'rotated', 'revoked', 'used')),
  actor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_api_key_audit_workspace
  ON public.workspace_api_key_audit (workspace_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_workspace_api_key_audit_api_key
  ON public.workspace_api_key_audit (api_key_id, occurred_at DESC);

-- Eventos de integrações (SSO, LDAP, secret providers, etc.)
CREATE TABLE IF NOT EXISTS public.workspace_integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_type text NOT NULL CHECK (
    integration_type IN ('sso', 'ldap', 'secret_provider', 'log_destination', 'community_connector', 'api_key', 'environment')
  ),
  integration_id text,
  status text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_integration_events_workspace
  ON public.workspace_integration_events (workspace_id, occurred_at DESC);

COMMIT;
