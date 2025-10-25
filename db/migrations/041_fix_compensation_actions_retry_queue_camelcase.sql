-- Migração 041: Correção de nomenclatura camelCase para compensation_actions e retry_queue
-- Data: 2025-10-25
-- Problema: Tabelas usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para compensation_actions e retry_queue

BEGIN;

-- ============================================================================
-- TABELA: compensation_actions
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compensation_actions') THEN
        ALTER TABLE compensation_actions DISABLE TRIGGER ALL;
        
        -- runId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'runId'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "runId" uuid;
            UPDATE compensation_actions SET "runId" = run_id WHERE run_id IS NOT NULL;
            ALTER TABLE compensation_actions ALTER COLUMN "runId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'executions') THEN
                ALTER TABLE compensation_actions ADD CONSTRAINT "FK_compensation_actions_runId" 
                FOREIGN KEY ("runId") REFERENCES executions(id) ON DELETE CASCADE;
            END IF;
            
            CREATE INDEX IF NOT EXISTS "IDX_compensation_actions_runId" ON compensation_actions ("runId");
        END IF;
        
        -- stepId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'stepId'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "stepId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- actionType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'actionType'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "actionType" character varying(100) NOT NULL DEFAULT '';
            UPDATE compensation_actions SET "actionType" = action_type WHERE action_type IS NOT NULL;
        END IF;
        
        -- actionData (nota: snake_case é action_config e é JSONB)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'actionData'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "actionData" jsonb NOT NULL DEFAULT '{}';
            UPDATE compensation_actions SET "actionData" = action_config WHERE action_config IS NOT NULL;
        END IF;
        
        -- executedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'executedAt'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "executedAt" timestamp with time zone;
            UPDATE compensation_actions SET "executedAt" = executed_at WHERE executed_at IS NOT NULL;
        END IF;
        
        -- errorMessage
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'errorMessage'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "errorMessage" text;
            UPDATE compensation_actions SET "errorMessage" = error_message WHERE error_message IS NOT NULL;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
            UPDATE compensation_actions SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        END IF;
        
        -- updatedAt (pode não existir)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'compensation_actions' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE compensation_actions ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE compensation_actions ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: retry_queue
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'retry_queue') THEN
        ALTER TABLE retry_queue DISABLE TRIGGER ALL;
        
        -- runId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'runId'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "runId" uuid;
            UPDATE retry_queue SET "runId" = run_id WHERE run_id IS NOT NULL;
            ALTER TABLE retry_queue ALTER COLUMN "runId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'executions') THEN
                ALTER TABLE retry_queue ADD CONSTRAINT "FK_retry_queue_runId" 
                FOREIGN KEY ("runId") REFERENCES executions(id) ON DELETE CASCADE;
            END IF;
            
            CREATE INDEX IF NOT EXISTS "IDX_retry_queue_runId" ON retry_queue ("runId");
        END IF;
        
        -- stepId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'stepId'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "stepId" uuid NOT NULL DEFAULT gen_random_uuid();
            UPDATE retry_queue SET "stepId" = step_id WHERE step_id IS NOT NULL;
        END IF;
        
        -- retryCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'retryCount'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "retryCount" integer NOT NULL DEFAULT 0;
            UPDATE retry_queue SET "retryCount" = retry_count WHERE retry_count IS NOT NULL;
        END IF;
        
        -- maxRetries
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'maxRetries'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "maxRetries" integer NOT NULL DEFAULT 3;
            UPDATE retry_queue SET "maxRetries" = max_retries WHERE max_retries IS NOT NULL;
        END IF;
        
        -- nextRetryAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'nextRetryAt'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "nextRetryAt" timestamp with time zone NOT NULL;
            UPDATE retry_queue SET "nextRetryAt" = next_retry_at WHERE next_retry_at IS NOT NULL;
            
            CREATE INDEX IF NOT EXISTS "IDX_retry_queue_nextRetryAt" ON retry_queue ("nextRetryAt");
        END IF;
        
        -- errorMessage
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'errorMessage'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "errorMessage" text;
            UPDATE retry_queue SET "errorMessage" = error_message WHERE error_message IS NOT NULL;
        END IF;
        
        -- errorDetails (JSONB)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'retry_queue' AND column_name = 'errorDetails'
        ) THEN
            ALTER TABLE retry_queue ADD COLUMN "errorDetails" jsonb NOT NULL DEFAULT '{}';
            UPDATE retry_queue SET "errorDetails" = error_details WHERE error_details IS NOT NULL;
        END IF;
        
        ALTER TABLE retry_queue ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_compensation_actions INTEGER;
    v_retry_queue INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_compensation_actions FROM compensation_actions;
    SELECT COUNT(*) INTO v_retry_queue FROM retry_queue;
    
    RAISE NOTICE 'Migração 041 concluída.';
    RAISE NOTICE '  - compensation_actions: %', v_compensation_actions;
    RAISE NOTICE '  - retry_queue: %', v_retry_queue;
END $$;
