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
        CHECK (category IN ('general', 'health', 'retail', 'marketing', 'agro', 'accounting', 'hr', 'custom')),
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
INSERT INTO prompt_library (workspace_id, name, slug, description, category, is_public, created_by) VALUES
-- Saúde
('00000000-0000-0000-0000-000000000000', 'Análise de Prontuário Médico', 'analise-prontuario-medico', 'Analisa prontuários médicos e extrai informações relevantes', 'health', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Classificação de CID-10', 'classificacao-cid10', 'Classifica diagnósticos usando CID-10', 'health', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Análise de TISS', 'analise-tiss', 'Analisa arquivos TISS para reembolso', 'health', TRUE, NULL),

-- Marketing
('00000000-0000-0000-0000-000000000000', 'Scoring de Leads', 'scoring-leads', 'Calcula score de leads baseado em dados', 'marketing', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Geração de Copy', 'geracao-copy', 'Gera copy para campanhas de marketing', 'marketing', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Análise de Sentimento', 'analise-sentimento', 'Analisa sentimento de comentários e reviews', 'marketing', TRUE, NULL),

-- Contábil
('00000000-0000-0000-0000-000000000000', 'Classificação de Despesas', 'classificacao-despesas', 'Classifica despesas por categoria contábil', 'accounting', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Análise de Balanço', 'analise-balanco', 'Analisa balanços e demonstrações contábeis', 'accounting', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Conciliação Bancária', 'conciliacao-bancaria', 'Auxilia na conciliação bancária', 'accounting', TRUE, NULL),

-- Varejo
('00000000-0000-0000-0000-000000000000', 'Análise de Produtos', 'analise-produtos', 'Analisa produtos e sugere melhorias', 'retail', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Previsão de Demanda', 'previsao-demanda', 'Prevê demanda de produtos', 'retail', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Atendimento ao Cliente', 'atendimento-cliente', 'Atende clientes via chat', 'retail', TRUE, NULL),

-- Agro
('00000000-0000-0000-0000-000000000000', 'Análise de Solo', 'analise-solo', 'Analisa dados de solo e sugere cultivos', 'agro', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Monitoramento de Pragas', 'monitoramento-pragas', 'Identifica pragas e sugere tratamentos', 'agro', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Previsão Climática', 'previsao-climatica', 'Analisa dados climáticos para agricultura', 'agro', TRUE, NULL),

-- RH
('00000000-0000-0000-0000-000000000000', 'Análise de CV', 'analise-cv', 'Analisa currículos e extrai informações', 'hr', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Avaliação de Desempenho', 'avaliacao-desempenho', 'Auxilia na avaliação de desempenho', 'hr', TRUE, NULL),
('00000000-0000-0000-0000-000000000000', 'Análise de eSocial', 'analise-esocial', 'Analisa eventos do eSocial', 'hr', TRUE, NULL);

-- Versões dos prompts
INSERT INTO prompt_versions (prompt_id, version, is_active, prompt_text, system_prompt, parameters, model_config, safety_config)
SELECT 
    p.id,
    '1.0.0',
    TRUE,
    CASE p.slug
        WHEN 'analise-prontuario-medico' THEN 'Analise o seguinte prontuário médico e extraia as informações principais: {prontuario}\n\nExtraia:\n- Diagnósticos principais\n- Medicamentos prescritos\n- Exames solicitados\n- Observações importantes\n- Próximos passos recomendados'
        WHEN 'scoring-leads' THEN 'Analise os seguintes dados do lead e calcule um score de 0 a 100:\n\nDados do lead: {lead_data}\n\nConsidere:\n- Qualidade do contato (email, telefone)\n- Interesse demonstrado\n- Perfil demográfico\n- Comportamento online\n- Fonte de origem\n\nRetorne apenas o score numérico e uma breve justificativa.'
        WHEN 'classificacao-despesas' THEN 'Classifique a seguinte despesa de acordo com o plano de contas:\n\nDespesa: {despesa}\nValor: {valor}\nFornecedor: {fornecedor}\n\nClassifique em:\n- Conta contábil\n- Centro de custo\n- Categoria fiscal\n- Justificativa'
        ELSE 'Execute a tarefa solicitada com os dados fornecidos: {input_data}'
    END,
    CASE p.slug
        WHEN 'analise-prontuario-medico' THEN 'Você é um assistente médico especializado em análise de prontuários. Seja preciso, objetivo e mantenha confidencialidade total dos dados.'
        WHEN 'scoring-leads' THEN 'Você é um especialista em marketing digital e análise de leads. Seja objetivo e baseie suas análises em dados concretos.'
        WHEN 'classificacao-despesas' THEN 'Você é um contador especializado em classificação contábil. Siga rigorosamente as normas brasileiras de contabilidade.'
        ELSE 'Você é um assistente especializado em automação de processos empresariais. Seja preciso e objetivo.'
    END,
    CASE p.slug
        WHEN 'analise-prontuario-medico' THEN '{"prontuario": {"type": "string", "required": true, "description": "Texto do prontuário médico"}}'::jsonb
        WHEN 'scoring-leads' THEN '{"lead_data": {"type": "object", "required": true, "description": "Dados do lead"}}'::jsonb
        WHEN 'classificacao-despesas' THEN '{"despesa": {"type": "string", "required": true}, "valor": {"type": "number", "required": true}, "fornecedor": {"type": "string", "required": true}}'::jsonb
        ELSE '{"input_data": {"type": "object", "required": true}}'::jsonb
    END,
    '{"model": "gpt-4", "temperature": 0.1, "max_tokens": 2000}'::jsonb,
    '{"content_filter": true, "pii_detection": true, "bias_detection": true, "toxicity_detection": true}'::jsonb
FROM prompt_library p;

-- Coleções RAG padrão
INSERT INTO rag_collections (workspace_id, name, description, embedding_model, created_by) VALUES
('00000000-0000-0000-0000-000000000000', 'Documentação Técnica', 'Documentação técnica da FluxoLab', 'text-embedding-ada-002', NULL),
('00000000-0000-0000-0000-000000000000', 'Base de Conhecimento LGPD', 'Base de conhecimento sobre LGPD', 'text-embedding-ada-002', NULL),
('00000000-0000-0000-0000-000000000000', 'Normas Contábeis', 'Normas brasileiras de contabilidade', 'text-embedding-ada-002', NULL),
('00000000-0000-0000-0000-000000000000', 'Regulamentações ANS', 'Regulamentações da Agência Nacional de Saúde', 'text-embedding-ada-002', NULL);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_workspace ON prompt_library (workspace_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_category ON prompt_library (category);
CREATE INDEX IF NOT EXISTS idx_prompt_library_public ON prompt_library (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompt_library_active ON prompt_library (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_prompt_library_tags ON prompt_library USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON prompt_versions (prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_active ON prompt_versions (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_ai_runs_workspace ON ai_runs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_run ON ai_runs (run_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_prompt ON ai_runs (prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_status ON ai_runs (status);
CREATE INDEX IF NOT EXISTS idx_ai_runs_created_at ON ai_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_run ON ai_eval_scores (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_type ON ai_eval_scores (eval_type);
CREATE INDEX IF NOT EXISTS idx_ai_eval_scores_score ON ai_eval_scores (score);

CREATE INDEX IF NOT EXISTS idx_ai_redactions_run ON ai_redactions (ai_run_id);
CREATE INDEX IF NOT EXISTS idx_ai_redactions_type ON ai_redactions (redaction_type);

CREATE INDEX IF NOT EXISTS idx_rag_collections_workspace ON rag_collections (workspace_id);
CREATE INDEX IF NOT EXISTS idx_rag_collections_active ON rag_collections (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_rag_documents_collection ON rag_documents (collection_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_processed ON rag_documents (is_processed) WHERE is_processed = TRUE;

CREATE INDEX IF NOT EXISTS idx_rag_chunks_document ON rag_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_index ON rag_chunks (chunk_index);

CREATE INDEX IF NOT EXISTS idx_rag_indices_collection ON rag_indices (collection_id);
CREATE INDEX IF NOT EXISTS idx_rag_indices_built ON rag_indices (is_built) WHERE is_built = TRUE;

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
