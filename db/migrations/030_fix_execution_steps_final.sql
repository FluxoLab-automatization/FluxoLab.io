-- Migração 030: Correção final da tabela execution_steps
-- Data: 2025-10-25
-- Problema: Coluna nodeId sendo adicionada como NOT NULL em tabela com dados existentes
-- Solução: Remover registros órfãos, adicionar colunas como nullable, popular e tornar NOT NULL

BEGIN;

-- ============================================================================
-- PARTE 1: LIMPEZA DE REGISTROS ÓRFÃOS
-- ============================================================================

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    -- Contar registros que não têm node_id válido
    SELECT COUNT(*) INTO orphan_count
    FROM execution_steps
    WHERE node_id IS NULL OR node_id = '';
    
    IF orphan_count > 0 THEN
        RAISE WARNING 'Existem % registros com node_id inválido. Removendo...', orphan_count;
        
        DELETE FROM execution_steps
        WHERE node_id IS NULL OR node_id = '';
        
        RAISE NOTICE 'Registros órfãos removidos: %', orphan_count;
    ELSE
        RAISE NOTICE 'Nenhum registro órfão encontrado';
    END IF;
END $$;

-- ============================================================================
-- PARTE 2: CRIAR COLUNA nodeId (se não existir)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeId'
    ) THEN
        -- Adicionar coluna como nullable
        ALTER TABLE execution_steps ADD COLUMN "nodeId" character varying;
        
        -- Copiar dados de node_id
        UPDATE execution_steps 
        SET "nodeId" = node_id 
        WHERE node_id IS NOT NULL;
        
        -- Tornar NOT NULL
        ALTER TABLE execution_steps ALTER COLUMN "nodeId" SET NOT NULL;
        
        RAISE NOTICE 'Coluna nodeId criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna nodeId já existe';
        
        -- Se existe mas tem valores nulos, populá-la
        UPDATE execution_steps 
        SET "nodeId" = node_id 
        WHERE "nodeId" IS NULL AND node_id IS NOT NULL;
        
        -- Tentar tornar NOT NULL se não houver valores nulos
        BEGIN
            ALTER TABLE execution_steps ALTER COLUMN "nodeId" SET NOT NULL;
            RAISE NOTICE 'Constraint NOT NULL aplicada em nodeId';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Não foi possível tornar nodeId NOT NULL: %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================================================
-- PARTE 3: CRIAR COLUNA nodeName (se não existir)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeName'
    ) THEN
        -- Adicionar coluna como nullable
        ALTER TABLE execution_steps ADD COLUMN "nodeName" character varying;
        
        -- Copiar dados de node_name
        UPDATE execution_steps 
        SET "nodeName" = node_name 
        WHERE node_name IS NOT NULL;
        
        -- Tornar NOT NULL
        ALTER TABLE execution_steps ALTER COLUMN "nodeName" SET NOT NULL;
        
        RAISE NOTICE 'Coluna nodeName criada e populada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna nodeName já existe';
        
        -- Se existe mas tem valores nulos, populá-la
        UPDATE execution_steps 
        SET "nodeName" = node_name 
        WHERE "nodeName" IS NULL AND node_name IS NOT NULL;
        
        -- Tentar tornar NOT NULL
        BEGIN
            ALTER TABLE execution_steps ALTER COLUMN "nodeName" SET NOT NULL;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING 'Não foi possível tornar nodeName NOT NULL: %', SQLERRM;
        END;
    END IF;
END $$;

-- ============================================================================
-- PARTE 4: CRIAR COLUNA nodeType (se não existir)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'nodeType'
    ) THEN
        -- Criar com valor padrão 'unknown'
        ALTER TABLE execution_steps 
        ADD COLUMN "nodeType" character varying NOT NULL DEFAULT 'unknown';
        
        RAISE NOTICE 'Coluna nodeType criada com valor padrão';
    ELSE
        RAISE NOTICE 'Coluna nodeType já existe';
        
        -- Se tem valores nulos, preencher com default
        UPDATE execution_steps 
        SET "nodeType" = 'unknown'
        WHERE "nodeType" IS NULL;
    END IF;
END $$;

-- ============================================================================
-- PARTE 5: CRIAR COLUNA metadata (se não existir)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE execution_steps 
        ADD COLUMN "metadata" jsonb;
        
        RAISE NOTICE 'Coluna metadata criada';
    ELSE
        RAISE NOTICE 'Coluna metadata já existe';
    END IF;
END $$;

-- ============================================================================
-- PARTE 6: CRIAR/VERIFICAR executionId
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'execution_steps' 
        AND column_name = 'executionId'
    ) THEN
        -- Adicionar coluna como nullable
        ALTER TABLE execution_steps ADD COLUMN "executionId" uuid;
        
        -- Copiar dados
        UPDATE execution_steps 
        SET "executionId" = execution_id 
        WHERE execution_id IS NOT NULL;
        
        -- Tornar NOT NULL
        ALTER TABLE execution_steps ALTER COLUMN "executionId" SET NOT NULL;
        
        -- Adicionar FK
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'FK_execution_steps_executionId'
        ) THEN
            ALTER TABLE execution_steps 
            ADD CONSTRAINT "FK_execution_steps_executionId" 
            FOREIGN KEY ("executionId") REFERENCES executions(id) ON DELETE CASCADE;
        END IF;
        
        RAISE NOTICE 'Coluna executionId criada';
    END IF;
END $$;

-- ============================================================================
-- PARTE 7: CRIAR/ATUALIZAR ÍNDICES
-- ============================================================================

-- Índice em executionId
CREATE INDEX IF NOT EXISTS "IDX_execution_steps_executionId" 
ON execution_steps ("executionId");

-- Índice em nodeId
CREATE INDEX IF NOT EXISTS "IDX_execution_steps_nodeId" 
ON execution_steps ("nodeId");

-- Índice em status
CREATE INDEX IF NOT EXISTS "IDX_execution_steps_status" 
ON execution_steps ("status");

-- ============================================================================
-- PARTE 8: VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
    null_nodeId INTEGER;
    null_nodeName INTEGER;
    null_executionId INTEGER;
BEGIN
    -- Verificar se ainda há valores nulos
    SELECT COUNT(*) INTO null_nodeId
    FROM execution_steps
    WHERE "nodeId" IS NULL;
    
    SELECT COUNT(*) INTO null_nodeName
    FROM execution_steps
    WHERE "nodeName" IS NULL;
    
    SELECT COUNT(*) INTO null_executionId
    FROM execution_steps
    WHERE "executionId" IS NULL;
    
    IF null_nodeId > 0 OR null_nodeName > 0 OR null_executionId > 0 THEN
        RAISE WARNING 'Ainda existem valores nulos - nodeId: %, nodeName: %, executionId: %', 
                      null_nodeId, null_nodeName, null_executionId;
        
        -- Remover registros órfãos finais
        DELETE FROM execution_steps
        WHERE "nodeId" IS NULL OR "nodeName" IS NULL OR "executionId" IS NULL;
        
        RAISE NOTICE 'Registros órfãos finais removidos';
    ELSE
        RAISE NOTICE 'Validação final OK - não há valores nulos';
    END IF;
END $$;

COMMIT;

-- ============================================================================
-- RELATÓRIO FINAL
-- ============================================================================

DO $$
DECLARE
    total_steps INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_steps FROM execution_steps;
    RAISE NOTICE 'Migração 030 concluída. Total de registros em execution_steps: %', total_steps;
END $$;
