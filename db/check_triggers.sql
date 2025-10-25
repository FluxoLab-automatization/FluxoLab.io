-- Script para verificar e desabilitar/remover triggers problemáticos

-- 1. Ver todos os triggers na tabela workflows
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workflows'
ORDER BY trigger_name;

-- 2. Ver todas as conexões ativas na tabela workflows
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE datname = current_database()
  AND state != 'idle';

-- 3. Desabilitar temporariamente todos os triggers (se necessário)
-- ALTER TABLE workflows DISABLE TRIGGER ALL;

-- 4. Reabilitar após a migração
-- ALTER TABLE workflows ENABLE TRIGGER ALL;
