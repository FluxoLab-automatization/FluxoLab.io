-- Script para verificar colunas da tabela template_params

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'template_params'
ORDER BY ordinal_position;
