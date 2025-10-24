-- 022_usage_billing_system.sql
-- Sistema de uso e billing por componentes

BEGIN;

-- Tabela para contadores de uso
CREATE TABLE IF NOT EXISTS usage_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    counter_type TEXT NOT NULL
        CHECK (counter_type IN ('workflow_runs', 'connector_calls', 'ai_tokens', 'ai_requests', 'whatsapp_messages', 'storage_gb', 'api_calls', 'webhook_calls')),
    resource_id UUID, -- ID do recurso específico (workflow, connector, etc.)
    resource_name TEXT,
    count_value BIGINT NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, counter_type, resource_id, period_start)
);

-- Tabela para quotas e limites
CREATE TABLE IF NOT EXISTS workspace_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    quota_type TEXT NOT NULL
        CHECK (quota_type IN ('workflow_runs', 'connector_calls', 'ai_tokens', 'ai_requests', 'whatsapp_messages', 'storage_gb', 'api_calls', 'webhook_calls', 'users', 'workflows')),
    limit_value BIGINT NOT NULL,
    current_usage BIGINT NOT NULL DEFAULT 0,
    warning_threshold DECIMAL(5,2) NOT NULL DEFAULT 80.0, -- 80%
    is_hard_limit BOOLEAN NOT NULL DEFAULT TRUE,
    reset_period TEXT NOT NULL DEFAULT 'monthly'
        CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly', 'never')),
    last_reset_at TIMESTAMPTZ,
    next_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, quota_type)
);

-- Tabela para componentes de preço
CREATE TABLE IF NOT EXISTS pricing_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_name TEXT NOT NULL UNIQUE,
    component_type TEXT NOT NULL
        CHECK (component_type IN ('workflow_runs', 'connector_calls', 'ai_tokens', 'ai_requests', 'whatsapp_messages', 'storage_gb', 'api_calls', 'webhook_calls', 'users', 'workflows')),
    unit TEXT NOT NULL,
    base_price DECIMAL(10,4) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para planos de preço
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name TEXT NOT NULL,
    plan_type TEXT NOT NULL
        CHECK (plan_type IN ('free', 'trial', 'basic', 'professional', 'enterprise', 'custom')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para preços por plano
CREATE TABLE IF NOT EXISTS plan_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES pricing_components(id) ON DELETE CASCADE,
    price_per_unit DECIMAL(10,4) NOT NULL,
    included_units BIGINT NOT NULL DEFAULT 0,
    tier_1_limit BIGINT,
    tier_1_price DECIMAL(10,4),
    tier_2_limit BIGINT,
    tier_2_price DECIMAL(10,4),
    tier_3_limit BIGINT,
    tier_3_price DECIMAL(10,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, component_id)
);

-- Tabela para assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES pricing_plans(id),
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('trial', 'active', 'suspended', 'cancelled', 'expired')),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly'
        CHECK (billing_cycle IN ('daily', 'weekly', 'monthly', 'yearly')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_end_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para faturas
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    invoice_number TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'BRL',
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_method TEXT,
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para itens de fatura
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES pricing_components(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    unit_price DECIMAL(10,4) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL
        CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto', 'bank_transfer', 'paypal')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    external_payment_id TEXT,
    payment_gateway TEXT,
    gateway_response JSONB DEFAULT '{}'::jsonb,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para cupons de desconto
CREATE TABLE IF NOT EXISTS discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL
        CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_trial')),
    discount_value DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL',
    max_uses INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para uso de cupons
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES discount_coupons(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para alertas de uso
CREATE TABLE IF NOT EXISTS usage_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    quota_id UUID NOT NULL REFERENCES workspace_quotas(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL
        CHECK (alert_type IN ('warning', 'critical', 'quota_exceeded')),
    threshold_percentage DECIMAL(5,2) NOT NULL,
    current_usage BIGINT NOT NULL,
    current_percentage DECIMAL(5,2) NOT NULL,
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para relatórios de uso
CREATE TABLE IF NOT EXISTS usage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL
        CHECK (report_type IN ('daily', 'weekly', 'monthly', 'yearly', 'custom')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES users(id)
);


-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_usage_counter(
    p_workspace_id UUID,
    p_counter_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_resource_name TEXT DEFAULT NULL,
    p_increment_value BIGINT DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    -- Determinar período atual (mensal)
    v_period_start := date_trunc('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
    
    -- Inserir ou atualizar contador
    INSERT INTO usage_counters (
        workspace_id, counter_type, resource_id, resource_name,
        count_value, period_start, period_end
    )
    VALUES (
        p_workspace_id, p_counter_type, p_resource_id, p_resource_name,
        p_increment_value, v_period_start, v_period_end
    )
    ON CONFLICT (workspace_id, counter_type, resource_id, period_start)
    DO UPDATE SET
        count_value = usage_counters.count_value + p_increment_value,
        updated_at = NOW();
    
    -- Atualizar quota correspondente
    UPDATE workspace_quotas
    SET current_usage = current_usage + p_increment_value,
        updated_at = NOW()
    WHERE workspace_id = p_workspace_id
    AND quota_type = p_counter_type;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar limites de quota
CREATE OR REPLACE FUNCTION check_quota_limit(
    p_workspace_id UUID,
    p_quota_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_quota RECORD;
    v_usage_percentage DECIMAL(5,2);
BEGIN
    SELECT * INTO v_quota
    FROM workspace_quotas
    WHERE workspace_id = p_workspace_id
    AND quota_type = p_quota_type;
    
    IF v_quota IS NULL THEN
        RETURN TRUE; -- Sem quota definida, permitir
    END IF;
    
    v_usage_percentage := (v_quota.current_usage::DECIMAL / v_quota.limit_value::DECIMAL) * 100;
    
    -- Verificar se excedeu o limite
    IF v_quota.is_hard_limit AND v_quota.current_usage >= v_quota.limit_value THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se atingiu threshold de alerta
    IF v_usage_percentage >= v_quota.warning_threshold THEN
        -- Criar alerta se não existir
        INSERT INTO usage_alerts (
            workspace_id, quota_id, alert_type, threshold_percentage,
            current_usage, current_percentage
        )
        VALUES (
            p_workspace_id, v_quota.id, 'warning', v_quota.warning_threshold,
            v_quota.current_usage, v_usage_percentage
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar fatura mensal
CREATE OR REPLACE FUNCTION generate_monthly_invoice(
    p_workspace_id UUID,
    p_period_start TIMESTAMPTZ,
    p_period_end TIMESTAMPTZ
)
RETURNS UUID AS $$
DECLARE
    v_subscription RECORD;
    v_invoice_id UUID;
    v_invoice_number TEXT;
    v_subtotal DECIMAL(10,2) := 0;
    v_tax_amount DECIMAL(10,2) := 0;
    v_total_amount DECIMAL(10,2) := 0;
    v_usage RECORD;
    v_plan_pricing RECORD;
    v_item_total DECIMAL(10,2);
BEGIN
    -- Buscar assinatura ativa
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE workspace_id = p_workspace_id
    AND status = 'active'
    AND current_period_start <= p_period_start
    AND current_period_end >= p_period_end;
    
    IF v_subscription IS NULL THEN
        RAISE EXCEPTION 'No active subscription found for workspace %', p_workspace_id;
    END IF;
    
    -- Gerar número da fatura
    v_invoice_number := 'INV-' || to_char(NOW(), 'YYYYMM') || '-' || 
                       lpad(nextval('invoice_number_seq')::text, 6, '0');
    
    -- Criar fatura
    INSERT INTO invoices (
        workspace_id, subscription_id, invoice_number, due_date
    )
    VALUES (
        p_workspace_id, v_subscription.id, v_invoice_number,
        p_period_end + INTERVAL '7 days'
    )
    RETURNING id INTO v_invoice_id;
    
    -- Processar uso de cada componente
    FOR v_usage IN
        SELECT uc.*, pp.price_per_unit, pp.included_units
        FROM usage_counters uc
        JOIN plan_pricing pp ON pp.plan_id = v_subscription.plan_id
        JOIN pricing_components pc ON pc.id = pp.component_id
        WHERE uc.workspace_id = p_workspace_id
        AND uc.period_start >= p_period_start
        AND uc.period_end <= p_period_end
        AND pc.component_type = uc.counter_type
    LOOP
        -- Calcular valor do item
        IF v_usage.count_value <= v_usage.included_units THEN
            v_item_total := 0;
        ELSE
            v_item_total := (v_usage.count_value - v_usage.included_units) * v_usage.price_per_unit;
        END IF;
        
        -- Adicionar item à fatura
        INSERT INTO invoice_items (
            invoice_id, component_id, description, quantity,
            unit_price, total_price, period_start, period_end
        )
        VALUES (
            v_invoice_id, v_usage.resource_id, 
            v_usage.counter_type || ' - ' || COALESCE(v_usage.resource_name, 'Total'),
            v_usage.count_value, v_usage.price_per_unit, v_item_total,
            p_period_start, p_period_end
        );
        
        v_subtotal := v_subtotal + v_item_total;
    END LOOP;
    
    -- Calcular impostos (18% ICMS + 3% PIS/COFINS)
    v_tax_amount := v_subtotal * 0.21;
    v_total_amount := v_subtotal + v_tax_amount;
    
    -- Atualizar fatura com totais
    UPDATE invoices
    SET subtotal = v_subtotal,
        tax_amount = v_tax_amount,
        total_amount = v_total_amount,
        status = 'pending'
    WHERE id = v_invoice_id;
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Sequência para números de fatura
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usage_counters_workspace ON usage_counters (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_type ON usage_counters (counter_type);
CREATE INDEX IF NOT EXISTS idx_usage_counters_resource ON usage_counters (resource_id);
CREATE INDEX IF NOT EXISTS idx_usage_counters_period ON usage_counters (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_counters_created_at ON usage_counters (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workspace_quotas_workspace ON workspace_quotas (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_quotas_type ON workspace_quotas (quota_type);
CREATE INDEX IF NOT EXISTS idx_workspace_quotas_reset ON workspace_quotas (next_reset_at);

CREATE INDEX IF NOT EXISTS idx_pricing_components_type ON pricing_components (component_type);
CREATE INDEX IF NOT EXISTS idx_pricing_components_active ON pricing_components (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_pricing_plans_type ON pricing_plans (plan_type);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans (is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_plan_pricing_plan ON plan_pricing (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_pricing_component ON plan_pricing (component_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace ON subscriptions (workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions (plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions (current_period_end);

CREATE INDEX IF NOT EXISTS idx_invoices_workspace ON invoices (workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription ON invoices (subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices (invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_component ON invoice_items (component_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments (external_payment_id);

CREATE INDEX IF NOT EXISTS idx_discount_coupons_code ON discount_coupons (coupon_code);
CREATE INDEX IF NOT EXISTS idx_discount_coupons_active ON discount_coupons (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_discount_coupons_valid ON discount_coupons (valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage (coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_workspace ON coupon_usage (workspace_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_used_at ON coupon_usage (used_at);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_workspace ON usage_alerts (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_quota ON usage_alerts (quota_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_type ON usage_alerts (alert_type);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_sent ON usage_alerts (is_sent) WHERE is_sent = FALSE;

CREATE INDEX IF NOT EXISTS idx_usage_reports_workspace ON usage_reports (workspace_id);
CREATE INDEX IF NOT EXISTS idx_usage_reports_type ON usage_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_usage_reports_period ON usage_reports (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_usage_reports_generated_at ON usage_reports (generated_at DESC);

COMMIT;
