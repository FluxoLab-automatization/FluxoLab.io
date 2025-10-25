-- Script para resetar e re-executar a migração 031
-- Use este script se a migração falhou parcialmente

-- 1. Remover a entrada da migração 031 (se existir)
DELETE FROM schema_migrations 
WHERE filename = '031_fix_all_camelcase_columns.sql';

-- 2. Verificar se há algum dado parcial/corrompido
SELECT 
    'workflow_versions' as tabela,
    COUNT(*) as total,
    COUNT("workflowId") as com_workflowId,
    COUNT(workflow_id) as com_workflow_id
FROM workflow_versions
UNION ALL
SELECT 
    'workflows' as tabela,
    COUNT(*) as total,
    COUNT("workspaceId") as com_workspaceId,
    COUNT(workspace_id) as com_workspace_id
FROM workflows
UNION ALL
SELECT 
    'executions' as tabela,
    COUNT(*) as total,
    COUNT("workflowId") as com_workflowId,
    COUNT(workflow_id) as com_workflow_id
FROM executions;

-- 3. Observação: Não remova colunas que já foram criadas
-- A migração 031 é idempotente e verifica IF NOT EXISTS
