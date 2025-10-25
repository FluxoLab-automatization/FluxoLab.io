-- Migração 045: Adicionar colunas camelCase faltantes
-- Data: 2025-10-25
-- Problema: Algumas entidades têm colunas snake_case mas faltam algumas camelCase
-- Solução: Adiciona colunas camelCase faltantes

BEGIN;

-- ============================================================================
-- TABELA: connector_versions
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connector_versions') THEN
        -- changelog (já existe mas não está mapeada corretamente)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_versions' AND column_name = 'changelog'
        ) THEN
            ALTER TABLE connector_versions ADD COLUMN changelog text;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: connections
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
        -- description
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'description'
        ) THEN
            ALTER TABLE connections ADD COLUMN description text;
        END IF;
        
        -- createdBy
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'createdBy'
        ) THEN
            ALTER TABLE connections ADD COLUMN "createdBy" uuid;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: oauth_tokens
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oauth_tokens') THEN
        -- tokenType (mapear de token_type)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oauth_tokens' AND column_name = 'tokenType'
        ) THEN
            ALTER TABLE oauth_tokens ADD COLUMN "tokenType" character varying(50);
            UPDATE oauth_tokens SET "tokenType" = token_type WHERE token_type IS NOT NULL;
            ALTER TABLE oauth_tokens ALTER COLUMN "tokenType" SET NOT NULL;
        END IF;
        
        -- accessToken (mapear de access_token)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oauth_tokens' AND column_name = 'accessToken'
        ) THEN
            ALTER TABLE oauth_tokens ADD COLUMN "accessToken" text;
            UPDATE oauth_tokens SET "accessToken" = access_token WHERE access_token IS NOT NULL;
            ALTER TABLE oauth_tokens ALTER COLUMN "accessToken" SET NOT NULL;
        END IF;
        
        -- refreshToken (mapear de refresh_token)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oauth_tokens' AND column_name = 'refreshToken'
        ) THEN
            ALTER TABLE oauth_tokens ADD COLUMN "refreshToken" text;
            UPDATE oauth_tokens SET "refreshToken" = refresh_token WHERE refresh_token IS NOT NULL;
        END IF;
        
        -- expiresAt (mapear de expires_at)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oauth_tokens' AND column_name = 'expiresAt'
        ) THEN
            ALTER TABLE oauth_tokens ADD COLUMN "expiresAt" timestamp with time zone;
            UPDATE oauth_tokens SET "expiresAt" = expires_at WHERE expires_at IS NOT NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: connection_secrets
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connection_secrets') THEN
        -- secretValue (mapear de encrypted_value mas não converter)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connection_secrets' AND column_name = 'secretValue'
        ) THEN
            ALTER TABLE connection_secrets ADD COLUMN "secretValue" bytea;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: alerts
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        -- conditions (mapear de condition_config)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'conditions'
        ) THEN
            ALTER TABLE alerts ADD COLUMN conditions jsonb NOT NULL DEFAULT '{}';
            UPDATE alerts SET conditions = condition_config WHERE condition_config IS NOT NULL;
        END IF;
        
        -- severity
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'severity'
        ) THEN
            ALTER TABLE alerts ADD COLUMN severity character varying(20) NOT NULL DEFAULT 'info';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: execution_metrics
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'execution_metrics') THEN
        -- metricValue (mapear de metric_value)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'metricValue'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "metricValue" numeric;
            UPDATE execution_metrics SET "metricValue" = metric_value WHERE metric_value IS NOT NULL;
            ALTER TABLE execution_metrics ALTER COLUMN "metricValue" SET NOT NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: templates
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        -- rating
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'rating'
        ) THEN
            ALTER TABLE templates ADD COLUMN rating numeric DEFAULT 0;
        END IF;
        
        -- metadata (adicionar se não existe)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'metadata'
        ) THEN
            ALTER TABLE templates ADD COLUMN metadata jsonb DEFAULT '{}';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: template_versions
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_versions') THEN
        -- changelog
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'changelog'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN changelog text;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TABELA: template_params
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_params') THEN
        -- templateId (mapear de template_id)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'templateId'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "templateId" uuid;
            UPDATE template_params SET "templateId" = template_id WHERE template_id IS NOT NULL;
        END IF;
        
        -- name (mapear de param_name)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'name'
        ) THEN
            ALTER TABLE template_params ADD COLUMN name character varying(100);
            UPDATE template_params SET name = param_name WHERE param_name IS NOT NULL;
            ALTER TABLE template_params ALTER COLUMN name SET NOT NULL;
        END IF;
        
        -- type (mapear de param_type)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'type'
        ) THEN
            ALTER TABLE template_params ADD COLUMN type character varying(50);
            UPDATE template_params SET type = param_type WHERE param_type IS NOT NULL;
            ALTER TABLE template_params ALTER COLUMN type SET NOT NULL;
        END IF;
        
        -- description (mapear de param_description)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'description'
        ) THEN
            ALTER TABLE template_params ADD COLUMN description text;
            UPDATE template_params SET description = param_description WHERE param_description IS NOT NULL;
        END IF;
        
        -- validation (mapear de validation_rules)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'validation'
        ) THEN
            ALTER TABLE template_params ADD COLUMN validation jsonb;
            UPDATE template_params SET validation = validation_rules WHERE validation_rules IS NOT NULL;
        END IF;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_updated_tables INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_updated_tables
    FROM (
        SELECT 1 FROM connector_versions WHERE changelog IS NOT NULL UNION ALL
        SELECT 1 FROM connections WHERE description IS NOT NULL UNION ALL
        SELECT 1 FROM oauth_tokens WHERE "tokenType" IS NOT NULL UNION ALL
        SELECT 1 FROM connection_secrets WHERE "secretValue" IS NOT NULL UNION ALL
        SELECT 1 FROM alerts WHERE conditions IS NOT NULL UNION ALL
        SELECT 1 FROM execution_metrics WHERE "metricValue" IS NOT NULL UNION ALL
        SELECT 1 FROM templates WHERE rating IS NOT NULL UNION ALL
        SELECT 1 FROM template_versions WHERE changelog IS NOT NULL UNION ALL
        SELECT 1 FROM template_params WHERE name IS NOT NULL
    ) t;
    
    RAISE NOTICE 'Migração 045 concluída. Tabelas atualizadas: %', v_updated_tables;
END $$;
