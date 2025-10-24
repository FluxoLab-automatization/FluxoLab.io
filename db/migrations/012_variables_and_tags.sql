-- 012_variables_and_tags.sql
-- Sistema de variáveis e tags para organização

BEGIN;

-- Tabela para variáveis globais do sistema
CREATE TABLE IF NOT EXISTS variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'string'
        CHECK (type IN ('string', 'number', 'boolean', 'json', 'secret')),
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para variáveis específicas do workspace
CREATE TABLE IF NOT EXISTS workspace_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    value TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'string'
        CHECK (type IN ('string', 'number', 'boolean', 'json', 'secret')),
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para categorias de tags
CREATE TABLE IF NOT EXISTS tag_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    category_id UUID REFERENCES tag_categories(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela de relacionamento entre workflows e tags
CREATE TABLE IF NOT EXISTS workflow_tags (
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (workflow_id, tag_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_variables_name ON variables (name);
CREATE INDEX IF NOT EXISTS idx_variables_type ON variables (type);
CREATE INDEX IF NOT EXISTS idx_workspace_variables_workspace ON workspace_variables (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_variables_name ON workspace_variables (workspace_id, name);
CREATE INDEX IF NOT EXISTS idx_tags_workspace ON tags (workspace_id);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags (category_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tags_workflow ON workflow_tags (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_tags_tag ON workflow_tags (tag_id);

-- Inserir categorias padrão de tags
INSERT INTO tag_categories (name, description, color) VALUES
    ('automation', 'Automação e workflows', '#10b981'),
    ('integration', 'Integrações e conectores', '#3b82f6'),
    ('notification', 'Notificações e alertas', '#f59e0b'),
    ('data', 'Processamento de dados', '#8b5cf6'),
    ('ai', 'Inteligência Artificial', '#ec4899'),
    ('workflow', 'Fluxos de trabalho', '#06b6d4'),
    ('testing', 'Testes e desenvolvimento', '#84cc16'),
    ('production', 'Produção e deploy', '#ef4444')
ON CONFLICT (name) DO NOTHING;

COMMIT;

