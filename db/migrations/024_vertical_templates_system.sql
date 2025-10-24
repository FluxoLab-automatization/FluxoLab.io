-- 024_vertical_templates_system.sql
-- Sistema de templates verticais

BEGIN;

-- Tabela para templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL
        CHECK (category IN ('health', 'retail', 'marketing', 'agro', 'accounting', 'hr', 'general')),
    vertical TEXT NOT NULL
        CHECK (vertical IN ('saude', 'varejo', 'marketing', 'agro', 'contabil', 'rh', 'geral')),
    icon_url TEXT,
    preview_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    difficulty_level TEXT NOT NULL DEFAULT 'beginner'
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    estimated_setup_time INTEGER NOT NULL DEFAULT 30, -- em minutos
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, slug)
);

-- Tabela para versões de templates
CREATE TABLE IF NOT EXISTS template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    changelog TEXT,
    workflow_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    setup_instructions TEXT,
    prerequisites TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, version)
);

-- Tabela para parâmetros de templates
CREATE TABLE IF NOT EXISTS template_params (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    param_name TEXT NOT NULL,
    param_type TEXT NOT NULL
        CHECK (param_type IN ('string', 'number', 'boolean', 'select', 'multiselect', 'file', 'json')),
    param_label TEXT NOT NULL,
    param_description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    options JSONB DEFAULT '[]'::jsonb, -- Para select/multiselect
    validation_rules JSONB DEFAULT '{}'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, param_name)
);

-- Tabela para instalações de templates
CREATE TABLE IF NOT EXISTS template_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    installed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version_installed TEXT NOT NULL,
    config_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'installing'
        CHECK (status IN ('installing', 'installed', 'failed', 'uninstalled')),
    installed_at TIMESTAMPTZ,
    uninstalled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para reviews de templates
CREATE TABLE IF NOT EXISTS template_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, workspace_id, user_id)
);

-- Templates verticais específicos
INSERT INTO templates (workspace_id, name, slug, description, category, vertical, is_public, is_featured, difficulty_level, estimated_setup_time, tags, created_by) VALUES
-- Saúde
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Conciliação Título + Extrato + PIX', 'conciliacao-titulo-extrato-pix', 'Automatiza a conciliação entre títulos médicos, extratos bancários e transações PIX', 'health', 'saude', TRUE, TRUE, 'intermediate', 45, '{"conciliacao", "pix", "saude", "financeiro"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Gestão de Agendamentos Médicos', 'gestao-agendamentos-medicos', 'Automatiza agendamentos, lembretes e confirmações de consultas', 'health', 'saude', TRUE, TRUE, 'beginner', 30, '{"agendamento", "saude", "whatsapp", "lembretes"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Processamento TISS', 'processamento-tiss', 'Processa arquivos TISS para reembolso de procedimentos', 'health', 'saude', TRUE, FALSE, 'advanced', 60, '{"tiss", "saude", "reembolso", "ans"}', NULL),

-- Marketing
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Lead → Score → CRM → WhatsApp', 'lead-score-crm-whatsapp', 'Automatiza o fluxo completo de leads do Meta para CRM via WhatsApp', 'marketing', 'marketing', TRUE, TRUE, 'intermediate', 40, '{"lead", "crm", "whatsapp", "score", "meta"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Campanha de Email Marketing', 'campanha-email-marketing', 'Cria e executa campanhas de email marketing automatizadas', 'marketing', 'marketing', TRUE, FALSE, 'beginner', 25, '{"email", "marketing", "campanha", "automacao"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Gestão de Redes Sociais', 'gestao-redes-sociais', 'Automatiza postagens e interações em redes sociais', 'marketing', 'marketing', TRUE, FALSE, 'intermediate', 35, '{"redes-sociais", "postagem", "automacao", "marketing"}', NULL),

-- Contábil
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Robô NF-e/NFS-e', 'robo-nfe-nfse', 'Automatiza a geração e envio de notas fiscais eletrônicas', 'accounting', 'contabil', TRUE, TRUE, 'advanced', 90, '{"nfe", "nfse", "fiscal", "contabil", "automacao"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Conciliação Bancária Automática', 'conciliacao-bancaria-automatica', 'Automatiza a conciliação bancária com extratos e comprovantes', 'accounting', 'contabil', TRUE, TRUE, 'intermediate', 50, '{"conciliacao", "bancaria", "contabil", "extrato"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Processamento eSocial', 'processamento-esocial', 'Automatiza o envio de eventos do eSocial', 'accounting', 'contabil', TRUE, FALSE, 'expert', 120, '{"esocial", "rh", "contabil", "fiscal"}', NULL),

-- Varejo
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Gestão de Pedidos Multi-canal', 'gestao-pedidos-multicanal', 'Centraliza pedidos do Mercado Livre, Shopee e Magalu', 'retail', 'varejo', TRUE, TRUE, 'intermediate', 60, '{"pedidos", "varejo", "multicanal", "mercado-livre"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Controle de Estoque Inteligente', 'controle-estoque-inteligente', 'Automatiza reposição e alertas de estoque', 'retail', 'varejo', TRUE, FALSE, 'intermediate', 45, '{"estoque", "varejo", "reposicao", "alertas"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Atendimento ao Cliente 24/7', 'atendimento-cliente-24h', 'Chatbot inteligente para atendimento via WhatsApp', 'retail', 'varejo', TRUE, FALSE, 'beginner', 30, '{"atendimento", "chatbot", "whatsapp", "varejo"}', NULL),

-- Agro
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Monitoramento Climático', 'monitoramento-climatico', 'Integra dados climáticos com decisões agrícolas', 'agro', 'agro', TRUE, TRUE, 'intermediate', 40, '{"clima", "agro", "monitoramento", "decisao"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Gestão de Colheita', 'gestao-colheita', 'Automatiza planejamento e controle de colheita', 'agro', 'agro', TRUE, FALSE, 'intermediate', 50, '{"colheita", "agro", "planejamento", "controle"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Controle de Pragas e Doenças', 'controle-pragas-doencas', 'Sistema de alerta para pragas e doenças', 'agro', 'agro', TRUE, FALSE, 'advanced', 70, '{"pragas", "doencas", "agro", "alerta"}', NULL),

-- RH
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Onboarding de Funcionários', 'onboarding-funcionarios', 'Automatiza o processo de integração de novos funcionários', 'hr', 'rh', TRUE, TRUE, 'beginner', 35, '{"onboarding", "rh", "funcionarios", "integracao"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Gestão de Ponto Eletrônico', 'gestao-ponto-eletronico', 'Integra sistemas de ponto com folha de pagamento', 'hr', 'rh', TRUE, FALSE, 'intermediate', 45, '{"ponto", "rh", "folha", "pagamento"}', NULL),
('c0cc00a3-a2c1-4488-8c9c-33d145703019', 'Avaliação de Desempenho', 'avaliacao-desempenho', 'Automatiza processos de avaliação e feedback', 'hr', 'rh', TRUE, FALSE, 'intermediate', 40, '{"avaliacao", "desempenho", "rh", "feedback"}', NULL);

-- Versões dos templates (simplificado)
INSERT INTO template_versions (template_id, version, is_active, workflow_definition)
SELECT 
    t.id,
    '1.0.0',
    TRUE,
    '{"nodes": [], "edges": []}'::jsonb
FROM template_marketplace t;

-- Parâmetros dos templates
INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'erp_connection',
    'select',
    'Conexão ERP',
    'Selecione a conexão com o sistema ERP',
    TRUE,
    NULL,
    1
FROM templates t
WHERE t.slug IN ('conciliacao-titulo-extrato-pix', 'robo-nfe-nfse');

INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'bank_connection',
    'select',
    'Conexão Bancária',
    'Selecione a conexão com o banco',
    TRUE,
    NULL,
    2
FROM templates t
WHERE t.slug = 'conciliacao-titulo-extrato-pix';

INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'pix_connection',
    'select',
    'Conexão PIX',
    'Selecione a conexão PIX',
    TRUE,
    NULL,
    3
FROM templates t
WHERE t.slug = 'conciliacao-titulo-extrato-pix';

INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'crm_connection',
    'select',
    'Conexão CRM',
    'Selecione a conexão com o CRM',
    TRUE,
    NULL,
    1
FROM templates t
WHERE t.slug = 'lead-score-crm-whatsapp';

INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'whatsapp_connection',
    'select',
    'Conexão WhatsApp',
    'Selecione a conexão WhatsApp Business',
    TRUE,
    NULL,
    2
FROM templates t
WHERE t.slug = 'lead-score-crm-whatsapp';

INSERT INTO template_params (template_id, param_name, param_type, param_label, param_description, is_required, default_value, display_order)
SELECT 
    t.id,
    'certificate_password',
    'string',
    'Senha do Certificado',
    'Digite a senha do certificado digital',
    TRUE,
    NULL,
    1
FROM templates t
WHERE t.slug = 'robo-nfe-nfse';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_templates_workspace ON templates (workspace_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates (category);
CREATE INDEX IF NOT EXISTS idx_templates_vertical ON templates (vertical);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_featured ON templates (is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_difficulty ON templates (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions (template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_active ON template_versions (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_template_params_template ON template_params (template_id);
CREATE INDEX IF NOT EXISTS idx_template_params_required ON template_params (is_required) WHERE is_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_params_order ON template_params (display_order);

CREATE INDEX IF NOT EXISTS idx_template_installs_template ON template_installs (template_id);
-- CREATE INDEX IF NOT EXISTS idx_template_installs_workspace ON template_installs (workspace_id); -- Removido: coluna pode não existir
-- CREATE INDEX IF NOT EXISTS idx_template_installs_status ON template_installs (status); -- Removido: coluna não existe
CREATE INDEX IF NOT EXISTS idx_template_installs_installed_at ON template_installs (installed_at);

CREATE INDEX IF NOT EXISTS idx_template_reviews_template ON template_reviews (template_id);
-- CREATE INDEX IF NOT EXISTS idx_template_reviews_workspace ON template_reviews (workspace_id); -- Removido: coluna pode não existir
CREATE INDEX IF NOT EXISTS idx_template_reviews_user ON template_reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_template_reviews_rating ON template_reviews (rating);
-- CREATE INDEX IF NOT EXISTS idx_template_reviews_verified ON template_reviews (is_verified) WHERE is_verified = TRUE; -- Removido: coluna não existe

COMMIT;
