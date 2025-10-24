-- Migração para corrigir colunas camelCase na tabela execution_steps
-- Data: 2025-10-24
-- Problema: TypeORM tentando criar colunas camelCase em tabela com snake_case

BEGIN;

-- 1. Corrigir coluna nodeId
DO $$
BEGIN
    -- Se a coluna nodeId não existe, criar ela baseada na node_id existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeId'
    ) THEN
        -- Adicionar coluna nodeId como nullable primeiro
        ALTER TABLE execution_steps 
        ADD COLUMN "nodeId" character varying;
        
        -- Copiar dados de node_id para nodeId
        UPDATE execution_steps 
        SET "nodeId" = node_id 
        WHERE node_id IS NOT NULL;
        
        -- Agora tornar a coluna NOT NULL
        ALTER TABLE execution_steps 
        ALTER COLUMN "nodeId" SET NOT NULL;
        
        RAISE NOTICE 'Coluna nodeId criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna nodeId já existe';
    END IF;
END $$;

-- 2. Corrigir coluna nodeName
DO $$
BEGIN
    -- Se a coluna nodeName não existe, criar ela baseada na node_name existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeName'
    ) THEN
        -- Adicionar coluna nodeName como nullable primeiro
        ALTER TABLE execution_steps 
        ADD COLUMN "nodeName" character varying;
        
        -- Copiar dados de node_name para nodeName
        UPDATE execution_steps 
        SET "nodeName" = node_name 
        WHERE node_name IS NOT NULL;
        
        -- Agora tornar a coluna NOT NULL
        ALTER TABLE execution_steps 
        ALTER COLUMN "nodeName" SET NOT NULL;
        
        RAISE NOTICE 'Coluna nodeName criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna nodeName já existe';
    END IF;
END $$;

-- 3. Corrigir coluna nodeType
DO $$
BEGIN
    -- Se a coluna nodeType não existe, criar ela baseada na node_type existente (se existir)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeType'
    ) THEN
        -- Verificar se existe coluna node_type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_steps' 
            AND column_name = 'node_type'
        ) THEN
            -- Adicionar coluna nodeType como nullable primeiro
            ALTER TABLE execution_steps 
            ADD COLUMN "nodeType" character varying;
            
            -- Copiar dados de node_type para nodeType
            UPDATE execution_steps 
            SET "nodeType" = node_type 
            WHERE node_type IS NOT NULL;
            
            -- Agora tornar a coluna NOT NULL
            ALTER TABLE execution_steps 
            ALTER COLUMN "nodeType" SET NOT NULL;
            
            RAISE NOTICE 'Coluna nodeType criada e populada com sucesso';
        ELSE
            -- Se não existe node_type, criar nodeType com valor padrão
            ALTER TABLE execution_steps 
            ADD COLUMN "nodeType" character varying NOT NULL DEFAULT 'unknown';
            
            RAISE NOTICE 'Coluna nodeType criada com valor padrão';
        END IF;
    ELSE
        RAISE NOTICE 'Coluna nodeType já existe';
    END IF;
END $$;

-- 4. Corrigir coluna inputItems
DO $$
BEGIN
    -- Se a coluna inputItems não existe, criar ela baseada na input_items existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'inputItems'
    ) THEN
        -- Adicionar coluna inputItems como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "inputItems" jsonb;
        
        -- Copiar dados de input_items para inputItems
        UPDATE execution_steps 
        SET "inputItems" = input_items 
        WHERE input_items IS NOT NULL;
        
        RAISE NOTICE 'Coluna inputItems criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna inputItems já existe';
    END IF;
END $$;

-- 5. Corrigir coluna outputItems
DO $$
BEGIN
    -- Se a coluna outputItems não existe, criar ela baseada na output_items existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'outputItems'
    ) THEN
        -- Adicionar coluna outputItems como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "outputItems" jsonb;
        
        -- Copiar dados de output_items para outputItems
        UPDATE execution_steps 
        SET "outputItems" = output_items 
        WHERE output_items IS NOT NULL;
        
        RAISE NOTICE 'Coluna outputItems criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna outputItems já existe';
    END IF;
END $$;

-- 6. Corrigir coluna startedAt
DO $$
BEGIN
    -- Se a coluna startedAt não existe, criar ela baseada na started_at existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'startedAt'
    ) THEN
        -- Adicionar coluna startedAt como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "startedAt" timestamp with time zone;
        
        -- Copiar dados de started_at para startedAt
        UPDATE execution_steps 
        SET "startedAt" = started_at 
        WHERE started_at IS NOT NULL;
        
        RAISE NOTICE 'Coluna startedAt criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna startedAt já existe';
    END IF;
END $$;

-- 7. Corrigir coluna finishedAt
DO $$
BEGIN
    -- Se a coluna finishedAt não existe, criar ela baseada na finished_at existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'finishedAt'
    ) THEN
        -- Adicionar coluna finishedAt como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "finishedAt" timestamp with time zone;
        
        -- Copiar dados de finished_at para finishedAt
        UPDATE execution_steps 
        SET "finishedAt" = finished_at 
        WHERE finished_at IS NOT NULL;
        
        RAISE NOTICE 'Coluna finishedAt criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna finishedAt já existe';
    END IF;
END $$;

-- 8. Corrigir coluna errorMessage
DO $$
BEGIN
    -- Se a coluna errorMessage não existe, criar ela baseada na error existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'errorMessage'
    ) THEN
        -- Adicionar coluna errorMessage como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "errorMessage" character varying;
        
        -- Extrair mensagem de erro do campo JSON error se existir
        UPDATE execution_steps 
        SET "errorMessage" = error->>'message' 
        WHERE error IS NOT NULL AND error->>'message' IS NOT NULL;
        
        RAISE NOTICE 'Coluna errorMessage criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna errorMessage já existe';
    END IF;
END $$;

-- 9. Corrigir coluna metadata
DO $$
BEGIN
    -- Se a coluna metadata não existe, criar ela
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'metadata'
    ) THEN
        -- Adicionar coluna metadata como nullable
        ALTER TABLE execution_steps 
        ADD COLUMN "metadata" jsonb;
        
        RAISE NOTICE 'Coluna metadata criada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna metadata já existe';
    END IF;
END $$;

-- 10. Verificar se existem registros órfãos (valores nulos)
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count 
    FROM execution_steps 
    WHERE "nodeId" IS NULL OR "nodeName" IS NULL;
    
    IF null_count > 0 THEN
        RAISE WARNING 'Existem % registros com nodeId ou nodeName nulo. Removendo...', null_count;
        
        -- Remover registros órfãos
        DELETE FROM execution_steps 
        WHERE "nodeId" IS NULL OR "nodeName" IS NULL;
        
        RAISE NOTICE 'Registros órfãos removidos';
    ELSE
        RAISE NOTICE 'Nenhum registro órfão encontrado';
    END IF;
END $$;

COMMIT;
