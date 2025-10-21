BEGIN;

-- Tabela para armazenar fontes de leads (ex: 'Instagram', 'Website Form')
CREATE TABLE IF NOT EXISTS lead_sources (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL, -- Referencia ao tenant/workspace
    name VARCHAR(255) NOT NULL, -- Nome da fonte
    type VARCHAR(50) NOT NULL, -- Tipo (ex: 'webhook', 'api')
    config JSONB, -- Configurações específicas da fonte
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name)
);

-- Tabela para armazenar os leads capturados
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    source_id INTEGER REFERENCES lead_sources(id) ON DELETE SET NULL,
    contact_id INTEGER, -- Referencia a um futuro contato
    payload JSONB NOT NULL, -- Dados brutos do lead
    status VARCHAR(50) DEFAULT 'new',
    captured_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ
);

-- Tabela para definições de workflows
CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100) NOT NULL, -- Ex: 'lead.captured'
    definition JSONB NOT NULL, -- Definição do fluxo em JSON (nós, arestas)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para registrar as execuções de cada workflow
CREATE TABLE IF NOT EXISTS workflow_runs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL,
    workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
    trigger_event_id VARCHAR(255), -- ID do evento que disparou (ex: lead_id)
    status VARCHAR(50) NOT NULL, -- Ex: 'running', 'completed', 'failed'
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ,
    context JSONB, -- Contexto e resultados dos nós
    error TEXT
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_source_id ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_workflows_tenant_id ON workflows(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON workflow_runs(workflow_id);

COMMIT;
