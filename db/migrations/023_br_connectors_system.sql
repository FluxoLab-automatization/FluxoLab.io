-- 023_br_connectors_system.sql
-- Sistema de conectores brasileiros

BEGIN;

-- Tabela para conectores
CREATE TABLE IF NOT EXISTS connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('banking', 'payment', 'communication', 'erp', 'crm', 'fiscal', 'health', 'retail', 'agro', 'hr')),
    connector_type TEXT NOT NULL
        CHECK (connector_type IN ('api', 'webhook', 'file', 'database', 'message_queue')),
    icon_url TEXT,
    documentation_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, slug)
);

-- Tabela para versões de conectores
CREATE TABLE IF NOT EXISTS connector_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    changelog TEXT,
    config_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    auth_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (connector_id, version)
);

-- Tabela para ações de conectores
CREATE TABLE IF NOT EXISTS connector_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    action_name TEXT NOT NULL,
    action_type TEXT NOT NULL
        CHECK (action_type IN ('trigger', 'action', 'search', 'create', 'update', 'delete')),
    description TEXT,
    input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para conexões (instâncias de conectores)
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para segredos de conexões
CREATE TABLE IF NOT EXISTS connection_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    secret_name TEXT NOT NULL,
    secret_value TEXT NOT NULL,
    is_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (connection_id, secret_name)
);

-- Tabela para tokens OAuth
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    token_type TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    scope TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conectores BR específicos
INSERT INTO connectors (workspace_id, name, slug, description, category, connector_type, is_public, created_by) VALUES
-- Banking & Payments
('00000000-0000-0000-0000-000000000000', 'PIX - Banco Central', 'pix-bcb', 'Conector para PIX do Banco Central do Brasil', 'banking', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'WhatsApp Business API', 'whatsapp-business', 'Conector para WhatsApp Business API', 'communication', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'GLPI', 'glpi', 'Conector para GLPI (Gestionnaire Libre de Parc Informatique)', 'erp', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'NF-e/NFS-e', 'nfe-nfse', 'Conector para Nota Fiscal Eletrônica', 'fiscal', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Meta Leads', 'meta-leads', 'Conector para Meta Leads (Facebook/Instagram)', 'marketing', 'api', TRUE, NULL),

-- ERPs Brasileiros
('00000000-0000-0000-0000-000000000000', 'TOTVS Protheus', 'totvs-protheus', 'Conector para TOTVS Protheus', 'erp', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Sankhya', 'sankhya', 'Conector para Sankhya ERP', 'erp', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Omie', 'omie', 'Conector para Omie ERP', 'erp', 'api', TRUE, NULL),

-- Bancos
('00000000-0000-0000-0000-000000000000', 'Banco do Brasil', 'banco-brasil', 'Conector para Banco do Brasil', 'banking', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Itaú', 'itau', 'Conector para Itaú', 'banking', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Bradesco', 'bradesco', 'Conector para Bradesco', 'banking', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Caixa Econômica', 'caixa-economica', 'Conector para Caixa Econômica Federal', 'banking', 'api', TRUE, NULL),

-- Saúde
('00000000-0000-0000-0000-000000000000', 'ANS - Agência Nacional de Saúde', 'ans', 'Conector para ANS', 'health', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'TISS - Troca de Informação em Saúde Suplementar', 'tiss', 'Conector para TISS', 'health', 'api', TRUE, NULL),

-- Varejo
('00000000-0000-0000-0000-000000000000', 'Mercado Livre', 'mercado-livre', 'Conector para Mercado Livre', 'retail', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Shopee', 'shopee', 'Conector para Shopee', 'retail', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Magalu', 'magalu', 'Conector para Magazine Luiza', 'retail', 'api', TRUE, NULL),

-- Agro
('00000000-0000-0000-0000-000000000000', 'Embrapa', 'embrapa', 'Conector para Embrapa', 'agro', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Conab', 'conab', 'Conector para Conab', 'agro', 'api', TRUE, NULL),

-- RH
('00000000-0000-0000-0000-000000000000', 'eSocial', 'esocial', 'Conector para eSocial', 'hr', 'api', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'FGTS', 'fgts', 'Conector para FGTS', 'hr', 'api', TRUE, NULL);

-- Versões dos conectores
INSERT INTO connector_versions (connector_id, version, is_active, config_schema, auth_schema) 
SELECT 
    c.id,
    '1.0.0',
    TRUE,
    CASE c.slug
        WHEN 'pix-bcb' THEN '{"type": "object", "properties": {"environment": {"type": "string", "enum": ["sandbox", "production"]}, "client_id": {"type": "string"}, "client_secret": {"type": "string"}}'::jsonb
        WHEN 'whatsapp-business' THEN '{"type": "object", "properties": {"phone_number_id": {"type": "string"}, "access_token": {"type": "string"}, "webhook_verify_token": {"type": "string"}}'::jsonb
        WHEN 'glpi' THEN '{"type": "object", "properties": {"base_url": {"type": "string"}, "username": {"type": "string"}, "password": {"type": "string"}}'::jsonb
        WHEN 'nfe-nfse' THEN '{"type": "object", "properties": {"environment": {"type": "string", "enum": ["homologacao", "producao"]}, "certificate": {"type": "string"}, "certificate_password": {"type": "string"}}'::jsonb
        ELSE '{"type": "object", "properties": {}}'::jsonb
    END,
    CASE c.slug
        WHEN 'pix-bcb' THEN '{"type": "oauth2", "flows": {"authorizationCode": {"authorizationUrl": "https://pix.bcb.gov.br/oauth/authorize", "tokenUrl": "https://pix.bcb.gov.br/oauth/token"}}}'::jsonb
        WHEN 'whatsapp-business' THEN '{"type": "bearer", "bearerFormat": "JWT"}'::jsonb
        WHEN 'glpi' THEN '{"type": "basic"}'::jsonb
        WHEN 'nfe-nfse' THEN '{"type": "certificate"}'::jsonb
        ELSE '{"type": "apiKey", "in": "header", "name": "Authorization"}'::jsonb
    END
FROM connectors c;

-- Ações dos conectores
INSERT INTO connector_actions (connector_id, action_name, action_type, description, input_schema, output_schema)
SELECT 
    c.id,
    'webhook_received',
    'trigger',
    'Webhook recebido',
    '{"type": "object", "properties": {"payload": {"type": "object"}}}'::jsonb,
    '{"type": "object", "properties": {"event_type": {"type": "string"}, "data": {"type": "object"}}}'::jsonb
FROM connectors c
WHERE c.slug IN ('pix-bcb', 'whatsapp-business', 'meta-leads');

-- Ações específicas por conector
INSERT INTO connector_actions (connector_id, action_name, action_type, description, input_schema, output_schema)
SELECT 
    c.id,
    CASE c.slug
        WHEN 'pix-bcb' THEN 'create_pix_payment'
        WHEN 'whatsapp-business' THEN 'send_message'
        WHEN 'glpi' THEN 'create_ticket'
        WHEN 'nfe-nfse' THEN 'generate_nfe'
        WHEN 'meta-leads' THEN 'get_lead'
        ELSE 'generic_action'
    END,
    'action',
    CASE c.slug
        WHEN 'pix-bcb' THEN 'Criar pagamento PIX'
        WHEN 'whatsapp-business' THEN 'Enviar mensagem WhatsApp'
        WHEN 'glpi' THEN 'Criar ticket GLPI'
        WHEN 'nfe-nfse' THEN 'Gerar NF-e'
        WHEN 'meta-leads' THEN 'Obter lead'
        ELSE 'Ação genérica'
    END,
    CASE c.slug
        WHEN 'pix-bcb' THEN '{"type": "object", "properties": {"amount": {"type": "number"}, "description": {"type": "string"}, "payer": {"type": "object"}}}'::jsonb
        WHEN 'whatsapp-business' THEN '{"type": "object", "properties": {"to": {"type": "string"}, "message": {"type": "string"}, "type": {"type": "string"}}}'::jsonb
        WHEN 'glpi' THEN '{"type": "object", "properties": {"title": {"type": "string"}, "description": {"type": "string"}, "priority": {"type": "number"}}}'::jsonb
        WHEN 'nfe-nfse' THEN '{"type": "object", "properties": {"emitter": {"type": "object"}, "receiver": {"type": "object"}, "items": {"type": "array"}}}'::jsonb
        WHEN 'meta-leads' THEN '{"type": "object", "properties": {"lead_id": {"type": "string"}}}'::jsonb
        ELSE '{"type": "object", "properties": {}}'::jsonb
    END,
    CASE c.slug
        WHEN 'pix-bcb' THEN '{"type": "object", "properties": {"payment_id": {"type": "string"}, "status": {"type": "string"}, "qr_code": {"type": "string"}}}'::jsonb
        WHEN 'whatsapp-business' THEN '{"type": "object", "properties": {"message_id": {"type": "string"}, "status": {"type": "string"}}}'::jsonb
        WHEN 'glpi' THEN '{"type": "object", "properties": {"ticket_id": {"type": "string"}, "status": {"type": "string"}}}'::jsonb
        WHEN 'nfe-nfse' THEN '{"type": "object", "properties": {"nfe_id": {"type": "string"}, "status": {"type": "string"}, "xml": {"type": "string"}}}'::jsonb
        WHEN 'meta-leads' THEN '{"type": "object", "properties": {"lead_data": {"type": "object"}}}'::jsonb
        ELSE '{"type": "object", "properties": {"result": {"type": "object"}}}'::jsonb
    END
FROM connectors c;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_connectors_workspace ON connectors (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connectors_category ON connectors (category);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON connectors (connector_type);
CREATE INDEX IF NOT EXISTS idx_connectors_public ON connectors (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_connectors_active ON connectors (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connector_versions_connector ON connector_versions (connector_id);
CREATE INDEX IF NOT EXISTS idx_connector_versions_active ON connector_versions (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connector_actions_connector ON connector_actions (connector_id);
CREATE INDEX IF NOT EXISTS idx_connector_actions_type ON connector_actions (action_type);
CREATE INDEX IF NOT EXISTS idx_connector_actions_active ON connector_actions (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connections_workspace ON connections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connections_connector ON connections (connector_id);
CREATE INDEX IF NOT EXISTS idx_connections_active ON connections (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connection_secrets_connection ON connection_secrets (connection_id);
CREATE INDEX IF NOT EXISTS idx_connection_secrets_name ON connection_secrets (secret_name);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_connection ON oauth_tokens (connection_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON oauth_tokens (expires_at);

COMMIT;
