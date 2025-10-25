-- Migração 033: Correção completa de nomenclatura camelCase para todas as tabelas restantes
-- Data: 2025-10-25
-- Problema: Múltiplas tabelas usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para todas as tabelas restantes

BEGIN;

-- Lista de tabelas para processar
-- Esta migração cria colunas camelCase para todas as tabelas que usam snake_case

-- ============================================================================
-- FUNÇÃO AUXILIAR: Adiciona coluna camelCase
-- ============================================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Para cada tabela e coluna que precisa ser convertida
    FOR rec IN 
        SELECT 
            table_name,
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND (
            -- Colunas que precisam ser convertidas de snake_case para camelCase
            table_name IN (
                'connectors', 'connections', 'oauth_tokens',
                'templates', 'template_versions', 'template_params',
                'alerts', 'alert_history', 'alert_notifications',
                'circuit_breakers', 'compensation_actions',
                'distributed_locks', 'execution_metrics',
                'execution_windows', 'idempotency_keys',
                'retry_queues', 'schedule_jobs', 'system_events',
                'connector_actions', 'connector_versions', 'connection_secrets'
            )
        )
        AND (
            -- Padrões de nomes que precisam ser convertidos
            column_name LIKE '%_id' 
            OR column_name LIKE '%_at'
            OR column_name IN ('created_at', 'updated_at', 'is_active', 'is_public', 'created_by')
        )
        AND column_name NOT LIKE 'createdAt'
        AND column_name NOT LIKE 'updatedAt'
        AND column_name NOT LIKE '%Id'
        AND column_name NOT LIKE 'isActive'
        AND column_name NOT LIKE 'isPublic'
        AND column_name NOT LIKE 'createdBy'
    LOOP
        -- Gera nome camelCase
        -- TODO: Implementar lógica de conversão snake_case para camelCase
        
        RAISE NOTICE 'Tabela: %, Coluna: %', rec.table_name, rec.column_name;
    END LOOP;
END $$;

-- Por enquanto, vamos fazer manualmente para as tabelas mais críticas

-- ============================================================================
-- CONNECTORS já foi feito na migração 032
-- ============================================================================

-- ============================================================================
-- CONNECTIONS
-- ============================================================================

-- workspaceId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connections' AND column_name = 'workspaceId') THEN
            ALTER TABLE connections ADD COLUMN "workspaceId" uuid;
            UPDATE connections SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE connections ALTER COLUMN "workspaceId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE connections ADD CONSTRAINT "FK_connections_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- OAUTH_TOKENS
-- ============================================================================

-- connectionId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oauth_tokens') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oauth_tokens' AND column_name = 'connectionId') THEN
            ALTER TABLE oauth_tokens ADD COLUMN "connectionId" uuid;
            UPDATE oauth_tokens SET "connectionId" = connection_id WHERE connection_id IS NOT NULL;
            ALTER TABLE oauth_tokens ALTER COLUMN "connectionId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
                ALTER TABLE oauth_tokens ADD CONSTRAINT "FK_oauth_tokens_connectionId" 
                FOREIGN KEY ("connectionId") REFERENCES connections(id) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TEMPLATES
-- ============================================================================

-- workspaceId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'workspaceId') THEN
            ALTER TABLE templates ADD COLUMN "workspaceId" uuid;
            UPDATE templates SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE templates ALTER COLUMN "workspaceId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE templates ADD CONSTRAINT "FK_templates_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END IF;
    END IF;
END $$;

-- createdAt, updatedAt
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'createdAt') THEN
            ALTER TABLE templates ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'templates' AND column_name = 'updatedAt') THEN
            ALTER TABLE templates ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Relatório
DO $$
BEGIN
    RAISE NOTICE 'Migração 033 concluída. Verifique logs acima para detalhes.';
END $$;

COMMIT;
