-- Migração 037: Adicionar coluna version em workflow_versions
-- Data: 2025-10-25
-- Problema: Coluna version não existe em workflow_versions mas TypeORM espera
-- Solução: Adiciona coluna version com valor padrão

BEGIN;

-- Desabilitar triggers temporariamente
ALTER TABLE workflow_versions DISABLE TRIGGER ALL;

-- Adicionar coluna version se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'version'
    ) THEN
        ALTER TABLE workflow_versions ADD COLUMN version character varying;
        UPDATE workflow_versions SET version = '1.0.0' WHERE version IS NULL;
        ALTER TABLE workflow_versions ALTER COLUMN version SET NOT NULL;
        ALTER TABLE workflow_versions ALTER COLUMN version SET DEFAULT '1.0.0';
    END IF;
END $$;

-- Reabilitar triggers
ALTER TABLE workflow_versions ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM workflow_versions;
    
    RAISE NOTICE 'Migração 037 concluída. Registros: workflow_versions=%', v_count;
END $$;
