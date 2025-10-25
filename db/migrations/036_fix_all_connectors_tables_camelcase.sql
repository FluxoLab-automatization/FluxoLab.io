-- Migração 036: Correção completa de nomenclatura camelCase para todas as tabelas de connectors
-- Data: 2025-10-25
-- Problema: Múltiplas tabelas de connectors usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para connector_actions, connections, oauth_tokens, connection_secrets

BEGIN;

-- ============================================================================
-- TABELA: connector_actions
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connector_actions') THEN
        ALTER TABLE connector_actions DISABLE TRIGGER ALL;
        
        -- connectorId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'connectorId'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "connectorId" uuid;
            UPDATE connector_actions SET "connectorId" = connector_id WHERE connector_id IS NOT NULL;
            ALTER TABLE connector_actions ALTER COLUMN "connectorId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connectors') THEN
                ALTER TABLE connector_actions ADD CONSTRAINT "FK_connector_actions_connectorId" 
                FOREIGN KEY ("connectorId") REFERENCES connectors(id) ON DELETE CASCADE;
            END IF;
            
            CREATE INDEX IF NOT EXISTS "IDX_connector_actions_connectorId" ON connector_actions ("connectorId");
        END IF;
        
        -- actionName
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'actionName'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "actionName" character varying(100) NOT NULL DEFAULT 'action';
        END IF;
        
        -- actionType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'actionType'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "actionType" character varying(50) NOT NULL DEFAULT 'read';
            
            CREATE INDEX IF NOT EXISTS "IDX_connector_actions_actionType" ON connector_actions ("actionType");
        END IF;
        
        -- inputSchema
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'inputSchema'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "inputSchema" jsonb NOT NULL DEFAULT '{}';
        END IF;
        
        -- outputSchema
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'outputSchema'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "outputSchema" jsonb NOT NULL DEFAULT '{}';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connector_actions' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE connector_actions ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
            
            CREATE INDEX IF NOT EXISTS "IDX_connector_actions_isActive" ON connector_actions ("isActive");
        END IF;
        
        DELETE FROM connector_actions WHERE "connectorId" IS NULL;
        
        ALTER TABLE connector_actions ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: connections
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
        ALTER TABLE connections DISABLE TRIGGER ALL;
        
        -- workspaceId (já pode existir da migração 033)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE connections ADD COLUMN "workspaceId" uuid;
            UPDATE connections SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE connections ALTER COLUMN "workspaceId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE connections ADD CONSTRAINT "FK_connections_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- connectorId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'connectorId'
        ) THEN
            ALTER TABLE connections ADD COLUMN "connectorId" uuid;
            UPDATE connections SET "connectorId" = connector_id WHERE connector_id IS NOT NULL;
            ALTER TABLE connections ALTER COLUMN "connectorId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connectors') THEN
                ALTER TABLE connections ADD CONSTRAINT "FK_connections_connectorId" 
                FOREIGN KEY ("connectorId") REFERENCES connectors(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- connectionName
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'connectionName'
        ) THEN
            ALTER TABLE connections ADD COLUMN "connectionName" character varying(100) NOT NULL DEFAULT 'connection';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE connections ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        END IF;
        
        DELETE FROM connections WHERE "workspaceId" IS NULL OR "connectorId" IS NULL;
        
        ALTER TABLE connections ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: oauth_tokens
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'oauth_tokens') THEN
        ALTER TABLE oauth_tokens DISABLE TRIGGER ALL;
        
        -- connectionId (já pode existir da migração 033)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'oauth_tokens' AND column_name = 'connectionId'
        ) THEN
            ALTER TABLE oauth_tokens ADD COLUMN "connectionId" uuid;
            UPDATE oauth_tokens SET "connectionId" = connection_id WHERE connection_id IS NOT NULL;
            ALTER TABLE oauth_tokens ALTER COLUMN "connectionId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
                ALTER TABLE oauth_tokens ADD CONSTRAINT "FK_oauth_tokens_connectionId" 
                FOREIGN KEY ("connectionId") REFERENCES connections(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        DELETE FROM oauth_tokens WHERE "connectionId" IS NULL;
        
        ALTER TABLE oauth_tokens ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: connection_secrets
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connection_secrets') THEN
        ALTER TABLE connection_secrets DISABLE TRIGGER ALL;
        
        -- connectionId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connection_secrets' AND column_name = 'connectionId'
        ) THEN
            ALTER TABLE connection_secrets ADD COLUMN "connectionId" uuid;
            UPDATE connection_secrets SET "connectionId" = connection_id WHERE connection_id IS NOT NULL;
            ALTER TABLE connection_secrets ALTER COLUMN "connectionId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
                ALTER TABLE connection_secrets ADD CONSTRAINT "FK_connection_secrets_connectionId" 
                FOREIGN KEY ("connectionId") REFERENCES connections(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- secretKey
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connection_secrets' AND column_name = 'secretKey'
        ) THEN
            ALTER TABLE connection_secrets ADD COLUMN "secretKey" character varying(100) NOT NULL DEFAULT 'default';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connection_secrets' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE connection_secrets ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        END IF;
        
        DELETE FROM connection_secrets WHERE "connectionId" IS NULL;
        
        ALTER TABLE connection_secrets ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_actions INTEGER;
    v_connections INTEGER;
    v_tokens INTEGER;
    v_secrets INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_actions FROM connector_actions;
    SELECT COUNT(*) INTO v_connections FROM connections;
    SELECT COUNT(*) INTO v_tokens FROM oauth_tokens;
    SELECT COUNT(*) INTO v_secrets FROM connection_secrets;
    
    RAISE NOTICE 'Migração 036 concluída.';
    RAISE NOTICE '  - connector_actions: %', v_actions;
    RAISE NOTICE '  - connections: %', v_connections;
    RAISE NOTICE '  - oauth_tokens: %', v_tokens;
    RAISE NOTICE '  - connection_secrets: %', v_secrets;
END $$;
