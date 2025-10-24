-- 016_br_compliance_and_tenancy.sql
-- Multi-tenant robusto e compliance LGPD/ANS

BEGIN;

-- Tabela de tenants (clientes/organizações)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'archived')),
    region TEXT NOT NULL DEFAULT 'BR',
    cnpj TEXT UNIQUE,
    compliance_level TEXT NOT NULL DEFAULT 'standard'
        CHECK (compliance_level IN ('standard', 'lgpd', 'ans', 'sox')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar tenant_id aos workspaces existentes
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_workspaces_tenant ON workspaces (tenant_id);

-- Tabela para campos PII (dados pessoais)
CREATE TABLE IF NOT EXISTS pii_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL
        CHECK (field_type IN ('cpf', 'cnpj', 'email', 'phone', 'name', 'address', 'rg', 'pis')),
    mask_pattern TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, field_name)
);

-- Tabela para políticas de retenção de dados
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,
    retention_days INTEGER NOT NULL,
    auto_delete BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para logs de auditoria aprimorados
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL
        CHECK (actor_type IN ('user', 'service', 'system', 'api')),
    actor_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para vault de segredos
CREATE TABLE IF NOT EXISTS secrets_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    encrypted_value BYTEA NOT NULL,
    kms_key_alias TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, key_name)
);

-- Tabela para versões de segredos
CREATE TABLE IF NOT EXISTS secret_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    secret_id UUID NOT NULL REFERENCES secrets_vault(id) ON DELETE CASCADE,
    encrypted_value BYTEA NOT NULL,
    kms_key_alias TEXT NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (secret_id, version)
);

-- Tabela para evidence packages (prova de execução)
CREATE TABLE IF NOT EXISTS evidence_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    manifest JSONB NOT NULL,
    sha256 TEXT NOT NULL,
    signed_at TIMESTAMPTZ,
    signature TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para contratos de dados
CREATE TABLE IF NOT EXISTS data_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, key)
);

-- Tabela para versões de contratos de dados
CREATE TABLE IF NOT EXISTS data_contract_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES data_contracts(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    json_schema JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contract_id, version)
);

-- Tabela para políticas de compliance
CREATE TABLE IF NOT EXISTS compliance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL
        CHECK (policy_type IN ('lgpd', 'ans', 'sox', 'pci', 'custom')),
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para bindings de políticas
CREATE TABLE IF NOT EXISTS policy_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES compliance_policies(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    node_type TEXT,
    connector_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pii_fields_workspace ON pii_fields (workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_retention_workspace ON data_retention_policies (workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace ON audit_logs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_workspace ON secrets_vault (workspace_id);
CREATE INDEX IF NOT EXISTS idx_evidence_packages_run ON evidence_packages (run_id);
CREATE INDEX IF NOT EXISTS idx_data_contracts_workspace ON data_contracts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_compliance_policies_tenant ON compliance_policies (tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_bindings_policy ON policy_bindings (policy_id);

-- Inserir tenant padrão para workspaces existentes
-- Verificar se as colunas necessárias existem antes de inserir
DO $$
BEGIN
    -- Verificar se a tabela tenants existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
        -- Se a coluna region não existe, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'tenants' AND column_name = 'region') THEN
            ALTER TABLE tenants ADD COLUMN region TEXT NOT NULL DEFAULT 'BR';
        END IF;
        
        -- Se a coluna compliance_level não existe, adicionar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'tenants' AND column_name = 'compliance_level') THEN
            ALTER TABLE tenants ADD COLUMN compliance_level TEXT NOT NULL DEFAULT 'standard'
                CHECK (compliance_level IN ('standard', 'lgpd', 'ans', 'sox'));
        END IF;
        
        -- Verificar se já existe um tenant com esse nome antes de inserir
        IF NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'FluxoLab Default') THEN
            INSERT INTO tenants (name, region, compliance_level)
            VALUES ('FluxoLab Default', 'BR', 'lgpd');
        END IF;
    END IF;
END $$;

-- Atualizar workspaces existentes para referenciar o tenant padrão
UPDATE workspaces 
SET tenant_id = (SELECT id FROM tenants WHERE name = 'FluxoLab Default')
WHERE tenant_id IS NULL;

-- Inserir políticas de compliance padrão
INSERT INTO compliance_policies (tenant_id, policy_type, name, description, rules)
SELECT 
    t.id,
    'lgpd',
    'Política LGPD Padrão',
    'Política padrão de proteção de dados pessoais conforme LGPD',
    '{
        "pii_masking": true,
        "data_retention_days": 365,
        "consent_required": true,
        "right_to_be_forgotten": true,
        "data_portability": true
    }'::jsonb
FROM tenants t
WHERE t.name = 'FluxoLab Default'
ON CONFLICT DO NOTHING;

COMMIT;
