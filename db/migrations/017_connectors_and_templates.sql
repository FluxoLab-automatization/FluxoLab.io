-- 017_connectors_and_templates.sql
-- Conectores BR e sistema de templates

BEGIN;

-- Tabela para catálogo de conectores
CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('communication', 'finance', 'erp', 'crm', 'ai', 'storage', 'analytics')),
    icon TEXT,
    is_br_specific BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_required TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para versões de conectores
CREATE TABLE IF NOT EXISTS connector_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    config_schema JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (connector_id, version)
);

-- Tabela para ações dos conectores
CREATE TABLE IF NOT EXISTS connector_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    action_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_trigger BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (connector_id, action_key)
);

-- Tabela para instâncias de conexão
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'error', 'testing')),
    last_tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para segredos das conexões
CREATE TABLE IF NOT EXISTS connection_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    secret_name TEXT NOT NULL,
    encrypted_value BYTEA NOT NULL,
    kms_key_alias TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (connection_id, secret_name)
);

-- Tabela para marketplace de templates
CREATE TABLE IF NOT EXISTS template_marketplace (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('saude', 'varejo', 'contabil', 'rh', 'marketing', 'agro', 'geral')),
    author_id UUID REFERENCES users(id),
    price_credits INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    download_count INTEGER NOT NULL DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para versões de templates
CREATE TABLE IF NOT EXISTS template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_marketplace(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    workflow_definition JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, version)
);

-- Tabela para parâmetros de templates
CREATE TABLE IF NOT EXISTS template_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_marketplace(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    type TEXT NOT NULL
        CHECK (type IN ('string', 'number', 'boolean', 'select', 'multiselect', 'json')),
    required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    options JSONB, -- Para selects
    validation_rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para instalações de templates
CREATE TABLE IF NOT EXISTS template_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_marketplace(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    installed_by UUID NOT NULL REFERENCES users(id),
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para avaliações de templates
CREATE TABLE IF NOT EXISTS template_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES template_marketplace(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, user_id)
);

-- Tabela para deployments de workflows
CREATE TABLE IF NOT EXISTS workflow_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    environment TEXT NOT NULL
        CHECK (environment IN ('dev', 'stage', 'prod')),
    version_id UUID NOT NULL REFERENCES workflow_versions(id),
    deployed_by UUID REFERENCES users(id),
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'error')),
    UNIQUE (workflow_id, environment)
);

-- Tabela para aprovações de deployment
CREATE TABLE IF NOT EXISTS deployment_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_id UUID NOT NULL REFERENCES workflow_deployments(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (deployment_id, approver_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_connectors_category ON connectors (category);
CREATE INDEX IF NOT EXISTS idx_connectors_br_specific ON connectors (is_br_specific) WHERE is_br_specific = TRUE;
CREATE INDEX IF NOT EXISTS idx_connector_actions_connector ON connector_actions (connector_id);
CREATE INDEX IF NOT EXISTS idx_connections_workspace ON connections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connections_connector ON connections (connector_id);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_category ON template_marketplace (category);
CREATE INDEX IF NOT EXISTS idx_template_marketplace_public ON template_marketplace (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_installs_workspace ON template_installs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_template_installs_template ON template_installs (template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_deployments_workflow ON workflow_deployments (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_deployments_environment ON workflow_deployments (environment);

-- Inserir conectores BR específicos
INSERT INTO connectors (key, name, description, category, is_br_specific, compliance_required) VALUES
    ('pix', 'Pix', 'Integração com sistema de pagamentos instantâneos Pix', 'finance', TRUE, ARRAY['lgpd']),
    ('whatsapp_business', 'WhatsApp Business', 'API oficial do WhatsApp Business', 'communication', TRUE, ARRAY['lgpd']),
    ('nfe', 'NF-e', 'Nota Fiscal Eletrônica', 'finance', TRUE, ARRAY['lgpd', 'fiscal']),
    ('nfse', 'NFS-e', 'Nota Fiscal de Serviços Eletrônica', 'finance', TRUE, ARRAY['lgpd', 'fiscal']),
    ('esocial', 'eSocial', 'Sistema de Escrituração Digital das Obrigações Fiscais', 'finance', TRUE, ARRAY['lgpd', 'fiscal']),
    ('tiss', 'TISS', 'Padrão TISS para troca de informações de saúde suplementar', 'finance', TRUE, ARRAY['lgpd', 'ans']),
    ('glpi', 'GLPI', 'Sistema de gestão de chamados e ativos', 'crm', FALSE, ARRAY['lgpd']),
    ('rd_station', 'RD Station', 'Plataforma de marketing digital', 'marketing', TRUE, ARRAY['lgpd']),
    ('totvs', 'TOTVS', 'Sistema ERP TOTVS', 'erp', TRUE, ARRAY['lgpd']),
    ('protheus', 'Protheus', 'Sistema ERP Protheus', 'erp', TRUE, ARRAY['lgpd']),
    ('sankhya', 'Sankhya', 'Sistema ERP Sankhya', 'erp', TRUE, ARRAY['lgpd']),
    ('omie', 'Omie', 'Sistema ERP Omie', 'erp', TRUE, ARRAY['lgpd'])
ON CONFLICT (key) DO NOTHING;

-- Inserir templates padrão por vertical
INSERT INTO template_marketplace (key, name, description, category, price_credits, is_featured) VALUES
    ('br.saude.concilia-pix', 'Conciliação Financeira - Saúde', 'Concilia títulos médicos com extratos bancários via Pix', 'saude', 0, TRUE),
    ('br.saude.glosa-automatica', 'Glosa Automática', 'Processa glosas de forma automatizada', 'saude', 0, TRUE),
    ('br.varejo.ruptura-estoque', 'Alerta de Ruptura', 'Monitora estoque e cria pedidos automaticamente', 'varejo', 0, TRUE),
    ('br.varejo.preco-dinamico', 'Preço Dinâmico', 'Ajusta preços baseado em vendas e concorrência', 'varejo', 0, TRUE),
    ('br.marketing.leads-nutricao', 'Funil de Leads', 'Capta, limpa e nutre leads via WhatsApp', 'marketing', 0, TRUE),
    ('br.contabil.nfe-automatica', 'NF-e Automática', 'Download e classificação automática de NF-e', 'contabil', 0, TRUE),
    ('br.contabil.concilia-bancaria', 'Conciliação Bancária', 'Concilia extratos com lançamentos contábeis', 'contabil', 0, TRUE),
    ('br.rh.onboarding', 'Onboarding de Funcionários', 'Automatiza processo de integração de novos funcionários', 'rh', 0, TRUE),
    ('br.agro.telemetria', 'Telemetria Agrícola', 'Monitora sensores e aciona irrigação', 'agro', 0, TRUE)
ON CONFLICT (key) DO NOTHING;

COMMIT;
