-- 020_evidence_and_audit_system.sql
-- Sistema de evidence packs e auditoria completa

BEGIN;

-- Tabela para evidence packages (prova de execução)
CREATE TABLE IF NOT EXISTS evidence_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    package_type TEXT NOT NULL DEFAULT 'execution'
        CHECK (package_type IN ('execution', 'approval', 'compliance', 'custom')),
    manifest JSONB NOT NULL,
    sha256 TEXT NOT NULL,
    signature TEXT,
    signed_at TIMESTAMPTZ,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para arquivos de evidence
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES evidence_packages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    checksum TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para trilhas de auditoria detalhadas
CREATE TABLE IF NOT EXISTS audit_trails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL
        CHECK (actor_type IN ('user', 'service', 'system', 'api', 'workflow')),
    actor_id UUID,
    actor_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    entity_name TEXT,
    old_values JSONB DEFAULT '{}'::jsonb,
    new_values JSONB DEFAULT '{}'::jsonb,
    context JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    correlation_id TEXT,
    trace_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para políticas de retenção de dados
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    policy_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    auto_delete BOOLEAN NOT NULL DEFAULT FALSE,
    archive_before_delete BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para jobs de limpeza de dados
CREATE TABLE IF NOT EXISTS data_cleanup_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES data_retention_policies(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL
        CHECK (job_type IN ('retention', 'anonymization', 'deletion', 'archival')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    records_processed INTEGER DEFAULT 0,
    records_affected INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para consentimentos LGPD
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL, -- ID do titular dos dados
    subject_type TEXT NOT NULL
        CHECK (subject_type IN ('customer', 'lead', 'employee', 'partner', 'other')),
    consent_type TEXT NOT NULL
        CHECK (consent_type IN ('marketing', 'analytics', 'cookies', 'data_processing', 'data_sharing')),
    consent_status TEXT NOT NULL
        CHECK (consent_status IN ('granted', 'denied', 'withdrawn', 'expired')),
    consent_method TEXT NOT NULL
        CHECK (consent_method IN ('explicit', 'opt_in', 'opt_out', 'implied', 'contract')),
    consent_text TEXT,
    consent_version TEXT,
    granted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    evidence_package_id UUID REFERENCES evidence_packages(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para solicitações de direito ao esquecimento
CREATE TABLE IF NOT EXISTS right_to_erasure_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    request_type TEXT NOT NULL
        CHECK (request_type IN ('complete_deletion', 'anonymization', 'data_portability')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'partially_completed')),
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    evidence_package_id UUID REFERENCES evidence_packages(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para logs de acesso a dados pessoais
CREATE TABLE IF NOT EXISTS data_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    access_type TEXT NOT NULL
        CHECK (access_type IN ('read', 'write', 'delete', 'export', 'share')),
    accessed_by UUID REFERENCES users(id),
    accessed_by_name TEXT,
    data_categories TEXT[] NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para mascaramento de dados
CREATE TABLE IF NOT EXISTS data_masking_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL
        CHECK (field_type IN ('email', 'phone', 'cpf', 'cnpj', 'name', 'address', 'custom')),
    mask_pattern TEXT NOT NULL,
    mask_type TEXT NOT NULL
        CHECK (mask_type IN ('partial', 'hash', 'tokenize', 'remove', 'replace')),
    replacement_value TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para aplicação de mascaramento
CREATE TABLE IF NOT EXISTS data_masking_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES data_masking_rules(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    step_id UUID,
    original_value TEXT NOT NULL,
    masked_value TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para assinaturas digitais
CREATE TABLE IF NOT EXISTS digital_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES evidence_packages(id) ON DELETE CASCADE,
    signer_id UUID NOT NULL REFERENCES users(id),
    signer_name TEXT NOT NULL,
    signature_algorithm TEXT NOT NULL,
    signature_data TEXT NOT NULL,
    certificate_serial TEXT,
    certificate_issuer TEXT,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para validação de integridade
CREATE TABLE IF NOT EXISTS integrity_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES evidence_packages(id) ON DELETE CASCADE,
    check_type TEXT NOT NULL
        CHECK (check_type IN ('hash', 'signature', 'timestamp', 'chain_of_custody')),
    check_status TEXT NOT NULL
        CHECK (check_status IN ('valid', 'invalid', 'warning', 'error')),
    check_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_evidence_packages_run ON evidence_packages (run_id);
CREATE INDEX IF NOT EXISTS idx_evidence_packages_type ON evidence_packages (package_type);
CREATE INDEX IF NOT EXISTS idx_evidence_packages_created_at ON evidence_packages (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_files_package ON evidence_files (package_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_type ON evidence_files (file_type);

CREATE INDEX IF NOT EXISTS idx_audit_trails_tenant ON audit_trails (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_workspace ON audit_trails (workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_run ON audit_trails (run_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_actor ON audit_trails (actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_entity ON audit_trails (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_action ON audit_trails (action);
CREATE INDEX IF NOT EXISTS idx_audit_trails_created_at ON audit_trails (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trails_correlation ON audit_trails (correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_trails_trace ON audit_trails (trace_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_tenant ON data_retention_policies (tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_workspace ON data_retention_policies (workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_type ON data_retention_policies (data_type);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_active ON data_retention_policies (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_data_cleanup_jobs_policy ON data_cleanup_jobs (policy_id);
CREATE INDEX IF NOT EXISTS idx_data_cleanup_jobs_status ON data_cleanup_jobs (status);
CREATE INDEX IF NOT EXISTS idx_data_cleanup_jobs_created_at ON data_cleanup_jobs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consent_records_workspace ON consent_records (workspace_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_subject ON consent_records (subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON consent_records (consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_status ON consent_records (consent_status);
CREATE INDEX IF NOT EXISTS idx_consent_records_granted_at ON consent_records (granted_at);

CREATE INDEX IF NOT EXISTS idx_erasure_requests_workspace ON right_to_erasure_requests (workspace_id);
CREATE INDEX IF NOT EXISTS idx_erasure_requests_subject ON right_to_erasure_requests (subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_erasure_requests_status ON right_to_erasure_requests (status);
CREATE INDEX IF NOT EXISTS idx_erasure_requests_requested_at ON right_to_erasure_requests (requested_at);

CREATE INDEX IF NOT EXISTS idx_data_access_logs_workspace ON data_access_logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_subject ON data_access_logs (subject_id, subject_type);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_accessed_by ON data_access_logs (accessed_by);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_type ON data_access_logs (access_type);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_created_at ON data_access_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_masking_rules_workspace ON data_masking_rules (workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_masking_rules_field ON data_masking_rules (field_name);
CREATE INDEX IF NOT EXISTS idx_data_masking_rules_type ON data_masking_rules (field_type);
CREATE INDEX IF NOT EXISTS idx_data_masking_rules_active ON data_masking_rules (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_data_masking_applications_rule ON data_masking_applications (rule_id);
CREATE INDEX IF NOT EXISTS idx_data_masking_applications_run ON data_masking_applications (run_id);
CREATE INDEX IF NOT EXISTS idx_data_masking_applications_applied_at ON data_masking_applications (applied_at);

CREATE INDEX IF NOT EXISTS idx_digital_signatures_package ON digital_signatures (package_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_signer ON digital_signatures (signer_id);
CREATE INDEX IF NOT EXISTS idx_digital_signatures_signed_at ON digital_signatures (signed_at);

CREATE INDEX IF NOT EXISTS idx_integrity_checks_package ON integrity_checks (package_id);
CREATE INDEX IF NOT EXISTS idx_integrity_checks_type ON integrity_checks (check_type);
CREATE INDEX IF NOT EXISTS idx_integrity_checks_status ON integrity_checks (check_status);

-- Função para gerar evidence package
CREATE OR REPLACE FUNCTION generate_evidence_package(
    p_run_id UUID,
    p_package_type TEXT DEFAULT 'execution'
)
RETURNS UUID AS $$
DECLARE
    v_package_id UUID;
    v_manifest JSONB;
    v_sha256 TEXT;
BEGIN
    -- Gerar manifesto com dados da execução
    SELECT jsonb_build_object(
        'run_id', p_run_id,
        'package_type', p_package_type,
        'generated_at', NOW(),
        'workflow_id', w.id,
        'workspace_id', w.workspace_id,
        'execution_summary', jsonb_build_object(
            'status', e.status,
            'started_at', e.started_at,
            'finished_at', e.finished_at,
            'total_steps', (SELECT COUNT(*) FROM execution_steps WHERE execution_id = p_run_id)
        ),
        'steps', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'step_id', es.id,
                    'node_id', es.node_id,
                    'node_name', es.node_name,
                    'status', es.status,
                    'started_at', es.started_at,
                    'finished_at', es.finished_at,
                    'input_hash', encode(digest(es.input_items::text, 'sha256'), 'hex'),
                    'output_hash', encode(digest(es.output_items::text, 'sha256'), 'hex')
                )
            )
            FROM execution_steps es
            WHERE es.execution_id = p_run_id
        )
    )
    INTO v_manifest
    FROM executions e
    JOIN workflows w ON e.workflow_id = w.id
    WHERE e.id = p_run_id;
    
    -- Calcular SHA256 do manifesto
    v_sha256 := encode(digest(v_manifest::text, 'sha256'), 'hex');
    
    -- Inserir evidence package
    INSERT INTO evidence_packages (run_id, package_type, manifest, sha256)
    VALUES (p_run_id, p_package_type, v_manifest, v_sha256)
    RETURNING id INTO v_package_id;
    
    RETURN v_package_id;
END;
$$ LANGUAGE plpgsql;

-- Função para aplicar políticas de retenção
CREATE OR REPLACE FUNCTION apply_retention_policies()
RETURNS INTEGER AS $$
DECLARE
    v_policy RECORD;
    v_affected INTEGER := 0;
    v_total_affected INTEGER := 0;
BEGIN
    FOR v_policy IN 
        SELECT * FROM data_retention_policies 
        WHERE is_active = TRUE 
        AND auto_delete = TRUE
    LOOP
        -- Aplicar política baseada no tipo de dados
        CASE v_policy.data_type
            WHEN 'webhook_events' THEN
                DELETE FROM webhook_events 
                WHERE created_at < NOW() - INTERVAL '1 day' * v_policy.retention_days
                AND workspace_id = v_policy.workspace_id;
                GET DIAGNOSTICS v_affected = ROW_COUNT;
                
            WHEN 'execution_logs' THEN
                DELETE FROM execution_steps 
                WHERE created_at < NOW() - INTERVAL '1 day' * v_policy.retention_days
                AND execution_id IN (
                    SELECT id FROM executions 
                    WHERE workspace_id = v_policy.workspace_id
                );
                GET DIAGNOSTICS v_affected = ROW_COUNT;
                
            WHEN 'audit_trails' THEN
                DELETE FROM audit_trails 
                WHERE created_at < NOW() - INTERVAL '1 day' * v_policy.retention_days
                AND workspace_id = v_policy.workspace_id;
                GET DIAGNOSTICS v_affected = ROW_COUNT;
        END CASE;
        
        v_total_affected := v_total_affected + v_affected;
        
        -- Registrar job de limpeza
        INSERT INTO data_cleanup_jobs (policy_id, job_type, status, records_affected)
        VALUES (v_policy.id, 'deletion', 'completed', v_affected);
    END LOOP;
    
    RETURN v_total_affected;
END;
$$ LANGUAGE plpgsql;

COMMIT;
