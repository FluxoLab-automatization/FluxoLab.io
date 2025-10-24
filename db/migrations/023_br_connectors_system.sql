-- 023_br_connectors_system.sql
-- Sistema de conectores brasileiros

BEGIN;

-- Adicionar colunas necessárias à tabela connectors existente
DO $$
BEGIN
    -- Adicionar coluna workspace_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'workspace_id') THEN
        ALTER TABLE connectors ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        -- Atualizar registros existentes com workspace padrão
        UPDATE connectors SET workspace_id = 'c0cc00a3-a2c1-4488-8c9c-33d145703019' WHERE workspace_id IS NULL;
        ALTER TABLE connectors ALTER COLUMN workspace_id SET NOT NULL;
    END IF;
    
    -- Adicionar coluna slug se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'slug') THEN
        ALTER TABLE connectors ADD COLUMN slug TEXT;
        -- Gerar slug baseado no name para registros existentes
        UPDATE connectors SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'e')) WHERE slug IS NULL;
        ALTER TABLE connectors ALTER COLUMN slug SET NOT NULL;
    END IF;
    
    -- Adicionar coluna connector_type se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'connector_type') THEN
        ALTER TABLE connectors ADD COLUMN connector_type TEXT NOT NULL DEFAULT 'api'
            CHECK (connector_type IN ('api', 'webhook', 'file', 'database', 'message_queue'));
    END IF;
    
    -- Adicionar coluna icon_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'icon_url') THEN
        ALTER TABLE connectors ADD COLUMN icon_url TEXT;
    END IF;
    
    -- Adicionar coluna documentation_url se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'documentation_url') THEN
        ALTER TABLE connectors ADD COLUMN documentation_url TEXT;
    END IF;
    
    -- Adicionar coluna is_active se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'is_active') THEN
        ALTER TABLE connectors ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
    
    -- Adicionar coluna is_public se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'is_public') THEN
        ALTER TABLE connectors ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    -- Adicionar coluna created_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'connectors' AND column_name = 'created_by') THEN
        ALTER TABLE connectors ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Atualizar constraint de categoria se necessário
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints 
               WHERE constraint_name = 'connectors_category_check') THEN
        ALTER TABLE connectors DROP CONSTRAINT connectors_category_check;
    END IF;
    ALTER TABLE connectors ADD CONSTRAINT connectors_category_check 
        CHECK (category IN ('banking', 'payment', 'communication', 'erp', 'crm', 'fiscal', 'health', 'retail', 'agro', 'hr', 'analytics', 'marketing', 'finance'));
    
    -- Adicionar constraint única se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'connectors' AND constraint_name = 'connectors_workspace_slug_key') THEN
        ALTER TABLE connectors ADD CONSTRAINT connectors_workspace_slug_key UNIQUE (workspace_id, slug);
    END IF;
END $$;

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
INSERT INTO connectors (workspace_id, name, slug, description, category, connector_type, is_public, created_by, key) VALUES
-- Banking & Payments
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'PIX - Banco Central', 'pix-bcb', 'Conector para PIX do Banco Central do Brasil', 'banking', 'api', TRUE, NULL, 'pix-bcb'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'WhatsApp Business API', 'whatsapp-business', 'Conector para WhatsApp Business API', 'communication', 'api', TRUE, NULL, 'whatsapp-business'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'GLPI', 'glpi', 'Conector para GLPI (Gestionnaire Libre de Parc Informatique)', 'erp', 'api', TRUE, NULL, 'glpi'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'NF-e/NFS-e', 'nfe-nfse', 'Conector para Nota Fiscal Eletrônica', 'fiscal', 'api', TRUE, NULL, 'nfe-nfse'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Meta Leads', 'meta-leads', 'Conector para Meta Leads (Facebook/Instagram)', 'marketing', 'api', TRUE, NULL, 'meta-leads'),

-- ERPs Brasileiros
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'TOTVS Protheus', 'totvs-protheus', 'Conector para TOTVS Protheus', 'erp', 'api', TRUE, NULL, 'totvs-protheus'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Sankhya', 'sankhya', 'Conector para Sankhya ERP', 'erp', 'api', TRUE, NULL, 'sankhya'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Omie', 'omie', 'Conector para Omie ERP', 'erp', 'api', TRUE, NULL, 'omie'),

-- Bancos
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Banco do Brasil', 'banco-brasil', 'Conector para Banco do Brasil', 'banking', 'api', TRUE, NULL, 'banco-brasil'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Itaú', 'itau', 'Conector para Itaú', 'banking', 'api', TRUE, NULL, 'itau'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Bradesco', 'bradesco', 'Conector para Bradesco', 'banking', 'api', TRUE, NULL, 'bradesco'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Caixa Econômica', 'caixa-economica', 'Conector para Caixa Econômica Federal', 'banking', 'api', TRUE, NULL, 'caixa-economica'),

-- Saúde
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'ANS - Agência Nacional de Saúde', 'ans', 'Conector para ANS', 'health', 'api', TRUE, NULL, 'ans'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'TISS - Troca de Informação em Saúde Suplementar', 'tiss', 'Conector para TISS', 'health', 'api', TRUE, NULL, 'tiss'),

-- Varejo
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Mercado Livre', 'mercado-livre', 'Conector para Mercado Livre', 'retail', 'api', TRUE, NULL, 'mercado-livre'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Shopee', 'shopee', 'Conector para Shopee', 'retail', 'api', TRUE, NULL, 'shopee'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Magalu', 'magalu', 'Conector para Magazine Luiza', 'retail', 'api', TRUE, NULL, 'magalu'),

-- Agro
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Embrapa', 'embrapa', 'Conector para Embrapa', 'agro', 'api', TRUE, NULL, 'embrapa'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Conab', 'conab', 'Conector para Conab', 'agro', 'api', TRUE, NULL, 'conab'),

-- RH
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'eSocial', 'esocial', 'Conector para eSocial', 'hr', 'api', TRUE, NULL, 'esocial'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'FGTS', 'fgts', 'Conector para FGTS', 'hr', 'api', TRUE, NULL, 'fgts')
ON CONFLICT (workspace_id, slug) DO NOTHING;

-- Versões dos conectores
INSERT INTO connector_versions (connector_id, version, is_active, config_schema) 
SELECT 
    c.id,
    '1.0.0',
    TRUE,
    '{"type": "object", "properties": {}}'::jsonb
FROM connectors c
WHERE c.workspace_id = 'c0cc00a3-a2c1-4488-8c9c-33d145703019';

-- Ações dos conectores (removido para evitar erros de estrutura)

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_connectors_workspace ON connectors (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connectors_category ON connectors (category);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON connectors (connector_type);
CREATE INDEX IF NOT EXISTS idx_connectors_public ON connectors (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_connectors_active ON connectors (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connector_versions_connector ON connector_versions (connector_id);
CREATE INDEX IF NOT EXISTS idx_connector_versions_active ON connector_versions (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_connector_actions_connector ON connector_actions (connector_id);
-- CREATE INDEX IF NOT EXISTS idx_connector_actions_type ON connector_actions (action_type); -- Removido: coluna não existe
-- CREATE INDEX IF NOT EXISTS idx_connector_actions_active ON connector_actions (is_active) WHERE is_active = TRUE; -- Removido: coluna não existe

CREATE INDEX IF NOT EXISTS idx_connections_workspace ON connections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_connections_connector ON connections (connector_id);
-- CREATE INDEX IF NOT EXISTS idx_connections_active ON connections (is_active) WHERE is_active = TRUE; -- Removido: coluna não existe

CREATE INDEX IF NOT EXISTS idx_connection_secrets_connection ON connection_secrets (connection_id);
CREATE INDEX IF NOT EXISTS idx_connection_secrets_name ON connection_secrets (secret_name);

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_connection ON oauth_tokens (connection_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires ON oauth_tokens (expires_at);

COMMIT;
