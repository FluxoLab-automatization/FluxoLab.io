-- Migração 044: Correção específica da coluna version em workflow_versions
-- Data: 2025-10-25
-- Problema: Coluna version tem valores NULL mas TypeORM espera NOT NULL
-- Solução: Define valores padrão para registros NULL antes de tornar NOT NULL
-- NOTA: A coluna pode ser INTEGER (original) ou VARCHAR (migração 037)

BEGIN;

-- Desabilitar triggers temporariamente
ALTER TABLE workflow_versions DISABLE TRIGGER ALL;

-- Verificar e corrigir a coluna version
DO $$
DECLARE
    v_data_type TEXT;
    v_column_exists BOOLEAN;
BEGIN
    -- Verificar se a coluna existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' 
        AND column_name = 'version'
    ) INTO v_column_exists;
    
    IF v_column_exists THEN
        -- Obter tipo de dados atual
        SELECT data_type INTO v_data_type
        FROM information_schema.columns 
        WHERE table_name = 'workflow_versions' AND column_name = 'version';
        
        RAISE NOTICE 'Tipo de dados atual da coluna version: %', v_data_type;
        
        -- Se for INTEGER, converter para VARCHAR
        IF v_data_type = 'integer' THEN
            ALTER TABLE workflow_versions ALTER COLUMN version TYPE character varying USING version::text;
            RAISE NOTICE 'Coluna version convertida de INTEGER para VARCHAR';
        END IF;
        
        -- Verificar se há valores NULL
        IF EXISTS (SELECT 1 FROM workflow_versions WHERE version IS NULL) THEN
            -- Atualizar registros NULL com valor padrão
            UPDATE workflow_versions 
            SET version = '1.0.0' 
            WHERE version IS NULL;
            
            RAISE NOTICE 'Atualizados registros com version NULL para 1.0.0';
        END IF;
        
        -- Tornar a coluna NOT NULL se ainda não for
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'workflow_versions' 
            AND column_name = 'version'
            AND is_nullable = 'YES'
        ) THEN
            ALTER TABLE workflow_versions ALTER COLUMN version SET NOT NULL;
            RAISE NOTICE 'Coluna version alterada para NOT NULL';
        END IF;
        
        -- Adicionar DEFAULT se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'workflow_versions' 
            AND column_name = 'version'
            AND column_default IS NOT NULL
        ) THEN
            ALTER TABLE workflow_versions ALTER COLUMN version SET DEFAULT '1.0.0';
            RAISE NOTICE 'DEFAULT adicionado à coluna version';
        END IF;
    ELSE
        -- Se a coluna não existe, criar como VARCHAR
        ALTER TABLE workflow_versions ADD COLUMN version character varying NOT NULL DEFAULT '1.0.0';
        RAISE NOTICE 'Coluna version criada como VARCHAR com NOT NULL e DEFAULT';
    END IF;
END $$;

-- Reabilitar triggers
ALTER TABLE workflow_versions ENABLE TRIGGER ALL;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_count INTEGER;
    v_null_count INTEGER;
    v_data_type TEXT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM workflow_versions;
    SELECT COUNT(*) INTO v_null_count FROM workflow_versions WHERE version IS NULL;
    SELECT data_type INTO v_data_type
    FROM information_schema.columns 
    WHERE table_name = 'workflow_versions' AND column_name = 'version';
    
    RAISE NOTICE 'Migração 044 concluída.';
    RAISE NOTICE '  - Tipo de dados: %', v_data_type;
    RAISE NOTICE '  - Total de registros: %', v_count;
    RAISE NOTICE '  - Registros com version NULL: %', v_null_count;
    
    IF v_null_count > 0 THEN
        RAISE WARNING 'ATENÇÃO: Ainda existem % registros com version NULL!', v_null_count;
    END IF;
END $$;
