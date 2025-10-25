-- Migração 034: Adicionar colunas faltantes em connectors
-- Data: 2025-10-25
-- Problema: Migração 032 não incluiu todas as colunas camelCase necessárias
-- Solução: Adiciona as colunas faltantes

BEGIN;

-- Desabilitar triggers temporariamente
ALTER TABLE connectors DISABLE TRIGGER ALL;

-- ============================================================================
-- TABELA: connectors
-- ============================================================================

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
        
        CREATE INDEX IF NOT EXISTS "IDX_connectors_connectorType" ON connectors ("connectorType");
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
        
        CREATE INDEX IF NOT EXISTS "IDX_connectors_category" ON connectors ("category");
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

-- Reabilitar triggers
ALTER TABLE connectors ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_connectors INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_connectors FROM connectors;
    
    RAISE NOTICE 'Migração 034 concluída. Registros: connectors=%', v_connectors;
END $$;
