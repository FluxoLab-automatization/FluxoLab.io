-- Script para resetar e re-executar a migração 039
DELETE FROM schema_migrations WHERE filename = '039_fix_all_remaining_entities_camelcase.sql';

-- Executar a migração novamente
\i migrations/039_fix_all_remaining_entities_camelcase.sql
