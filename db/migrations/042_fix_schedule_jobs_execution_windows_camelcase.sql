-- Migração 042: Correção de nomenclatura camelCase para schedule_jobs e execution_windows
-- Data: 2025-10-25
-- Problema: Tabelas usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para schedule_jobs e execution_windows

BEGIN;

-- ============================================================================
-- TABELA: schedule_jobs
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schedule_jobs') THEN
        ALTER TABLE schedule_jobs DISABLE TRIGGER ALL;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "workspaceId" uuid;
            UPDATE schedule_jobs SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
            ALTER TABLE schedule_jobs ALTER COLUMN "workspaceId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE schedule_jobs ADD CONSTRAINT "FK_schedule_jobs_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
            
            CREATE INDEX IF NOT EXISTS "IDX_schedule_jobs_workspaceId" ON schedule_jobs ("workspaceId");
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- workflowId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'workflowId'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "workflowId" uuid;
            UPDATE schedule_jobs SET "workflowId" = workflow_id WHERE workflow_id IS NOT NULL;
            ALTER TABLE schedule_jobs ALTER COLUMN "workflowId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workflows') THEN
                ALTER TABLE schedule_jobs ADD CONSTRAINT "FK_schedule_jobs_workflowId" 
                FOREIGN KEY ("workflowId") REFERENCES workflows(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- cronExpression
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'cronExpression'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "cronExpression" character varying(255) NOT NULL DEFAULT '';
            UPDATE schedule_jobs SET "cronExpression" = cron_expression WHERE cron_expression IS NOT NULL;
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
            UPDATE schedule_jobs SET "isActive" = is_active WHERE is_active IS NOT NULL;
        END IF;
        
        -- triggerData
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'triggerData'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "triggerData" jsonb;
        END IF;
        
        -- lastExecution
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'lastExecution'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "lastExecution" timestamp with time zone;
            UPDATE schedule_jobs SET "lastExecution" = last_run_at WHERE last_run_at IS NOT NULL;
        END IF;
        
        -- nextExecution
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'nextExecution'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "nextExecution" timestamp with time zone;
            UPDATE schedule_jobs SET "nextExecution" = next_run_at WHERE next_run_at IS NOT NULL;
        END IF;
        
        -- executionCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'executionCount'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "executionCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- failureCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'failureCount'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "failureCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
            UPDATE schedule_jobs SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'schedule_jobs' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE schedule_jobs ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
            UPDATE schedule_jobs SET "updatedAt" = updated_at WHERE updated_at IS NOT NULL;
        END IF;
        
        ALTER TABLE schedule_jobs ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: execution_windows
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'execution_windows') THEN
        ALTER TABLE execution_windows DISABLE TRIGGER ALL;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "workspaceId" uuid NOT NULL DEFAULT gen_random_uuid();
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE execution_windows ADD CONSTRAINT "FK_execution_windows_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- cronExpression
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'cronExpression'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "cronExpression" character varying(255) NOT NULL DEFAULT '';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
            UPDATE execution_windows SET "isActive" = is_active WHERE is_active IS NOT NULL;
        END IF;
        
        -- lastExecution
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'lastExecution'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "lastExecution" timestamp with time zone;
        END IF;
        
        -- nextExecution
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'nextExecution'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "nextExecution" timestamp with time zone;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
            UPDATE execution_windows SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_windows' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE execution_windows ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE execution_windows ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_schedule_jobs INTEGER;
    v_execution_windows INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_schedule_jobs FROM schedule_jobs;
    SELECT COUNT(*) INTO v_execution_windows FROM execution_windows;
    
    RAISE NOTICE 'Migração 042 concluída.';
    RAISE NOTICE '  - schedule_jobs: %', v_schedule_jobs;
    RAISE NOTICE '  - execution_windows: %', v_execution_windows;
END $$;
