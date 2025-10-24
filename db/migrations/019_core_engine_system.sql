-- 019_core_engine_system.sql
-- Sistema core do engine de automação com regras de negócio

BEGIN;

-- Tabela para eventos do sistema (event-driven architecture)
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    correlation_id TEXT,
    trace_id TEXT,
    span_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    checksum TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para chaves de idempotência
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scope TEXT NOT NULL, -- 'webhook:<endpoint_id>', 'schedule:<workflow_id>', 'event:<event_type>'
    key TEXT NOT NULL,
    run_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, workspace_id, scope, key)
);

-- Tabela para locks distribuídos
CREATE TABLE IF NOT EXISTS distributed_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lock_key TEXT NOT NULL UNIQUE,
    locked_by TEXT NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Tabela para fila de retry (DLQ)
CREATE TABLE IF NOT EXISTS retry_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMPTZ NOT NULL,
    error_message TEXT,
    error_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para circuit breakers
CREATE TABLE IF NOT EXISTS circuit_breakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'closed'
        CHECK (state IN ('closed', 'open', 'half_open')),
    failure_count INTEGER NOT NULL DEFAULT 0,
    failure_threshold INTEGER NOT NULL DEFAULT 5,
    timeout_seconds INTEGER NOT NULL DEFAULT 60,
    last_failure_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, connector_id)
);

-- Tabela para compensações (sagas)
CREATE TABLE IF NOT EXISTS compensation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
    executed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para janelas de execução (time windows)
CREATE TABLE IF NOT EXISTS execution_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    window_type TEXT NOT NULL
        CHECK (window_type IN ('daily', 'weekly', 'monthly', 'custom')),
    start_time TIME,
    end_time TIME,
    days_of_week INTEGER[], -- 0=domingo, 1=segunda, etc.
    days_of_month INTEGER[], -- 1-31
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para agendamentos (cron jobs)
CREATE TABLE IF NOT EXISTS schedule_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para métricas de execução
CREATE TABLE IF NOT EXISTS execution_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit TEXT NOT NULL,
    tags JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para alertas
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    alert_type TEXT NOT NULL
        CHECK (alert_type IN ('error_rate', 'latency', 'usage', 'cost', 'custom')),
    condition_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para notificações de alertas
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL
        CHECK (notification_type IN ('email', 'webhook', 'slack', 'teams')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para histórico de alertas
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    status TEXT NOT NULL
        CHECK (status IN ('firing', 'resolved', 'acknowledged')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events (event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_tenant ON system_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_system_events_workspace ON system_events (workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_events_run ON system_events (run_id);
CREATE INDEX IF NOT EXISTS idx_system_events_correlation ON system_events (correlation_id);
CREATE INDEX IF NOT EXISTS idx_system_events_trace ON system_events (trace_id);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_scope ON idempotency_keys (scope);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys (expires_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_workspace ON idempotency_keys (workspace_id);

CREATE INDEX IF NOT EXISTS idx_distributed_locks_expires ON distributed_locks (expires_at);
CREATE INDEX IF NOT EXISTS idx_retry_queue_next_retry ON retry_queue (next_retry_at);
CREATE INDEX IF NOT EXISTS idx_retry_queue_run ON retry_queue (run_id);

CREATE INDEX IF NOT EXISTS idx_circuit_breakers_workspace ON circuit_breakers (workspace_id);
CREATE INDEX IF NOT EXISTS idx_circuit_breakers_connector ON circuit_breakers (connector_id);
CREATE INDEX IF NOT EXISTS idx_circuit_breakers_state ON circuit_breakers (state);

CREATE INDEX IF NOT EXISTS idx_compensation_actions_run ON compensation_actions (run_id);
CREATE INDEX IF NOT EXISTS idx_compensation_actions_status ON compensation_actions (status);

CREATE INDEX IF NOT EXISTS idx_execution_windows_workflow ON execution_windows (workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_windows_active ON execution_windows (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_schedule_jobs_workspace ON schedule_jobs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_schedule_jobs_workflow ON schedule_jobs (workflow_id);
CREATE INDEX IF NOT EXISTS idx_schedule_jobs_next_run ON schedule_jobs (next_run_at);
CREATE INDEX IF NOT EXISTS idx_schedule_jobs_active ON schedule_jobs (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_execution_metrics_workspace ON execution_metrics (workspace_id);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_workflow ON execution_metrics (workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_name ON execution_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_timestamp ON execution_metrics (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_workspace ON alerts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_alert_notifications_alert ON alert_notifications (alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert ON alert_history (alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alert_history (created_at DESC);

-- Função para limpeza automática de chaves de idempotência expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de locks expirados
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM distributed_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpeza automática de retry queue antiga
CREATE OR REPLACE FUNCTION cleanup_old_retry_queue()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM retry_queue 
    WHERE created_at < NOW() - INTERVAL '7 days' 
    AND retry_count >= max_retries;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
