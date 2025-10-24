-- 015_project_sharing.sql
-- Sistema de compartilhamento de projetos e workflows

BEGIN;

-- Tabela para projetos compartilhados
CREATE TABLE IF NOT EXISTS shared_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    share_token TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{"view": true, "edit": false, "fork": true}'::jsonb,
    access_type TEXT NOT NULL DEFAULT 'public'
        CHECK (access_type IN ('public', 'private', 'restricted')),
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    max_views INTEGER,
    view_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para permissões específicas de usuários
CREATE TABLE IF NOT EXISTS shared_project_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email TEXT,
    permissions JSONB NOT NULL DEFAULT '{"view": true, "edit": false, "fork": true}'::jsonb,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE (shared_project_id, COALESCE(user_id::text, email))
);

-- Tabela para logs de acesso
CREATE TABLE IF NOT EXISTS shared_project_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    action TEXT NOT NULL
        CHECK (action IN ('view', 'edit', 'fork', 'download', 'access_denied')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para projetos forked (copiados)
CREATE TABLE IF NOT EXISTS forked_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    new_workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    forked_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    forked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para comentários em projetos compartilhados
CREATE TABLE IF NOT EXISTS shared_project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    parent_comment_id UUID REFERENCES shared_project_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para likes/favoritos
CREATE TABLE IF NOT EXISTS shared_project_likes (
    shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (shared_project_id, user_id)
);

-- Tabela para tags de projetos compartilhados
CREATE TABLE IF NOT EXISTS shared_project_tags (
    shared_project_id UUID NOT NULL REFERENCES shared_projects(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (shared_project_id, tag_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_shared_projects_workspace ON shared_projects (workspace_id);
CREATE INDEX IF NOT EXISTS idx_shared_projects_workflow ON shared_projects (workflow_id);
CREATE INDEX IF NOT EXISTS idx_shared_projects_token ON shared_projects (share_token);
CREATE INDEX IF NOT EXISTS idx_shared_projects_created_by ON shared_projects (created_by);
CREATE INDEX IF NOT EXISTS idx_shared_projects_active ON shared_projects (is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_shared_projects_expires ON shared_projects (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shared_project_permissions_project ON shared_project_permissions (shared_project_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_permissions_user ON shared_project_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_permissions_email ON shared_project_permissions (email);
CREATE INDEX IF NOT EXISTS idx_shared_project_access_logs_project ON shared_project_access_logs (shared_project_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_access_logs_user ON shared_project_access_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_access_logs_created_at ON shared_project_access_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forked_projects_original ON forked_projects (original_shared_project_id);
CREATE INDEX IF NOT EXISTS idx_forked_projects_workflow ON forked_projects (new_workflow_id);
CREATE INDEX IF NOT EXISTS idx_forked_projects_user ON forked_projects (forked_by);
CREATE INDEX IF NOT EXISTS idx_shared_project_comments_project ON shared_project_comments (shared_project_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_comments_user ON shared_project_comments (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_comments_parent ON shared_project_comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_likes_project ON shared_project_likes (shared_project_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_likes_user ON shared_project_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_tags_project ON shared_project_tags (shared_project_id);
CREATE INDEX IF NOT EXISTS idx_shared_project_tags_tag ON shared_project_tags (tag_id);

COMMIT;

