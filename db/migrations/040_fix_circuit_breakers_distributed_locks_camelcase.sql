-- Migração 040: Correção de nomenclatura camelCase para circuit_breakers e distributed_locks
-- Data: 2025-10-25
-- Problema: Tabelas usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para circuit_breakers e distributed_locks

BEGIN;

-- ============================================================================
-- TABELA: circuit_breakers
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'circuit_breakers') THEN
        ALTER TABLE circuit_breakers DISABLE TRIGGER ALL;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "workspaceId" uuid;
            UPDATE circuit_breakers SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE circuit_breakers ALTER COLUMN "workspaceId" SET NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_circuit_breakers_workspaceId" ON circuit_breakers ("workspaceId");
        END IF;
        
        -- tenantId (adicionar se necessário)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- failureCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'failureCount'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "failureCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- failureThreshold
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'failureThreshold'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "failureThreshold" integer NOT NULL DEFAULT 5;
        END IF;
        
        -- lastFailureTime (nota: snake_case é last_failure_at)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'lastFailureTime'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "lastFailureTime" timestamp with time zone;
            UPDATE circuit_breakers SET "lastFailureTime" = last_failure_at WHERE last_failure_at IS NOT NULL;
        END IF;
        
        -- nextAttemptTime (pode não existir no banco)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'nextAttemptTime'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "nextAttemptTime" timestamp with time zone;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'circuit_breakers' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE circuit_breakers ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE circuit_breakers ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: distributed_locks
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'distributed_locks') THEN
        ALTER TABLE distributed_locks DISABLE TRIGGER ALL;
        
        -- lockKey
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'distributed_locks' AND column_name = 'lockKey'
        ) THEN
            ALTER TABLE distributed_locks ADD COLUMN "lockKey" character varying(255) UNIQUE;
            UPDATE distributed_locks SET "lockKey" = lock_key WHERE lock_key IS NOT NULL;
            
            -- Criar índice único se necessário
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE tablename = 'distributed_locks' AND indexname = 'IDX_distributed_locks_lockKey'
            ) THEN
                CREATE UNIQUE INDEX "IDX_distributed_locks_lockKey" ON distributed_locks ("lockKey");
            END IF;
        END IF;
        
        -- lockedBy
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'distributed_locks' AND column_name = 'lockedBy'
        ) THEN
            ALTER TABLE distributed_locks ADD COLUMN "lockedBy" character varying(100) NOT NULL DEFAULT '';
            UPDATE distributed_locks SET "lockedBy" = locked_by WHERE locked_by IS NOT NULL;
        END IF;
        
        -- lockedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'distributed_locks' AND column_name = 'lockedAt'
        ) THEN
            ALTER TABLE distributed_locks ADD COLUMN "lockedAt" timestamp with time zone NOT NULL DEFAULT NOW();
            UPDATE distributed_locks SET "lockedAt" = locked_at WHERE locked_at IS NOT NULL;
        END IF;
        
        -- expiresAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'distributed_locks' AND column_name = 'expiresAt'
        ) THEN
            ALTER TABLE distributed_locks ADD COLUMN "expiresAt" timestamp with time zone NOT NULL;
            UPDATE distributed_locks SET "expiresAt" = expires_at WHERE expires_at IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_distributed_locks_expiresAt" ON distributed_locks ("expiresAt");
        END IF;
        
        ALTER TABLE distributed_locks ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_circuit_breakers INTEGER;
    v_distributed_locks INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_circuit_breakers FROM circuit_breakers;
    SELECT COUNT(*) INTO v_distributed_locks FROM distributed_locks;
    
    RAISE NOTICE 'Migração 040 concluída.';
    RAISE NOTICE '  - circuit_breakers: %', v_circuit_breakers;
    RAISE NOTICE '  - distributed_locks: %', v_distributed_locks;
END $$;
