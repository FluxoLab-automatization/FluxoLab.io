-- 025_ai_guardrails_system.sql
-- Sistema de IA com guardrails

BEGIN;

-- Tabela para biblioteca de prompts
CREATE TABLE IF NOT EXISTS prompt_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('general', 'analysis', 'workflow', 'generation', 'extraction', 'classification', 'workflow', 'custom')),
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, slug)
);

-- Tabela para versões de prompts
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    prompt_text TEXT NOT NULL,
    system_prompt TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    model_config JSONB DEFAULT '{}'::jsonb,
    safety_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (prompt_id, version)
);

-- Tabela para execuções de IA
CREATE TABLE IF NOT EXISTS ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    run_id UUID REFERENCES executions(id) ON DELETE SET NULL,
    step_id UUID,
    prompt_id UUID NOT NULL REFERENCES prompt_library(id) ON DELETE CASCADE,
    prompt_version_id UUID NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    model_used TEXT NOT NULL,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10,4) NOT NULL DEFAULT 0,
    execution_time_ms INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed', 'blocked')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Tabela para avaliações de IA
CREATE TABLE IF NOT EXISTS ai_eval_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    eval_type TEXT NOT NULL
        CHECK (eval_type IN ('safety', 'quality', 'relevance', 'bias', 'toxicity', 'custom')),
    score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
    details JSONB DEFAULT '{}'::jsonb,
    evaluated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para redações de PII
CREATE TABLE IF NOT EXISTS ai_redactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    original_value TEXT NOT NULL,
    redacted_value TEXT NOT NULL,
    redaction_type TEXT NOT NULL
        CHECK (redaction_type IN ('mask', 'hash', 'tokenize', 'remove', 'replace')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para coleções RAG
CREATE TABLE IF NOT EXISTS rag_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    embedding_model TEXT NOT NULL DEFAULT 'text-embedding-ada-002',
    chunk_size INTEGER NOT NULL DEFAULT 1000,
    chunk_overlap INTEGER NOT NULL DEFAULT 200,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- Tabela para documentos RAG
CREATE TABLE IF NOT EXISTS rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para chunks RAG
CREATE TABLE IF NOT EXISTS rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding VECTOR(1536), -- Para OpenAI embeddings
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para índices RAG
CREATE TABLE IF NOT EXISTS rag_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES rag_collections(id) ON DELETE CASCADE,
    index_name TEXT NOT NULL,
    index_type TEXT NOT NULL DEFAULT 'hnsw'
        CHECK (index_type IN ('hnsw', 'ivf', 'flat')),
    index_config JSONB DEFAULT '{}'::jsonb,
    is_built BOOLEAN NOT NULL DEFAULT FALSE,
    built_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (collection_id, index_name)
);

-- Prompts padrão para verticals brasileiros
INSERT INTO prompt_library (workspace_id, name, description, category, template, is_public, created_by) VALUES
-- Saúde
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de Prontuário Médico', 'Analisa prontuários médicos e extrai informações relevantes', 'analysis', 'Analise o prontuário médico fornecido e extraia as informações relevantes.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Classificação de CID-10', 'Classifica diagnósticos usando CID-10', 'analysis', 'Classifique o diagnóstico fornecido usando o código CID-10 apropriado.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de TISS', 'Analisa arquivos TISS para reembolso', 'analysis', 'Analise o arquivo TISS fornecido para processamento de reembolso.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),

-- Marketing
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Scoring de Leads', 'Calcula score de leads baseado em dados', 'generation', 'Calcule o score do lead baseado nos dados fornecidos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Geração de Copy', 'Gera copy para campanhas de marketing', 'generation', 'Gere copy persuasivo para a campanha de marketing especificada.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de Sentimento', 'Analisa sentimento de comentários e reviews', 'generation', 'Analise o sentimento dos comentários e reviews fornecidos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),

-- Contábil
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Classificação de Despesas', 'Classifica despesas por categoria contábil', 'classification', 'Classifique a despesa fornecida pela categoria contábil apropriada.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de Balanço', 'Analisa balanços e demonstrações contábeis', 'classification', 'Analise o balanço e demonstrações contábeis fornecidos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Conciliação Bancária', 'Auxilia na conciliação bancária', 'classification', 'Auxilie na conciliação bancária com os dados fornecidos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),

-- Varejo
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de Produtos', 'Analisa produtos e sugere melhorias', 'workflow', 'Analise o produto fornecido e sugira melhorias.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Previsão de Demanda', 'Prevê demanda de produtos', 'workflow', 'Preveja a demanda do produto baseado nos dados históricos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Atendimento ao Cliente', 'Atende clientes via chat', 'workflow', 'Atenda o cliente via chat de forma profissional e eficiente.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),

-- Agro
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de Solo', 'Analisa dados de solo e sugere cultivos', 'extraction', 'Analise os dados de solo fornecidos e sugira cultivos apropriados.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Monitoramento de Pragas', 'Identifica pragas e sugere tratamentos', 'extraction', 'Identifique as pragas e sugira tratamentos apropriados.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Previsão Climática', 'Analisa dados climáticos para agricultura', 'extraction', 'Analise os dados climáticos para auxiliar na agricultura.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),

-- RH
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de CV', 'Analisa currículos e extrai informações', 'workflow', 'Analise o currículo fornecido e extraia as informações relevantes.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Avaliação de Desempenho', 'Auxilia na avaliação de desempenho', 'workflow', 'Auxilie na avaliação de desempenho do funcionário.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Análise de eSocial', 'Analisa eventos do eSocial', 'workflow', 'Analise os eventos do eSocial fornecidos.', TRUE, '1357b80a-4acc-4b98-b4e8-8ab9a68b98ef');

-- Versões dos prompts
INSERT INTO prompt_versions (prompt_id, version, template, variables, guardrails)
SELECT 
    p.id,
    1,
    p.template,
    '{}',
    '{"max_tokens": 2000, "content_filter": true}'
FROM prompt_library p
WHERE p.workspace_id = 'c0cc00a3-a2c1-4488-8c9c-33d145703019';

-- Coleções RAG padrão
INSERT INTO rag_collections (workspace_id, name, description, embedding_model) VALUES
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Documentação Técnica', 'Documentação técnica da FluxoLab', 'text-embedding-ada-002'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Base de Conhecimento LGPD', 'Base de conhecimento sobre LGPD', 'text-embedding-ada-002'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Normas Contábeis', 'Normas brasileiras de contabilidade', 'text-embedding-ada-002'),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Regulamentações ANS', 'Regulamentações da Agência Nacional de Saúde', 'text-embedding-ada-002');

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_workspace ON prompt_library (workspace_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library (category);
CREATE INDEX IF NOT EXISTS idx_prompt_library_public ON prompt_library (is_public) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON prompt_versions (prompt_id);

CREATE INDEX IF NOT EXISTS idx_ai_runs_run ON ai_runs (run_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at ON ai_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_run ON ai_eval_scores (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_score ON ai_eval_scores (score);

CREATE INDEX IF NOT EXISTS idx_ai_redactions_run ON ai_redactions (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_redactions_type ON ai_redactions (redaction_type);

CREATE INDEX IF NOT EXISTS idx_rag_collections_workspace ON rag_collections (workspace_id);

CREATE INDEX IF NOT EXISTS idx_rag_documents_collection ON rag_documents (collection_id);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON rag_chunks (document_id);

CREATE INDEX IF NOT EXISTS idx_rag_indices_collection ON rag_indices (collection_id);

-- Função para detectar PII
CREATE OR REPLACE FUNCTION detect_pii(input_text TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '[]'::jsonb;
    patterns JSONB := '{
        "cpf": "\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b",
        "cnpj": "\\b\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}\\b",
        "email": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
        "phone": "\\b\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}\\b",
        "credit_card": "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"
    }'::jsonb;
    pattern_key TEXT;
    pattern_value TEXT;
    matches TEXT[];
BEGIN
    FOR pattern_key, pattern_value IN SELECT * FROM jsonb_each(patterns)
    LOOP
        SELECT array_agg(match) INTO matches
        FROM regexp_matches(input_text, pattern_value, 'g') AS match;
        
        IF matches IS NOT NULL AND array_length(matches, 1) > 0 THEN
            result := result || jsonb_build_object(
                'type', pattern_key,
                'matches', to_jsonb(matches),
                'count', array_length(matches, 1)
            );
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para mascarar PII
CREATE OR REPLACE FUNCTION mask_pii(input_text TEXT, mask_type TEXT DEFAULT 'hash')
RETURNS TEXT AS $$
DECLARE
    result TEXT := input_text;
    patterns JSONB := '{
        "cpf": "\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b",
        "cnpj": "\\b\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}\\b",
        "email": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
        "phone": "\\b\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}\\b"
    }'::jsonb;
    pattern_key TEXT;
    pattern_value TEXT;
    mask_value TEXT;
BEGIN
    FOR pattern_key, pattern_value IN SELECT * FROM jsonb_each(patterns)
    LOOP
        CASE mask_type
            WHEN 'hash' THEN
                mask_value := encode(digest(pattern_key || ':' || input_text, 'sha256'), 'hex');
            WHEN 'mask' THEN
                mask_value := '[MASKED_' || upper(pattern_key) || ']';
            WHEN 'remove' THEN
                mask_value := '';
            ELSE
                mask_value := '[REDACTED]';
        END CASE;
        
        result := regexp_replace(result, pattern_value, mask_value, 'g');
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMIT;
