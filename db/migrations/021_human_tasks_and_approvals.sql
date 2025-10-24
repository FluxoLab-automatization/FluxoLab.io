-- 021_human_tasks_and_approvals.sql
-- Sistema de human-in-the-loop e aprovações

BEGIN;

-- Tabela para tarefas humanas
CREATE TABLE IF NOT EXISTS human_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL,
    task_type TEXT NOT NULL
        CHECK (task_type IN ('approval', 'review', 'input', 'decision', 'signature', 'validation')),
    title TEXT NOT NULL,
    description TEXT,
    instructions TEXT,
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired', 'cancelled')),
    assigned_to UUID REFERENCES users(id),
    assigned_to_email TEXT,
    assigned_to_name TEXT,
    due_at TIMESTAMPTZ,
    sla_hours INTEGER NOT NULL DEFAULT 24,
    expires_at TIMESTAMPTZ,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para histórico de tarefas humanas
CREATE TABLE IF NOT EXISTS human_task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL
        CHECK (action IN ('created', 'assigned', 'started', 'approved', 'rejected', 'expired', 'cancelled', 'escalated')),
    performed_by UUID REFERENCES users(id),
    performed_by_name TEXT,
    comment TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para escalonamento de tarefas
CREATE TABLE IF NOT EXISTS human_task_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    escalation_level INTEGER NOT NULL DEFAULT 1,
    escalated_to UUID REFERENCES users(id),
    escalated_to_email TEXT,
    escalated_to_name TEXT,
    escalation_reason TEXT,
    escalated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Tabela para políticas de escalonamento
CREATE TABLE IF NOT EXISTS escalation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    escalation_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para notificações de tarefas
CREATE TABLE IF NOT EXISTS human_task_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL
        CHECK (notification_type IN ('assignment', 'reminder', 'escalation', 'deadline', 'completion')),
    recipient_id UUID REFERENCES users(id),
    recipient_email TEXT,
    recipient_name TEXT,
    channel TEXT NOT NULL
        CHECK (channel IN ('email', 'push', 'sms', 'whatsapp', 'slack', 'teams')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para templates de notificação
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    subject TEXT,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, template_name, channel)
);

-- Tabela para aprovações específicas
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    approver_name TEXT NOT NULL,
    approval_type TEXT NOT NULL
        CHECK (approval_type IN ('single', 'sequential', 'parallel', 'majority', 'unanimous')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    comment TEXT,
    delegated_to UUID REFERENCES users(id),
    delegated_to_name TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para grupos de aprovadores
CREATE TABLE IF NOT EXISTS approver_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL,
    description TEXT,
    approver_ids UUID[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, group_name)
);

-- Tabela para regras de aprovação
CREATE TABLE IF NOT EXISTS approval_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    approver_group_id UUID REFERENCES approver_groups(id),
    approver_user_id UUID REFERENCES users(id),
    approval_type TEXT NOT NULL,
    sla_hours INTEGER NOT NULL DEFAULT 24,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para assinaturas digitais
CREATE TABLE IF NOT EXISTS digital_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    signer_id UUID NOT NULL REFERENCES users(id),
    signer_name TEXT NOT NULL,
    signature_data TEXT NOT NULL,
    signature_algorithm TEXT NOT NULL DEFAULT 'RSA-SHA256',
    certificate_serial TEXT,
    certificate_issuer TEXT,
    signed_document_hash TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para formulários dinâmicos
CREATE TABLE IF NOT EXISTS dynamic_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    form_name TEXT NOT NULL,
    form_schema JSONB NOT NULL,
    validation_rules JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para respostas de formulários
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES dynamic_forms(id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES users(id),
    response_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para SLA de tarefas humanas
CREATE TABLE IF NOT EXISTS human_task_sla (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
    sla_type TEXT NOT NULL
        CHECK (sla_type IN ('response', 'resolution', 'escalation')),
    target_hours INTEGER NOT NULL,
    actual_hours DECIMAL(10,2),
    status TEXT NOT NULL
        CHECK (status IN ('met', 'breached', 'at_risk', 'pending')),
    breached_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_human_tasks_run ON human_tasks (run_id);
CREATE INDEX IF NOT EXISTS idx_human_tasks_step ON human_tasks (step_id);
CREATE INDEX IF NOT EXISTS idx_human_tasks_assigned_to ON human_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_human_tasks_status ON human_tasks (status);
CREATE INDEX IF NOT EXISTS idx_human_tasks_priority ON human_tasks (priority);
CREATE INDEX IF NOT EXISTS idx_human_tasks_due_at ON human_tasks (due_at);
CREATE INDEX IF NOT EXISTS idx_human_tasks_expires_at ON human_tasks (expires_at);
CREATE INDEX IF NOT EXISTS idx_human_tasks_created_at ON human_tasks (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_human_task_history_task ON human_task_history (task_id);
CREATE INDEX IF NOT EXISTS idx_human_task_history_action ON human_task_history (action);
CREATE INDEX IF NOT EXISTS idx_human_task_history_performed_by ON human_task_history (performed_by);
CREATE INDEX IF NOT EXISTS idx_human_task_history_created_at ON human_task_history (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_human_task_escalations_task ON human_task_escalations (task_id);
CREATE INDEX IF NOT EXISTS idx_human_task_escalations_level ON human_task_escalations (escalation_level);
CREATE INDEX IF NOT EXISTS idx_human_task_escalations_escalated_to ON human_task_escalations (escalated_to);

CREATE INDEX IF NOT EXISTS idx_escalation_policies_workspace ON escalation_policies (workspace_id);
CREATE INDEX IF NOT EXISTS idx_escalation_policies_task_type ON escalation_policies (task_type);
CREATE INDEX IF NOT EXISTS idx_escalation_policies_active ON escalation_policies (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_human_task_notifications_task ON human_task_notifications (task_id);
CREATE INDEX IF NOT EXISTS idx_human_task_notifications_type ON human_task_notifications (notification_type);
CREATE INDEX IF NOT EXISTS idx_human_task_notifications_recipient ON human_task_notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_human_task_notifications_status ON human_task_notifications (status);
CREATE INDEX IF NOT EXISTS idx_human_task_notifications_channel ON human_task_notifications (channel);

CREATE INDEX IF NOT EXISTS idx_notification_templates_workspace ON notification_templates (workspace_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates (notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON notification_templates (channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_approvals_task ON approvals (task_id);
CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals (approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals (status);
CREATE INDEX IF NOT EXISTS idx_approvals_type ON approvals (approval_type);

CREATE INDEX IF NOT EXISTS idx_approver_groups_workspace ON approver_groups (workspace_id);
CREATE INDEX IF NOT EXISTS idx_approver_groups_active ON approver_groups (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_approval_rules_workspace ON approval_rules (workspace_id);
CREATE INDEX IF NOT EXISTS idx_approval_rules_group ON approval_rules (approver_group_id);
CREATE INDEX IF NOT EXISTS idx_approval_rules_user ON approval_rules (approver_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_rules_active ON approval_rules (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_digital_signatures_task ON digital_signatures (task_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_signer ON digital_signatures (signer_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_signed_at ON digital_signatures (signed_at);

CREATE INDEX IF NOT EXISTS idx_dynamic_forms_workspace ON dynamic_forms (workspace_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_forms_active ON dynamic_forms (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_form_responses_task ON form_responses (task_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_form ON form_responses (form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_responder ON form_responses (responder_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted_at ON form_responses (submitted_at);

CREATE INDEX IF NOT EXISTS idx_human_task_sla_task ON human_task_sla (task_id);
CREATE INDEX IF NOT EXISTS idx_human_task_sla_type ON human_task_sla (sla_type);
CREATE INDEX IF NOT EXISTS idx_human_task_sla_status ON human_task_sla (status);

-- Função para criar tarefa humana
CREATE OR REPLACE FUNCTION create_human_task(
    p_run_id UUID,
    p_step_id UUID,
    p_task_type TEXT,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_instructions TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT 'medium',
    p_assigned_to UUID DEFAULT NULL,
    p_assigned_to_email TEXT DEFAULT NULL,
    p_assigned_to_name TEXT DEFAULT NULL,
    p_sla_hours INTEGER DEFAULT 24,
    p_input_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_task_id UUID;
    v_due_at TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Calcular datas baseadas no SLA
    v_due_at := NOW() + INTERVAL '1 hour' * p_sla_hours;
    v_expires_at := NOW() + INTERVAL '1 hour' * (p_sla_hours + 24); -- 24h de tolerância
    
    -- Criar tarefa
    INSERT INTO human_tasks (
        run_id, step_id, task_type, title, description, instructions,
        priority, assigned_to, assigned_to_email, assigned_to_name,
        sla_hours, due_at, expires_at, input_data
    )
    VALUES (
        p_run_id, p_step_id, p_task_type, p_title, p_description, p_instructions,
        p_priority, p_assigned_to, p_assigned_to_email, p_assigned_to_name,
        p_sla_hours, v_due_at, v_expires_at, p_input_data
    )
    RETURNING id INTO v_task_id;
    
    -- Registrar histórico
    INSERT INTO human_task_history (task_id, action, performed_by_name)
    VALUES (v_task_id, 'created', 'System');
    
    -- Criar SLA
    INSERT INTO human_task_sla (task_id, sla_type, target_hours, status)
    VALUES (v_task_id, 'response', p_sla_hours, 'pending');
    
    RETURN v_task_id;
END;
$$ LANGUAGE plpgsql;

-- Função para processar escalonamento
CREATE OR REPLACE FUNCTION process_task_escalation()
RETURNS INTEGER AS $$
DECLARE
    v_task RECORD;
    v_escalation_count INTEGER := 0;
    v_next_escalation_level INTEGER;
    v_escalation_policy RECORD;
BEGIN
    -- Buscar tarefas que precisam de escalonamento
    FOR v_task IN 
        SELECT ht.*, ep.escalation_rules
        FROM human_tasks ht
        LEFT JOIN escalation_policies ep ON ep.workspace_id = (
            SELECT workspace_id FROM executions WHERE id = ht.run_id
        ) AND ep.task_type = ht.task_type AND ep.is_active = TRUE
        WHERE ht.status = 'pending'
        AND ht.due_at < NOW()
        AND ht.expires_at > NOW()
    LOOP
        -- Determinar próximo nível de escalonamento
        SELECT COALESCE(MAX(escalation_level), 0) + 1
        INTO v_next_escalation_level
        FROM human_task_escalations
        WHERE task_id = v_task.id;
        
        -- Aplicar regras de escalonamento se existirem
        IF v_task.escalation_rules IS NOT NULL THEN
            -- Implementar lógica de escalonamento baseada nas regras
            -- Por enquanto, escalar para o próximo nível
            INSERT INTO human_task_escalations (
                task_id, escalation_level, escalation_reason
            )
            VALUES (
                v_task.id, 
                v_next_escalation_level, 
                'SLA breached - automatic escalation'
            );
            
            v_escalation_count := v_escalation_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_escalation_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
