-- Migração 043: Correção de nomenclatura camelCase para system_events e idempotency_keys
-- Data: 2025-10-25
-- Problema: Tabelas usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para system_events e idempotency_keys

BEGIN;

-- ============================================================================
-- TABELA: system_events
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_events') THEN
        ALTER TABLE system_events DISABLE TRIGGER ALL;
        
        -- eventType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'eventType'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "eventType" character varying(100) NOT NULL DEFAULT '';
            UPDATE system_events SET "eventType" = event_type WHERE event_type IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_system_events_eventType" ON system_events ("eventType");
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
            UPDATE system_events SET "tenantId" = tenant_id WHERE tenant_id IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_system_events_tenantId" ON system_events ("tenantId");
        END IF;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "workspaceId" uuid;
            UPDATE system_events SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_system_events_workspaceId" ON system_events ("workspaceId");
        END IF;
        
        -- runId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'runId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "runId" uuid;
            UPDATE system_events SET "runId" = run_id WHERE run_id IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_system_events_runId" ON system_events ("runId");
        END IF;
        
        -- correlationId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'correlationId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "correlationId" character varying(100);
            UPDATE system_events SET "correlationId" = correlation_id WHERE correlation_id IS NOT NULL;
        END IF;
        
        -- traceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'traceId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "traceId" character varying(100);
            UPDATE system_events SET "traceId" = trace_id WHERE trace_id IS NOT NULL;
        END IF;
        
        -- spanId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'system_events' AND column_name = 'spanId'
        ) THEN
            ALTER TABLE system_events ADD COLUMN "spanId" character varying(100);
            UPDATE system_events SET "spanId" = span_id WHERE span_id IS NOT NULL;
        END IF;
        
        ALTER TABLE system_events ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: idempotency_keys
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idempotency_keys') THEN
        ALTER TABLE idempotency_keys DISABLE TRIGGER ALL;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'idempotency_keys' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE idempotency_keys ADD COLUMN "tenantId" uuid;
            UPDATE idempotency_keys SET "tenantId" = tenant_id WHERE tenant_id IS NOT NULL;
            ALTER TABLE idempotency_keys ALTER COLUMN "tenantId" SET NOT NULL;
        END IF;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'idempotency_keys' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE idempotency_keys ADD COLUMN "workspaceId" uuid;
            UPDATE idempotency_keys SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE idempotency_keys ALTER COLUMN "workspaceId" SET NOT NULL;
        END IF;
        
        -- runId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'idempotency_keys' AND column_name = 'runId'
        ) THEN
            ALTER TABLE idempotency_keys ADD COLUMN "runId" uuid;
            UPDATE idempotency_keys SET "runId" = run_id WHERE run_id IS NOT NULL;
        END IF;
        
        -- expiresAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'idempotency_keys' AND column_name = 'expiresAt'
        ) THEN
            ALTER TABLE idempotency_keys ADD COLUMN "expiresAt" timestamp with time zone NOT NULL;
            UPDATE idempotency_keys SET "expiresAt" = expires_at WHERE expires_at IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_idempotency_keys_expiresAt" ON idempotency_keys ("expiresAt");
        END IF;
        
        -- Criar índice em workspaceId
        CREATE INDEX IF NOT EXISTS "IDX_idempotency_keys_workspaceId" ON idempotency_keys ("workspaceId");
        
        ALTER TABLE idempotency_keys ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_system_events INTEGER;
    v_idempotency_keys INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_system_events FROM system_events;
    SELECT COUNT(*) INTO v_idempotency_keys FROM idempotency_keys;
    
    RAISE NOTICE 'Migração 043 concluída.';
    RAISE NOTICE '  - system_events: %', v_system_events;
    RAISE NOTICE '  - idempotency_keys: %', v_idempotency_keys;
END $$;
