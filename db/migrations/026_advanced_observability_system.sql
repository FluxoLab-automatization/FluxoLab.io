-- 026_advanced_observability_system.sql
-- Sistema de observabilidade avançada

BEGIN;

-- Tabela para dashboards
CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    dashboard_type TEXT NOT NULL DEFAULT 'custom'
        CHECK (dashboard_type IN ('overview', 'workflows', 'executions', 'connectors', 'usage', 'alerts', 'custom')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para widgets de dashboard
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL
        CHECK (widget_type IN ('metric', 'chart', 'table', 'alert', 'log', 'map', 'gauge', 'progress')),
    title TEXT NOT NULL,
    description TEXT,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER NOT NULL DEFAULT 4,
    height INTEGER NOT NULL DEFAULT 3,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    query_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    refresh_interval INTEGER NOT NULL DEFAULT 30, -- em segundos
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para métricas customizadas
CREATE TABLE IF NOT EXISTS custom_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL
        CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
    description TEXT,
    unit TEXT,
    labels JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, metric_name)
);

-- Tabela para valores de métricas
CREATE TABLE IF NOT EXISTS metric_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id UUID NOT NULL REFERENCES custom_metrics(id) ON DELETE CASCADE,
    value DECIMAL(15,4) NOT NULL,
    labels JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para SLAs
CREATE TABLE IF NOT EXISTS slas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sla_type TEXT NOT NULL
        CHECK (sla_type IN ('availability', 'latency', 'throughput', 'error_rate', 'custom')),
    target_value DECIMAL(10,4) NOT NULL,
    measurement_period TEXT NOT NULL DEFAULT 'daily'
        CHECK (measurement_period IN ('hourly', 'daily', 'weekly', 'monthly')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para SLOs (Service Level Objectives)
CREATE TABLE IF NOT EXISTS slos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_id UUID NOT NULL REFERENCES slas(id) ON DELETE CASCADE,
    objective_name TEXT NOT NULL,
    target_percentage DECIMAL(5,2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
    measurement_window TEXT NOT NULL DEFAULT '30d'
        CHECK (measurement_window IN ('1d', '7d', '30d', '90d')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para medições de SLA
CREATE TABLE IF NOT EXISTS sla_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_id UUID NOT NULL REFERENCES slas(id) ON DELETE CASCADE,
    measurement_period_start TIMESTAMPTZ NOT NULL,
    measurement_period_end TIMESTAMPTZ NOT NULL,
    actual_value DECIMAL(10,4) NOT NULL,
    target_value DECIMAL(10,4) NOT NULL,
    percentage_met DECIMAL(5,2) NOT NULL,
    is_breached BOOLEAN NOT NULL DEFAULT FALSE,
    breach_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para relatórios de performance
CREATE TABLE IF NOT EXISTS performance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL
        CHECK (report_type IN ('executive', 'technical', 'compliance', 'usage', 'cost')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela para alertas inteligentes
CREATE TABLE IF NOT EXISTS intelligent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    alert_name TEXT NOT NULL,
    description TEXT,
    alert_type TEXT NOT NULL
        CHECK (alert_type IN ('anomaly', 'trend', 'threshold', 'pattern', 'predictive')),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    severity TEXT NOT NULL DEFAULT 'medium'
        CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para histórico de alertas inteligentes
CREATE TABLE IF NOT EXISTS intelligent_alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES intelligent_alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    severity TEXT NOT NULL,
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Dashboards padrão
INSERT INTO dashboards (workspace_id, name, description, dashboard_type, is_default, created_by) VALUES
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Visão Geral', 'Dashboard principal com métricas gerais', 'overview', TRUE, NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Workflows', 'Dashboard específico para workflows', 'workflows', FALSE, NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Execuções', 'Dashboard para monitoramento de execuções', 'executions', FALSE, NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Conectores', 'Dashboard para status dos conectores', 'connectors', FALSE, NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Uso e Custos', 'Dashboard para uso e custos', 'usage', FALSE, NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Alertas', 'Dashboard para alertas e notificações', 'alerts', FALSE, NULL);

-- Widgets padrão para dashboard de visão geral
INSERT INTO dashboard_widgets (dashboard_id, widget_type, title, description, position_x, position_y, width, height, config, query_config)
SELECT 
    d.id,
    'metric',
    'Execuções Hoje',
    'Número de execuções realizadas hoje',
    0, 0, 3, 2,
    '{"color": "blue", "icon": "play"}'::jsonb,
    '{"query": "SELECT COUNT(*) FROM executions WHERE DATE(created_at) = CURRENT_DATE", "refresh": 60}'::jsonb
FROM dashboards d
WHERE d.name = 'Visão Geral';

INSERT INTO dashboard_widgets (dashboard_id, widget_type, title, description, position_x, position_y, width, height, config, query_config)
SELECT 
    d.id,
    'metric',
    'Taxa de Sucesso',
    'Percentual de execuções bem-sucedidas',
    3, 0, 3, 2,
    '{"color": "green", "icon": "check", "format": "percentage"}'::jsonb,
    '{"query": "SELECT (COUNT(CASE WHEN status = ''succeeded'' THEN 1 END) * 100.0 / COUNT(*)) FROM executions WHERE created_at >= NOW() - INTERVAL ''24 hours''", "refresh": 300}'::jsonb
FROM dashboards d
WHERE d.name = 'Visão Geral';

INSERT INTO dashboard_widgets (dashboard_id, widget_type, title, description, position_x, position_y, width, height, config, query_config)
SELECT 
    d.id,
    'chart',
    'Execuções por Hora',
    'Gráfico de execuções nas últimas 24 horas',
    0, 2, 6, 4,
    '{"chartType": "line", "xAxis": "hour", "yAxis": "count"}'::jsonb,
    '{"query": "SELECT DATE_TRUNC(''hour'', created_at) as hour, COUNT(*) as count FROM executions WHERE created_at >= NOW() - INTERVAL ''24 hours'' GROUP BY hour ORDER BY hour", "refresh": 300}'::jsonb
FROM dashboards d
WHERE d.name = 'Visão Geral';

-- SLAs padrão
INSERT INTO slas (workspace_id, name, description, sla_type, target_value, measurement_period, created_by) VALUES
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Disponibilidade do Sistema', 'SLA de disponibilidade geral do sistema', 'availability', 99.9, 'daily', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Latência de Execução', 'SLA de latência para execuções', 'latency', 5.0, 'daily', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Taxa de Erro', 'SLA de taxa de erro máxima', 'error_rate', 1.0, 'daily', NULL);

-- SLOs padrão
INSERT INTO slos (sla_id, objective_name, target_percentage, measurement_window)
SELECT 
    s.id,
    'Disponibilidade 99.9%',
    99.9,
    '30d'
FROM slas s
WHERE s.name = 'Disponibilidade do Sistema';

INSERT INTO slos (sla_id, objective_name, target_percentage, measurement_window)
SELECT 
    s.id,
    'Latência < 5s',
    95.0,
    '7d'
FROM slas s
WHERE s.name = 'Latência de Execução';

INSERT INTO slos (sla_id, objective_name, target_percentage, measurement_window)
SELECT 
    s.id,
    'Taxa de Erro < 1%',
    99.0,
    '7d'
FROM slas s
WHERE s.name = 'Taxa de Erro';

-- Alertas inteligentes padrão
INSERT INTO intelligent_alerts (workspace_id, alert_name, description, alert_type, conditions, severity, created_by) VALUES
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Pico de Execuções', 'Detecta picos anômalos no número de execuções', 'anomaly', '{"metric": "executions_per_hour", "threshold": 3, "window": "1h"}', 'medium', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Aumento de Taxa de Erro', 'Detecta aumento na taxa de erro', 'trend', '{"metric": "error_rate", "trend": "increasing", "window": "1h"}', 'high', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Latência Alta', 'Detecta latência acima do normal', 'threshold', '{"metric": "avg_latency", "operator": ">", "value": 10}', 'high', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Padrão de Falhas', 'Detecta padrões de falhas recorrentes', 'pattern', '{"pattern": "consecutive_failures", "count": 5, "window": "30m"}', 'critical', NULL);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dashboards_workspace ON dashboards (workspace_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_type ON dashboards (dashboard_type);
CREATE INDEX IF NOT EXISTS idx_dashboards_public ON dashboards (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_dashboards_default ON dashboards (is_default) WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets (dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets (widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets (is_visible) WHERE is_visible = TRUE;

CREATE INDEX IF NOT EXISTS idx_custom_metrics_workspace ON custom_metrics (workspace_id);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_type ON custom_metrics (metric_type);
CREATE INDEX IF NOT EXISTS idx_custom_metrics_active ON custom_metrics (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_metric_values_metric ON metric_values (metric_id);
CREATE INDEX IF NOT EXISTS idx_metric_values_timestamp ON metric_values (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_slas_workspace ON slas (workspace_id);
CREATE INDEX IF NOT EXISTS idx_slas_type ON slas (sla_type);
CREATE INDEX IF NOT EXISTS idx_slas_active ON slas (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_slos_sla ON slos (sla_id);
CREATE INDEX IF NOT EXISTS idx_slos_active ON slos (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_sla_measurements_sla ON sla_measurements (sla_id);
CREATE INDEX IF NOT EXISTS idx_sla_measurements_period ON sla_measurements (measurement_period_start, measurement_period_end);
CREATE INDEX IF NOT EXISTS idx_sla_measurements_breached ON sla_measurements (is_breached) WHERE is_breached = TRUE;

CREATE INDEX IF NOT EXISTS idx_performance_reports_workspace ON performance_reports (workspace_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_type ON performance_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_performance_reports_period ON performance_reports (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_performance_reports_generated_at ON performance_reports (generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_intelligent_alerts_workspace ON intelligent_alerts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_intelligent_alerts_type ON intelligent_alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_intelligent_alerts_severity ON intelligent_alerts (severity);
CREATE INDEX IF NOT EXISTS idx_intelligent_alerts_active ON intelligent_alerts (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_intelligent_alert_history_alert ON intelligent_alert_history (alert_id);
CREATE INDEX IF NOT EXISTS idx_intelligent_alert_history_triggered_at ON intelligent_alert_history (triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_intelligent_alert_history_severity ON intelligent_alert_history (severity);
CREATE INDEX IF NOT EXISTS idx_intelligent_alert_history_resolved ON intelligent_alert_history (is_resolved) WHERE is_resolved = FALSE;

-- Função para calcular SLA
CREATE OR REPLACE FUNCTION calculate_sla(
    p_sla_id UUID,
    p_period_start TIMESTAMPTZ,
    p_period_end TIMESTAMPTZ
)
RETURNS JSONB AS $$
DECLARE
    v_sla RECORD;
    v_actual_value DECIMAL(10,4);
    v_percentage_met DECIMAL(5,2);
    v_is_breached BOOLEAN;
    v_breach_reason TEXT;
BEGIN
    -- Buscar configuração do SLA
    SELECT * INTO v_sla
    FROM slas
    WHERE id = p_sla_id;
    
    IF v_sla IS NULL THEN
        RETURN jsonb_build_object('error', 'SLA not found');
    END IF;
    
    -- Calcular valor atual baseado no tipo de SLA
    CASE v_sla.sla_type
        WHEN 'availability' THEN
            SELECT (COUNT(CASE WHEN status = 'succeeded' THEN 1 END) * 100.0 / COUNT(*))
            INTO v_actual_value
            FROM executions
            WHERE created_at >= p_period_start AND created_at < p_period_end;
            
        WHEN 'latency' THEN
            SELECT AVG(EXTRACT(EPOCH FROM (finished_at - started_at)))
            INTO v_actual_value
            FROM executions
            WHERE created_at >= p_period_start AND created_at < p_period_end
            AND status = 'succeeded';
            
        WHEN 'error_rate' THEN
            SELECT (COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / COUNT(*))
            INTO v_actual_value
            FROM executions
            WHERE created_at >= p_period_start AND created_at < p_period_end;
            
        ELSE
            v_actual_value := 0;
    END CASE;
    
    -- Calcular percentual atingido
    v_percentage_met := (v_actual_value / v_sla.target_value) * 100;
    
    -- Verificar se foi violado
    v_is_breached := v_actual_value < v_sla.target_value;
    
    IF v_is_breached THEN
        v_breach_reason := 'Target not met: ' || v_actual_value || ' < ' || v_sla.target_value;
    END IF;
    
    -- Inserir medição
    INSERT INTO sla_measurements (
        sla_id, measurement_period_start, measurement_period_end,
        actual_value, target_value, percentage_met, is_breached, breach_reason
    )
    VALUES (
        p_sla_id, p_period_start, p_period_end,
        v_actual_value, v_sla.target_value, v_percentage_met, v_is_breached, v_breach_reason
    );
    
    RETURN jsonb_build_object(
        'sla_id', p_sla_id,
        'actual_value', v_actual_value,
        'target_value', v_sla.target_value,
        'percentage_met', v_percentage_met,
        'is_breached', v_is_breached,
        'breach_reason', v_breach_reason
    );
END;
$$ LANGUAGE plpgsql;

-- Função para detectar anomalias
CREATE OR REPLACE FUNCTION detect_anomalies(
    p_metric_name TEXT,
    p_window_hours INTEGER DEFAULT 24
)
RETURNS JSONB AS $$
DECLARE
    v_current_avg DECIMAL(10,4);
    v_historical_avg DECIMAL(10,4);
    v_std_dev DECIMAL(10,4);
    v_anomaly_threshold DECIMAL(10,4);
    v_is_anomaly BOOLEAN;
BEGIN
    -- Calcular média atual
    SELECT AVG(value)
    INTO v_current_avg
    FROM metric_values mv
    JOIN custom_metrics cm ON mv.metric_id = cm.id
    WHERE cm.metric_name = p_metric_name
    AND mv.timestamp >= NOW() - INTERVAL '1 hour';
    
    -- Calcular média histórica
    SELECT AVG(value)
    INTO v_historical_avg
    FROM metric_values mv
    JOIN custom_metrics cm ON mv.metric_id = cm.id
    WHERE cm.metric_name = p_metric_name
    AND mv.timestamp >= NOW() - INTERVAL '1 hour' * p_window_hours
    AND mv.timestamp < NOW() - INTERVAL '1 hour';
    
    -- Calcular desvio padrão
    SELECT STDDEV(value)
    INTO v_std_dev
    FROM metric_values mv
    JOIN custom_metrics cm ON mv.metric_id = cm.id
    WHERE cm.metric_name = p_metric_name
    AND mv.timestamp >= NOW() - INTERVAL '1 hour' * p_window_hours
    AND mv.timestamp < NOW() - INTERVAL '1 hour';
    
    -- Definir threshold (3 desvios padrão)
    v_anomaly_threshold := v_historical_avg + (3 * v_std_dev);
    
    -- Verificar se é anomalia
    v_is_anomaly := v_current_avg > v_anomaly_threshold;
    
    RETURN jsonb_build_object(
        'metric_name', p_metric_name,
        'current_avg', v_current_avg,
        'historical_avg', v_historical_avg,
        'std_dev', v_std_dev,
        'anomaly_threshold', v_anomaly_threshold,
        'is_anomaly', v_is_anomaly
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;
