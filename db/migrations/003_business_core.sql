CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    price_amount NUMERIC(10, 2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'BRL',
    billing_interval TEXT NOT NULL DEFAULT 'month'
        CHECK (billing_interval IN ('month', 'year')),
    trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_active ON plans (is_active) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS plan_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    feature_value JSONB NOT NULL DEFAULT 'true'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (plan_id, feature_key)
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    scope TEXT NOT NULL DEFAULT 'workspace'
        CHECK (scope IN ('workspace', 'global')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    code TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_permissions (
    profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    permission_code TEXT NOT NULL REFERENCES permissions (code) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profile_id, permission_code)
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    scope TEXT NOT NULL DEFAULT 'global'
        CHECK (scope IN ('global', 'workspace')),
    assigned_by UUID REFERENCES users (id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, profile_id, scope)
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users (id) ON DELETE SET NULL,
    plan_id UUID REFERENCES plans (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug CITEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'archived')),
    timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    region TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles (id) ON DELETE RESTRICT,
    invited_by UUID REFERENCES users (id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
    ON workspace_members (workspace_id)
    WHERE status IN ('active', 'invited');

CREATE TABLE IF NOT EXISTS workspace_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans (id) ON DELETE RESTRICT,
    status TEXT NOT NULL
        CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired', 'scheduled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_starts_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    renews_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    external_reference TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_workspace_active_subscription
    ON workspace_subscriptions (workspace_id)
    WHERE status IN ('trialing', 'active', 'scheduled');

CREATE TABLE IF NOT EXISTS workspace_settings (
    workspace_id UUID PRIMARY KEY REFERENCES workspaces (id) ON DELETE CASCADE,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    branding JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO plans (code, name, description, price_amount, currency, billing_interval, trial_days, is_active, metadata)
VALUES
    ('free', 'Plano Free', 'Acesso limitado com 30 dias de gratuidade e 1 workspace.', 0.00, 'BRL', 'month', 30, TRUE,
     jsonb_build_object('max_workspaces', 1, 'max_users', 3, 'webhook_limit', 2000)),
    ('basico', 'Plano Basico', 'Plano basico com suporte essencial e automatizacoes principais.', 39.99, 'BRL', 'month', 0, TRUE,
     jsonb_build_object('max_workspaces', 2, 'max_users', 10, 'webhook_limit', 10000)),
    ('intermediario', 'Plano Intermediario', 'Cobertura expandida para times em crescimento.', 99.99, 'BRL', 'month', 0, TRUE,
     jsonb_build_object('max_workspaces', 4, 'max_users', 25, 'webhook_limit', 50000)),
    ('full', 'Plano Full', 'Todos os recursos, SLA dedicado e integracoes avancadas.', 349.99, 'BRL', 'month', 0, TRUE,
     jsonb_build_object('max_workspaces', NULL, 'max_users', NULL, 'webhook_limit', NULL, 'sla', '99.9%'))
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_amount = EXCLUDED.price_amount,
    currency = EXCLUDED.currency,
    billing_interval = EXCLUDED.billing_interval,
    trial_days = EXCLUDED.trial_days,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

WITH plan_map AS (
    SELECT id, code
    FROM plans
    WHERE code IN ('free', 'basico', 'intermediario', 'full')
)
INSERT INTO plan_features (plan_id, feature_key, feature_value)
SELECT plan_map.id,
       feature.feature_key,
       feature.feature_value
FROM plan_map
JOIN (
    VALUES
        ('free', 'support', to_jsonb('\'::text)),
        ('free', 'analytics', to_jsonb('\'::text)),
        ('basico', 'support', to_jsonb('\'::text)),
        ('basico', 'integrations', to_jsonb('\'::text)),
        ('intermediario', 'support', to_jsonb('\'::text)),
        ('intermediario', 'integrations', to_jsonb('\'::text)),
        ('intermediario', 'automation_runs', to_jsonb(100000)),
        ('full', 'support', to_jsonb('\'::text)),
        ('full', 'integrations', to_jsonb('\'::text)),
        ('full', 'automation_runs', to_jsonb('\'::text))
) AS feature(plan_code, feature_key, feature_value)
    ON plan_map.code = feature.plan_code
ON CONFLICT (plan_id, feature_key) DO UPDATE
SET feature_value = EXCLUDED.feature_value;

INSERT INTO permissions (code, description)
VALUES
    ('workspaces:manage', 'Gerenciar workspaces, criar e arquivar.'),
    ('workspaces:view', 'Visualizar dados de workspaces.'),
    ('users:invite', 'Convidar e aprovar usuarios.'),
    ('users:manage', 'Gerenciar perfis e acesso de usuarios.'),
    ('billing:manage', 'Atualizar plano e detalhes de faturamento.'),
    ('integrations:manage', 'Configurar integracoes e conectores.'),
    ('integrations:view', 'Visualizar conectores cadastrados.'),
    ('analytics:view', 'Acessar dashboards e metricas.'),
    ('config:update', 'Atualizar configuracoes gerais da plataforma.'),
    ('webhooks:manage', 'Gerenciar webhooks e assinaturas.'),
    ('audit:view', 'Consultar trilhas de auditoria e logs.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO profiles (code, name, description, scope)
VALUES
    ('ceo', 'CEO', 'Acesso total a todos os workspaces, planos e auditoria.', 'global'),
    ('admin', 'Administrador', 'Gerencia workspaces, billing e usuarios.', 'workspace'),
    ('editor', 'Editor', 'Cria e publica workflows e integracoes aprovadas.', 'workspace'),
    ('observador', 'Observador', 'Visualiza dashboards e execucoes sem editar.', 'workspace')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    scope = EXCLUDED.scope,
    updated_at = NOW();

DO $$
DECLARE
    ceo_id UUID;
    admin_id UUID;
    editor_id UUID;
    observador_id UUID;
BEGIN
    SELECT id INTO ceo_id FROM profiles WHERE code = 'ceo';
    SELECT id INTO admin_id FROM profiles WHERE code = 'admin';
    SELECT id INTO editor_id FROM profiles WHERE code = 'editor';
    SELECT id INTO observador_id FROM profiles WHERE code = 'observador';

    IF ceo_id IS NOT NULL THEN
        INSERT INTO profile_permissions (profile_id, permission_code)
        SELECT ceo_id, code FROM permissions
        ON CONFLICT DO NOTHING;
    END IF;

    IF admin_id IS NOT NULL THEN
        INSERT INTO profile_permissions (profile_id, permission_code)
        SELECT admin_id, code
        FROM permissions
        WHERE code IN (
            'workspaces:manage',
            'workspaces:view',
            'users:invite',
            'users:manage',
            'billing:manage',
            'integrations:manage',
            'integrations:view',
            'analytics:view',
            'config:update',
            'webhooks:manage'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF editor_id IS NOT NULL THEN
        INSERT INTO profile_permissions (profile_id, permission_code)
        SELECT editor_id, code
        FROM permissions
        WHERE code IN (
            'workspaces:view',
            'integrations:manage',
            'integrations:view',
            'analytics:view',
            'webhooks:manage'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    IF observador_id IS NOT NULL THEN
        INSERT INTO profile_permissions (profile_id, permission_code)
        SELECT observador_id, code
        FROM permissions
        WHERE code IN (
            'workspaces:view',
            'integrations:view',
            'analytics:view',
            'audit:view'
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

INSERT INTO user_profiles (user_id, profile_id, scope, assigned_by)
SELECT u.id,
       p.id AS profile_id,
       'global' AS scope,
       NULL::uuid
FROM users u
JOIN profiles p ON p.code = 'ceo'
WHERE (
        lower(u.email) = 'kelven@fluxolab.com'
        OR lower(u.display_name) = 'kelven silva'
    )
ON CONFLICT (user_id, profile_id, scope) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fluxolab_devmode') THEN
        CREATE ROLE fluxolab_devmode NOINHERIT;
    END IF;

    PERFORM 1 FROM pg_roles WHERE rolname = 'fluxolab_devmode' AND rolcanlogin;
    IF NOT FOUND THEN
        ALTER ROLE fluxolab_devmode WITH LOGIN;
    END IF;

    ALTER ROLE fluxolab_devmode WITH NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO fluxolab_devmode', current_database());
    EXECUTE 'GRANT USAGE ON SCHEMA public TO fluxolab_devmode';
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO fluxolab_devmode';
    EXECUTE 'GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO fluxolab_devmode';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO fluxolab_devmode';
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO fluxolab_devmode';
END $$;
