-- Migração 032: Correção de nomenclatura camelCase para connectors
-- Data: 2025-10-25
-- Problema: Tabela connectors usa snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase e popula a partir de snake_case

BEGIN;

-- Desabilitar triggers temporariamente
ALTER TABLE connectors DISABLE TRIGGER ALL;

-- ============================================================================
-- TABELA: connectors
-- ============================================================================

-- workspaceId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'workspaceId'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "workspaceId" uuid;
        UPDATE connectors SET "workspaceId" = workspace_id WHERE workspace_id IS NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "workspaceId" SET NOT NULL;
        
        -- FK (se workspaces existir)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
            ALTER TABLE connectors 
            ADD CONSTRAINT "FK_connectors_workspaceId" 
            FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS "IDX_connectors_workspaceId" ON connectors ("workspaceId");
    END IF;
END $$;

-- connectorType
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'connectorType'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "connectorType" character varying(50);
        UPDATE connectors SET "connectorType" = connector_type WHERE connector_type IS NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "connectorType" SET NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "connectorType" SET DEFAULT 'generic';
    END IF;
END $$;

-- category
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "category" character varying(100) NOT NULL DEFAULT 'general';
    END IF;
END $$;

-- iconUrl
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'iconUrl'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "iconUrl" character varying(500);
    END IF;
END $$;

-- documentationUrl
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'documentationUrl'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "documentationUrl" character varying(500);
    END IF;
END $$;

-- isActive (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- isPublic (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'isPublic'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "isPublic" boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- createdAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "createdAt" timestamp with time zone;
        UPDATE connectors SET "createdAt" = created_at WHERE created_at IS NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "createdAt" SET NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "createdAt" SET DEFAULT NOW();
    END IF;
END $$;

-- updatedAt
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "updatedAt" timestamp with time zone;
        UPDATE connectors SET "updatedAt" = COALESCE(updated_at, "createdAt");
        ALTER TABLE connectors ALTER COLUMN "updatedAt" SET NOT NULL;
        ALTER TABLE connectors ALTER COLUMN "updatedAt" SET DEFAULT NOW();
    END IF;
END $$;

-- createdBy (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connectors' 
        AND column_name = 'createdBy'
    ) THEN
        ALTER TABLE connectors ADD COLUMN "createdBy" uuid;
    END IF;
END $$;

-- ============================================================================
-- LIMPEZA DE REGISTROS ÓRFÃOS
-- ============================================================================

DELETE FROM connectors WHERE "workspaceId" IS NULL;

-- Reabilitar triggers
ALTER TABLE connectors ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_connectors INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_connectors FROM connectors;
    
    RAISE NOTICE 'Migração 032 concluída. Registros: connectors=%', v_connectors;
END $$;
