-- Migração para corrigir problema de executionId na tabela execution_steps
-- Data: 2025-10-24
-- Problema: TypeORM tentando adicionar coluna executionId NOT NULL em tabela com dados

BEGIN;

-- 1. Verificar se a coluna executionId já existe
DO $$
BEGIN
    -- Se a coluna executionId não existe, criar ela baseada na execution_id existente
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'executionId'
    ) THEN
        -- Adicionar coluna executionId como nullable primeiro
        ALTER TABLE execution_steps 
        ADD COLUMN "executionId" uuid;
        
        -- Copiar dados de execution_id para executionId
        UPDATE execution_steps 
        SET "executionId" = execution_id 
        WHERE execution_id IS NOT NULL;
        
        -- Agora tornar a coluna NOT NULL
        ALTER TABLE execution_steps 
        ALTER COLUMN "executionId" SET NOT NULL;
        
        -- Adicionar foreign key constraint se não existir
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_execution_steps_executionId'
        ) THEN
            ALTER TABLE execution_steps 
            ADD CONSTRAINT "FK_execution_steps_executionId" 
            FOREIGN KEY ("executionId") REFERENCES executions(id) ON DELETE CASCADE;
        END IF;
        
        -- Criar índice se não existir
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'execution_steps' 
            AND indexname = 'IDX_execution_steps_executionId'
        ) THEN
            CREATE INDEX "IDX_execution_steps_executionId" 
            ON execution_steps ("executionId");
        END IF;
        
        RAISE NOTICE 'Coluna executionId criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna executionId já existe';
    END IF;
END $$;

-- 2. Verificar se existem registros órfãos (executionId nulo)
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count 
    FROM execution_steps 
    WHERE "executionId" IS NULL;
    
    IF null_count > 0 THEN
        RAISE WARNING 'Existem % registros com executionId nulo. Removendo...', null_count;
        
        -- Remover registros órfãos
        DELETE FROM execution_steps 
        WHERE "executionId" IS NULL;
        
        RAISE NOTICE 'Registros órfãos removidos';
    ELSE
        RAISE NOTICE 'Nenhum registro órfão encontrado';
    END IF;
END $$;

-- 3. Verificar integridade dos dados
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Verificar se existem execution_steps sem execution correspondente
    SELECT COUNT(*) INTO orphan_count
    FROM execution_steps es
    LEFT JOIN executions e ON es."executionId" = e.id
    WHERE e.id IS NULL;
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Existem % execution_steps órfãos (sem execution correspondente)', orphan_count;
        
        -- Remover execution_steps órfãos
        DELETE FROM execution_steps 
        WHERE "executionId" NOT IN (SELECT id FROM executions);
        
        RAISE NOTICE 'Execution steps órfãos removidos';
    ELSE
        RAISE NOTICE 'Integridade dos dados verificada - nenhum execution_step órfão encontrado';
    END IF;
END $$;

COMMIT;
