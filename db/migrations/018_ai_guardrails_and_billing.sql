-- 018_ai_guardrails_and_billing.sql
-- IA com guardrails e sistema de billing

BEGIN;

-- Tabela para execuções de IA
CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    node_id UUID NOT NULL,
    model_name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost_credits DECIMAL(10,4) NOT NULL DEFAULT 0,
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para avaliações de IA
CREATE TABLE IF NOT EXISTS ai_eval_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    threshold DECIMAL(5,4) NOT NULL,
    passed BOOLEAN NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para redações de PII
CREATE TABLE IF NOT EXISTS ai_redactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    original_value TEXT NOT NULL,
    redacted_value TEXT NOT NULL,
    redaction_type TEXT NOT NULL
        CHECK (redaction_type IN ('mask', 'hash', 'remove', 'replace')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para biblioteca de prompts
CREATE TABLE IF NOT EXISTS prompt_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('workflow', 'classification', 'extraction', 'generation', 'analysis')),
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    guardrails JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para versões de prompts
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    template TEXT NOT NULL,
    variables JSONB DEFAULT '{}'::jsonb,
    guardrails JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (prompt_id, version)
);

-- Tabela para políticas de guardrails
CREATE TABLE IF NOT EXISTS guardrail_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para RAG (Retrieval Augmented Generation)
CREATE TABLE IF NOT EXISTS rag_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para documentos RAG
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para chunks RAG
CREATE TABLE IF NOT EXISTS rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding BYTEA, -- Para OpenAI ada-002 (requer extensão pgvector para VECTOR)
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para índices RAG
CREATE TABLE IF NOT EXISTS rag_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
    index_name TEXT NOT NULL,
    index_type TEXT NOT NULL DEFAULT 'hnsw',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sistema de Billing
CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    features JSONB NOT NULL DEFAULT '{}'::jsonb,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para componentes de preço
CREATE TABLE IF NOT EXISTS price_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES billing_plans(id) ON DELETE CASCADE,
    component_key TEXT NOT NULL,
    component_name TEXT NOT NULL,
    price_per_unit DECIMAL(10,4) NOT NULL,
    unit_type TEXT NOT NULL
        CHECK (unit_type IN ('execution', 'minute', 'gb', 'api_call', 'ai_token', 'user')),
    included_units INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, component_key)
);

-- Tabela para assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES billing_plans(id),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para contadores de uso
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    component_key TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, component_key, period_start, period_end)
);

-- Tabela para faturas
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    invoice_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'canceled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para linhas de fatura
CREATE TABLE IF NOT EXISTS invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    component_key TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL
        CHECK (payment_method IN ('pix', 'credit_card', 'bank_transfer', 'boleto')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    external_id TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ai_runs_run ON ai_runs (run_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at ON ai_runs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_run ON ai_eval_scores (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_redactions_run ON ai_redactions (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_workspace ON prompt_library (workspace_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library (category);
CREATE INDEX IF NOT EXISTS idx_rag_collections_workspace ON rag_collections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_collection ON rag_documents (collection_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON rag_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_workspace ON usage_counters (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_period ON usage_counters (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON invoices (workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);

-- Inserir planos de billing padrão
INSERT INTO billing_plans (name, description, price_monthly, price_yearly, features, limits) VALUES
    ('free', 'Plano Gratuito', 0.00, 0.00, 
     '{"workflows": 5, "executions_per_month": 1000, "ai_tokens": 10000, "support": "community"}'::jsonb,
     '{"max_workspaces": 1, "max_users": 3, "max_connections": 10}'::jsonb),
    
    ('starter', 'Plano Iniciante', 49.90, 499.00,
     '{"workflows": 25, "executions_per_month": 10000, "ai_tokens": 100000, "support": "email"}'::jsonb,
     '{"max_workspaces": 2, "max_users": 10, "max_connections": 50}'::jsonb),
    
    ('professional', 'Plano Profissional', 149.90, 1499.00,
     '{"workflows": 100, "executions_per_month": 50000, "ai_tokens": 500000, "support": "priority"}'::jsonb,
     '{"max_workspaces": 5, "max_users": 25, "max_connections": 200}'::jsonb),
    
    ('enterprise', 'Plano Empresarial', 499.90, 4999.00,
     '{"workflows": -1, "executions_per_month": -1, "ai_tokens": -1, "support": "dedicated"}'::jsonb,
     '{"max_workspaces": -1, "max_users": -1, "max_connections": -1}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Inserir componentes de preço
INSERT INTO price_components (plan_id, component_key, component_name, price_per_unit, unit_type, included_units)
SELECT 
    p.id,
    'execution',
    'Execução de Workflow',
    0.001,
    'execution',
    CASE 
        WHEN p.name = 'free' THEN 1000
        WHEN p.name = 'starter' THEN 10000
        WHEN p.name = 'professional' THEN 50000
        ELSE 0
    END
FROM billing_plans p
WHERE p.name IN ('free', 'starter', 'professional', 'enterprise')

UNION ALL

SELECT 
    p.id,
    'ai_token',
    'Token de IA',
    0.0001,
    'ai_token',
    CASE 
        WHEN p.name = 'free' THEN 10000
        WHEN p.name = 'starter' THEN 100000
        WHEN p.name = 'professional' THEN 500000
        ELSE 0
    END
FROM billing_plans p
WHERE p.name IN ('free', 'starter', 'professional', 'enterprise')

UNION ALL

SELECT 
    p.id,
    'whatsapp_message',
    'Mensagem WhatsApp',
    0.05,
    'api_call',
    CASE 
        WHEN p.name = 'free' THEN 100
        WHEN p.name = 'starter' THEN 1000
        WHEN p.name = 'professional' THEN 5000
        ELSE 0
    END
FROM billing_plans p
WHERE p.name IN ('free', 'starter', 'professional', 'enterprise');

COMMIT;
