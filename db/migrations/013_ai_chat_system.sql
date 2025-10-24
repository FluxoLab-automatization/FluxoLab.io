-- 013_ai_chat_system.sql
-- Sistema de chat com IA para auxiliar na criação de workflows

BEGIN;

-- Tabela para conversas com IA
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    context_type TEXT NOT NULL DEFAULT 'workflow'
        CHECK (context_type IN ('workflow', 'general', 'troubleshooting', 'learning')),
    context_data JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para mensagens da conversa
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL
        CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para sugestões de workflow geradas pela IA
CREATE TABLE IF NOT EXISTS ai_workflow_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL
        CHECK (suggestion_type IN ('workflow', 'node', 'optimization', 'fix')),
    title TEXT NOT NULL,
    description TEXT,
    workflow_definition JSONB,
    confidence_score DECIMAL(3,2) DEFAULT 0.0
        CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'modified')),
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para templates de prompt da IA
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    template TEXT NOT NULL,
    variables TEXT[] DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('general', 'workflow', 'troubleshooting', 'learning')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para configurações de IA por workspace
CREATE TABLE IF NOT EXISTS workspace_ai_settings (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    max_tokens INTEGER NOT NULL DEFAULT 2000,
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7
        CHECK (temperature >= 0.0 AND temperature <= 2.0),
    enable_workflow_suggestions BOOLEAN NOT NULL DEFAULT TRUE,
    enable_code_generation BOOLEAN NOT NULL DEFAULT TRUE,
    custom_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_workspace ON ai_conversations (workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations (status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_suggestions_conversation ON ai_workflow_suggestions (conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_suggestions_user ON ai_workflow_suggestions (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workflow_suggestions_status ON ai_workflow_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates (category);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_active ON ai_prompt_templates (is_active) WHERE is_active = TRUE;

-- Inserir templates de prompt padrão
INSERT INTO ai_prompt_templates (name, description, template, variables, category) VALUES
    ('workflow_creation', 'Ajuda na criação de workflows', 'Você é um especialista em automação. Ajude o usuário a criar um workflow para: {{description}}. Considere os seguintes requisitos: {{requirements}}', ARRAY['description', 'requirements'], 'workflow'),
    ('workflow_optimization', 'Otimização de workflows existentes', 'Analise este workflow e sugira melhorias: {{workflow_definition}}. Foque em: {{focus_areas}}', ARRAY['workflow_definition', 'focus_areas'], 'workflow'),
    ('troubleshooting', 'Resolução de problemas', 'Ajude a resolver este problema no workflow: {{problem_description}}. Logs disponíveis: {{logs}}', ARRAY['problem_description', 'logs'], 'troubleshooting'),
    ('learning', 'Aprendizado sobre automação', 'Explique este conceito de automação: {{concept}}. Nível do usuário: {{user_level}}', ARRAY['concept', 'user_level'], 'learning')
ON CONFLICT (name) DO NOTHING;

COMMIT;

