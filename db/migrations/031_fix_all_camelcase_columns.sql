-- Migração 031: Correção completa de nomenclatura camelCase
-- Data: 2025-10-25
-- Problema: Multiple tables have snake_case columns but TypeORM expects camelCase
-- Solução: Adiciona colunas camelCase e popula a partir de snake_case

BEGIN;

-- Desabilitar triggers temporariamente para evitar conflitos
ALTER TABLE workflows DISABLE TRIGGER ALL;
ALTER TABLE workflow_versions DISABLE TRIGGER ALL;
ALTER TABLE executions DISABLE TRIGGER ALL;

-- ============================================================================
-- TABELA: workflow_versions
-- ============================================================================

-- workflowId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'workflowId'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "workflowId" uuid;
        UPDATE workflow_versions SET "workflowId" = workflow_id WHERE workflow_id IS NOT NULL;
        ALTER TABLE workflow_versions ALTER COLUMN "workflowId" SET NOT NULL;
        
        -- FK
        ALTER TABLE workflow_versions 
        ADD CONSTRAINT "FK_workflow_versions_workflowId" 
        FOREIGN KEY ("workflowId") REFERENCES workflows(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS "IDX_workflow_versions_workflowId" ON workflow_versions ("workflowId");
    END IF;
END $$;

-- isActive (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- nodes (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'nodes'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "nodes" jsonb NOT NULL DEFAULT '[]'::jsonb;
        -- Tenta copiar de definition se existir
        UPDATE workflow_versions 
        SET "nodes" = COALESCE(definition->'nodes', '[]'::jsonb) 
        WHERE definition IS NOT NULL;
    END IF;
END $$;

-- edges (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'edges'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "edges" jsonb NOT NULL DEFAULT '[]'::jsonb;
        UPDATE workflow_versions 
        SET "edges" = COALESCE(definition->'edges', '[]'::jsonb) 
        WHERE definition IS NOT NULL;
    END IF;
END $$;

-- settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'settings'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "settings" jsonb;
    END IF;
END $$;

-- metadata
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "metadata" jsonb;
    END IF;
END $$;

-- createdAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "createdAt" timestamp with time zone;
        UPDATE workflow_versions SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        ALTER TABLE workflow_versions ALTER COLUMN "createdAt" SET NOT NULL;
        ALTER TABLE workflow_versions ALTER COLUMN "createdAt" SET DEFAULT NOW();
    END IF;
END $$;

-- updatedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN "updatedAt" timestamp with time zone;
        UPDATE workflow_versions SET "updatedAt" = "createdAt";
        ALTER TABLE workflow_versions ALTER COLUMN "updatedAt" SET NOT NULL;
        ALTER TABLE workflow_versions ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- TABELA: workflows
-- ============================================================================

-- workspaceId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'workspaceId'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "workspaceId" uuid;
        UPDATE workflows SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
        ALTER TABLE workflows ALTER COLUMN "workspaceId" SET NOT NULL;
        
        -- FK
        ALTER TABLE workflows 
        ADD CONSTRAINT "FK_workflows_workspaceId" 
        FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS "IDX_workflows_workspaceId" ON workflows ("workspaceId");
    END IF;
END $$;

-- tenantId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'tenantId'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        -- Pega tenantId do workspace
        UPDATE workflows w 
        SET "tenantId" = ws.tenant_id 
        FROM workspaces ws 
        WHERE w."workspaceId" = ws.id;
    END IF;
END $$;

-- isActive
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- isPublic
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'isPublic'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "isPublic" boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- activeVersionId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'activeVersionId'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "activeVersionId" uuid;
        UPDATE workflows SET "activeVersionId" = active_version_id WHERE active_version_id IS NOT NULL;
        
        -- FK
        ALTER TABLE workflows 
        ADD CONSTRAINT "FK_workflows_activeVersionId" 
        FOREIGN KEY ("activeVersionId") REFERENCES workflow_versions(id);
    END IF;
END $$;

-- tags
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "tags" jsonb;
    END IF;
END $$;

-- metadata
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "metadata" jsonb;
    END IF;
END $$;

-- createdAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "createdAt" timestamp with time zone;
        UPDATE workflows SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        ALTER TABLE workflows ALTER COLUMN "createdAt" SET NOT NULL;
        ALTER TABLE workflows ALTER COLUMN "createdAt" SET DEFAULT NOW();
    END IF;
END $$;

-- updatedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflows' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE workflows ADD COLUMN "updatedAt" timestamp with time zone;
        UPDATE workflows SET "updatedAt" = "createdAt";
        ALTER TABLE workflows ALTER COLUMN "updatedAt" SET NOT NULL;
        ALTER TABLE workflows ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- TABELA: executions
-- ============================================================================

-- workflowId (CRÍTICO: deve vir primeiro pois é usado por outras colunas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'workflowId'
    ) THEN
        ALTER TABLE executions ADD COLUMN "workflowId" uuid;
        UPDATE executions SET "workflowId" = workflow_id WHERE workflow_id IS NOT NULL;
        ALTER TABLE executions ALTER COLUMN "workflowId" SET NOT NULL;
        
        -- FK
        ALTER TABLE executions 
        ADD CONSTRAINT "FK_executions_workflowId" 
        FOREIGN KEY ("workflowId") REFERENCES workflows(id) ON DELETE CASCADE;
        
        CREATE INDEX IF NOT EXISTS "IDX_executions_workflowId" ON executions ("workflowId");
    END IF;
END $$;

-- workspaceId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'workspaceId'
    ) THEN
        ALTER TABLE executions ADD COLUMN "workspaceId" uuid;
        UPDATE executions SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
        ALTER TABLE executions ALTER COLUMN "workspaceId" SET NOT NULL;
    END IF;
END $$;

-- tenantId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'tenantId'
    ) THEN
        ALTER TABLE executions ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        -- Usa workflow_id (snake_case) caso workflowId ainda não exista
        UPDATE executions e 
        SET "tenantId" = w."tenantId" 
        FROM workflows w 
        WHERE e.workflow_id = w.id;
    END IF;
END $$;

-- triggerData
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'triggerData'
    ) THEN
        ALTER TABLE executions ADD COLUMN "triggerData" jsonb;
    END IF;
END $$;

-- correlationId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'correlationId'
    ) THEN
        ALTER TABLE executions ADD COLUMN "correlationId" character varying;
        UPDATE executions SET "correlationId" = correlation_id::text WHERE correlation_id IS NOT NULL;
    END IF;
END $$;

-- traceId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'traceId'
    ) THEN
        ALTER TABLE executions ADD COLUMN "traceId" character varying;
    END IF;
END $$;

-- startedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'startedAt'
    ) THEN
        ALTER TABLE executions ADD COLUMN "startedAt" timestamp with time zone;
        UPDATE executions SET "startedAt" = started_at WHERE started_at IS NOT NULL;
    END IF;
END $$;

-- finishedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'finishedAt'
    ) THEN
        ALTER TABLE executions ADD COLUMN "finishedAt" timestamp with time zone;
        UPDATE executions SET "finishedAt" = finished_at WHERE finished_at IS NOT NULL;
    END IF;
END $$;

-- errorMessage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'errorMessage'
    ) THEN
        ALTER TABLE executions ADD COLUMN "errorMessage" character varying;
        UPDATE executions SET "errorMessage" = error->>'message' WHERE error IS NOT NULL;
    END IF;
END $$;

-- result
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'result'
    ) THEN
        ALTER TABLE executions ADD COLUMN "result" jsonb;
    END IF;
END $$;

-- createdAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE executions ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- updatedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'executions' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE executions ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
    END IF;
END $$;

-- ============================================================================
-- LIMPEZA DE REGISTROS ÓRFÃOS
-- ============================================================================

DELETE FROM workflow_versions WHERE "workflowId" IS NULL;
DELETE FROM workflows WHERE "workspaceId" IS NULL;
DELETE FROM executions WHERE "workflowId" IS NULL;

-- Reabilitar triggers
ALTER TABLE workflows ENABLE TRIGGER ALL;
ALTER TABLE workflow_versions ENABLE TRIGGER ALL;
ALTER TABLE executions ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_workflow_versions INTEGER;
    v_workflows INTEGER;
    v_executions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_workflow_versions FROM workflow_versions;
    SELECT COUNT(*) INTO v_workflows FROM workflows;
    SELECT COUNT(*) INTO v_executions FROM executions;
    
    RAISE NOTICE 'Migração 031 concluída. Registros: workflow_versions=%, workflows=%, executions=%', 
                  v_workflow_versions, v_workflows, v_executions;
END $$;
