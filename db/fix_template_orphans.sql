-- Script para limpar e resetar migração 039

BEGIN;

-- Remover entrada da migração 039
DELETE FROM schema_migrations WHERE filename = '039_fix_all_remaining_entities_camelcase.sql';

-- Remover registros órfãos de template_versions (usando coluna snake_case se existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'template_versions' AND column_name = 'template_id'
    ) THEN
        DELETE FROM template_versions 
        WHERE template_id IS NOT NULL 
          AND template_id NOT IN (SELECT id FROM templates);
    END IF;
END $$;

-- Remover colunas camelCase criadas anteriormente em template_params
ALTER TABLE template_params DROP COLUMN IF EXISTS "templateVersionId";
ALTER TABLE template_params DROP COLUMN IF EXISTS "isRequired";
ALTER TABLE template_params DROP COLUMN IF EXISTS "defaultValue";
ALTER TABLE template_params DROP COLUMN IF EXISTS "displayOrder";
ALTER TABLE template_params DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE template_params DROP COLUMN IF EXISTS "updatedAt";

-- Remover colunas camelCase criadas anteriormente em template_versions
ALTER TABLE template_versions DROP COLUMN IF EXISTS "templateId";
ALTER TABLE template_versions DROP COLUMN IF EXISTS "workflowData";
ALTER TABLE template_versions DROP COLUMN IF EXISTS "isActive";
ALTER TABLE template_versions DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE template_versions DROP COLUMN IF EXISTS "updatedAt";

COMMIT;

SELECT 'Migration 039 reset and orphan records cleaned' as status;
