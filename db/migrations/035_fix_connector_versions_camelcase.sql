-- Migração 035: Correção de nomenclatura camelCase para connector_versions
-- Data: 2025-10-25
-- Problema: Tabela connector_versions usa snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase e popula a partir de snake_case

BEGIN;

-- Desabilitar triggers temporariamente
ALTER TABLE connector_versions DISABLE TRIGGER ALL;

-- ============================================================================
-- TABELA: connector_versions
-- ============================================================================

-- connectorId
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connector_versions' 
        AND column_name = 'connectorId'
    ) THEN
        ALTER TABLE connector_versions ADD COLUMN "connectorId" uuid;
        UPDATE connector_versions SET "connectorId" = connector_id WHERE connector_id IS NOT NULL;
        ALTER TABLE connector_versions ALTER COLUMN "connectorId" SET NOT NULL;
        
        -- FK (se connectors existir)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connectors') THEN
            ALTER TABLE connector_versions 
            ADD CONSTRAINT "FK_connector_versions_connectorId" 
            FOREIGN KEY ("connectorId") REFERENCES connectors(id) ON DELETE CASCADE;
        END IF;
        
        CREATE INDEX IF NOT EXISTS "IDX_connector_versions_connectorId" ON connector_versions ("connectorId");
    END IF;
END $$;

-- isActive
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connector_versions' 
        AND column_name = 'isActive'
    ) THEN
        ALTER TABLE connector_versions ADD COLUMN "isActive" boolean NOT NULL DEFAULT false;
        
        CREATE INDEX IF NOT EXISTS "IDX_connector_versions_isActive" ON connector_versions ("isActive");
    END IF;
END $$;

-- configSchema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connector_versions' 
        AND column_name = 'configSchema'
    ) THEN
        ALTER TABLE connector_versions ADD COLUMN "configSchema" jsonb NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- authSchema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connector_versions' 
        AND column_name = 'authSchema'
    ) THEN
        ALTER TABLE connector_versions ADD COLUMN "authSchema" jsonb NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Limpeza de registros órfãos
DELETE FROM connector_versions WHERE "connectorId" IS NULL;

-- Reabilitar triggers
ALTER TABLE connector_versions ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_versions INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_versions FROM connector_versions;
    
    RAISE NOTICE 'Migração 035 concluída. Registros: connector_versions=%', v_versions;
END $$;
