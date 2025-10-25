-- ============================================================================
-- Script de Validação Completa da Migração 030
-- ============================================================================

\echo '========================================'
\echo 'VALIDAÇÃO DA MIGRAÇÃO 030'
\echo '========================================'
\echo ''

-- 1. Verificar se a tabela existe
\echo '1. Verificando se a tabela execution_steps existe...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'execution_steps'
        ) THEN '✓ Tabela execution_steps existe'
        ELSE '✗ Tabela execution_steps NÃO existe'
    END as table_status;
\echo ''

-- 2. Verificar colunas criadas
\echo '2. Verificando colunas criadas...'
SELECT 
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeId') > 0 THEN '✓ nodeId existe'
        ELSE '✗ nodeId NÃO existe'
    END as nodeId_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeName') > 0 THEN '✓ nodeName existe'
        ELSE '✗ nodeName NÃO existe'
    END as nodeName_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeType') > 0 THEN '✓ nodeType existe'
        ELSE '✗ nodeType NÃO existe'
    END as nodeType_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'metadata') > 0 THEN '✓ metadata existe'
        ELSE '✗ metadata NÃO existe'
    END as metadata_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'executionId') > 0 THEN '✓ executionId existe'
        ELSE '✗ executionId NÃO existe'
    END as executionId_status
FROM information_schema.columns
WHERE table_name = 'execution_steps';
\echo ''

-- 3. Verificar estrutura completa
\echo '3. Estrutura completa da tabela:'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'execution_steps'
ORDER BY ordinal_position;
\echo ''

-- 4. Verificar valores nulos
\echo '4. Verificando valores nulos...'
SELECT 
    COUNT(*) FILTER (WHERE "nodeId" IS NULL) as null_nodeId,
    COUNT(*) FILTER (WHERE "nodeName" IS NULL) as null_nodeName,
    COUNT(*) FILTER (WHERE "nodeType" IS NULL) as null_nodeType,
    COUNT(*) FILTER (WHERE "executionId" IS NULL) as null_executionId,
    COUNT(*) as total_records
FROM execution_steps;
\echo ''

-- 5. Verificar constraints
\echo '5. Verificando constraints...'
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'execution_steps'
ORDER BY tc.constraint_type, tc.constraint_name;
\echo ''

-- 6. Verificar índices
\echo '6. Verificando índices...'
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'execution_steps'
ORDER BY indexname;
\echo ''

-- 7. Verificar foreign keys
\echo '7. Verificando foreign keys...'
SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'execution_steps';
\echo ''

-- 8. Verificar integridade dos dados (registros órfãos)
\echo '8. Verificando integridade dos dados...'
SELECT 
    COUNT(*) FILTER (
        WHERE "executionId" NOT IN (SELECT id FROM executions)
    ) as orphan_executions,
    COUNT(*) as total_steps
FROM execution_steps;
\echo ''

-- 9. Verificar tipo de dados das colunas principais
\echo '9. Verificando tipos de dados...'
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'execution_steps'
  AND column_name IN ('nodeId', 'nodeName', 'nodeType', 'executionId', 'metadata')
ORDER BY column_name;
\echo ''

-- 10. Resumo final
\echo '========================================'
\echo 'RESUMO DA VALIDAÇÃO'
\echo '========================================'
SELECT 
    'Total de registros' as metric,
    COUNT(*)::text as value
FROM execution_steps
UNION ALL
SELECT 
    'Colunas criadas',
    COUNT(*)::text
FROM information_schema.columns
WHERE table_name = 'execution_steps'
UNION ALL
SELECT 
    'Índices criados',
    COUNT(*)::text
FROM pg_indexes
WHERE tablename = 'execution_steps'
UNION ALL
SELECT 
    'Foreign keys',
    COUNT(*)::text
FROM information_schema.table_constraints
WHERE table_name = 'execution_steps'
  AND constraint_type = 'FOREIGN KEY';
\echo ''

-- 11. Verificar se a migração 030 foi executada
\echo 'Verificando se a migração 030 foi registrada...'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM schema_migrations 
            WHERE filename = '030_fix_execution_steps_final.sql'
        ) THEN '✓ Migração 030 registrada em ' || 
               (SELECT TO_CHAR(executed_at, 'DD/MM/YYYY HH24:MI:SS') 
                FROM schema_migrations 
                WHERE filename = '030_fix_execution_steps_final.sql')
        ELSE '✗ Migração 030 NÃO foi registrada'
    END as migration_status;
\echo ''

\echo '========================================'
\echo 'VALIDAÇÃO CONCLUÍDA'
\echo '========================================'
