-- Remover entrada da migração 044 para permitir re-execução
DELETE FROM schema_migrations WHERE filename = '044_fix_workflow_versions_version_null.sql';

SELECT 'Migration 044 removed from schema_migrations' as status;
