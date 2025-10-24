-- 027_password_reset_system.sql
-- Sistema de reset de senha com segurança

BEGIN;

-- Adicionar CPF à tabela de usuários (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(14);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Criar índice para CPF
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users (cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone) WHERE phone IS NOT NULL;

-- Tabela para pedidos de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL, -- hash do código de 6 dígitos
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para rate limiting de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- email ou IP
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
    request_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (identifier, identifier_type, window_start)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user ON password_reset_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_expires ON password_reset_requests (expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_consumed ON password_reset_requests (consumed_at) WHERE consumed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_created_at ON password_reset_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_identifier ON password_reset_rate_limits (identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_password_reset_rate_limits_window ON password_reset_rate_limits (window_start);

-- Função para limpar pedidos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_requests 
    WHERE expires_at < NOW() 
    AND consumed_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para limpar rate limits antigos
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_rate_limits 
    WHERE window_start < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION check_password_reset_rate_limit(
    p_identifier TEXT,
    p_identifier_type TEXT,
    p_max_requests INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Definir janela de 1 hora
    v_window_start := date_trunc('hour', NOW());
    
    -- Buscar contagem atual
    SELECT COALESCE(request_count, 0)
    INTO v_current_count
    FROM password_reset_rate_limits
    WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND window_start = v_window_start;
    
    -- Se não existe registro, criar um
    IF v_current_count IS NULL THEN
        INSERT INTO password_reset_rate_limits (identifier, identifier_type, request_count, window_start)
        VALUES (p_identifier, p_identifier_type, 1, v_window_start)
        ON CONFLICT (identifier, identifier_type, window_start) DO UPDATE
        SET request_count = password_reset_rate_limits.request_count + 1;
        
        RETURN TRUE;
    END IF;
    
    -- Verificar se excedeu o limite
    IF v_current_count >= p_max_requests THEN
        RETURN FALSE;
    END IF;
    
    -- Incrementar contador
    UPDATE password_reset_rate_limits
    SET request_count = request_count + 1
    WHERE identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND window_start = v_window_start;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para invalidar pedidos anteriores do usuário
CREATE OR REPLACE FUNCTION invalidate_user_password_resets(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE password_reset_requests
    SET consumed_at = NOW()
    WHERE user_id = p_user_id
    AND consumed_at IS NULL;
END;
$$ LANGUAGE plpgsql;

COMMIT;
