-- 014_support_system.sql
-- Sistema de suporte e tickets

BEGIN;

-- Tabela para categorias de suporte
CREATE TABLE IF NOT EXISTS support_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para prioridades de suporte
CREATE TABLE IF NOT EXISTS support_priorities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    sla_hours INTEGER NOT NULL DEFAULT 24,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para status de tickets
CREATE TABLE IF NOT EXISTS support_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#6366f1',
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela principal de tickets de suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES support_categories(id),
    priority_id UUID NOT NULL REFERENCES support_priorities(id),
    status_id UUID NOT NULL REFERENCES support_statuses(id),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para mensagens dos tickets
CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para anexos dos tickets
CREATE TABLE IF NOT EXISTS support_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para histórico de mudanças de status
CREATE TABLE IF NOT EXISTS support_ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para avaliações de tickets
CREATE TABLE IF NOT EXISTS support_ticket_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ticket_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_workspace ON support_tickets (workspace_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets (assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets (status_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets (priority_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets (category_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket ON support_ticket_messages (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_user ON support_ticket_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_support_attachments_ticket ON support_attachments (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_history_ticket ON support_ticket_history (ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_ratings_ticket ON support_ticket_ratings (ticket_id);

-- Inserir dados padrão
INSERT INTO support_categories (name, description, color) VALUES
    ('bug', 'Relatório de bugs e problemas técnicos', '#ef4444'),
    ('feature', 'Solicitação de novas funcionalidades', '#3b82f6'),
    ('integration', 'Problemas com integrações', '#8b5cf6'),
    ('billing', 'Questões de faturamento e planos', '#10b981'),
    ('account', 'Problemas com conta e acesso', '#f59e0b'),
    ('workflow', 'Dúvidas sobre workflows', '#06b6d4'),
    ('general', 'Outras questões', '#6b7280')
ON CONFLICT (name) DO NOTHING;

INSERT INTO support_priorities (name, level, description, color, sla_hours) VALUES
    ('critical', 1, 'Crítico - Sistema inoperante', '#ef4444', 2),
    ('high', 2, 'Alto - Funcionalidade importante afetada', '#f59e0b', 8),
    ('medium', 3, 'Médio - Problema com workaround', '#3b82f6', 24),
    ('low', 4, 'Baixo - Melhoria ou dúvida', '#10b981', 72)
ON CONFLICT (name) DO NOTHING;

INSERT INTO support_statuses (name, description, color, is_final) VALUES
    ('open', 'Ticket aberto', '#3b82f6', FALSE),
    ('in_progress', 'Em andamento', '#f59e0b', FALSE),
    ('waiting_customer', 'Aguardando cliente', '#8b5cf6', FALSE),
    ('resolved', 'Resolvido', '#10b981', FALSE),
    ('closed', 'Fechado', '#6b7280', TRUE),
    ('cancelled', 'Cancelado', '#ef4444', TRUE)
ON CONFLICT (name) DO NOTHING;

COMMIT;

