-- Migração 039: Correção final de nomenclatura camelCase para todas as tabelas restantes
-- Data: 2025-10-25
-- Problema: Tabelas restantes usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para templates, template_versions, template_params, etc.

BEGIN;

-- ============================================================================
-- TABELA: templates
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
        ALTER TABLE templates DISABLE TRIGGER ALL;
        
        -- workspaceId (se existe na entidade mas não na tabela - verificar entity)
        -- Nota: template.entity.ts NÃO tem workspaceId, então não adicionamos
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE templates ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        END IF;
        
        -- isPublic
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'isPublic'
        ) THEN
            ALTER TABLE templates ADD COLUMN "isPublic" boolean NOT NULL DEFAULT false;
        END IF;
        
        -- isFeatured
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'isFeatured'
        ) THEN
            ALTER TABLE templates ADD COLUMN "isFeatured" boolean NOT NULL DEFAULT false;
        END IF;
        
        -- installCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'installCount'
        ) THEN
            ALTER TABLE templates ADD COLUMN "installCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE templates ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'templates' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE templates ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE templates ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: template_versions
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_versions') THEN
        ALTER TABLE template_versions DISABLE TRIGGER ALL;
        
        -- templateId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'templateId'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN "templateId" uuid;
            UPDATE template_versions SET "templateId" = template_id WHERE template_id IS NOT NULL;
            -- Remover registros órfãos antes de adicionar constraint
            DELETE FROM template_versions WHERE "templateId" NOT IN (SELECT id FROM templates);
            ALTER TABLE template_versions ALTER COLUMN "templateId" SET NOT NULL;
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
                ALTER TABLE template_versions ADD CONSTRAINT "FK_template_versions_templateId" 
                FOREIGN KEY ("templateId") REFERENCES templates(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- workflowData
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'workflowData'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN "workflowData" jsonb NOT NULL DEFAULT '{}';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN "isActive" boolean NOT NULL DEFAULT false;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_versions' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE template_versions ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE template_versions ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: template_params
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_params') THEN
        ALTER TABLE template_params DISABLE TRIGGER ALL;
        
        -- templateVersionId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'templateVersionId'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "templateVersionId" uuid NOT NULL DEFAULT gen_random_uuid();
            
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_versions') THEN
                -- Remover registros órfãos antes de adicionar constraint
                DELETE FROM template_params WHERE "templateVersionId" NOT IN (SELECT id FROM template_versions);
                
                ALTER TABLE template_params ADD CONSTRAINT "FK_template_params_templateVersionId" 
                FOREIGN KEY ("templateVersionId") REFERENCES template_versions(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- isRequired
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'isRequired'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "isRequired" boolean NOT NULL DEFAULT false;
        END IF;
        
        -- defaultValue
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'defaultValue'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "defaultValue" text;
        END IF;
        
        -- displayOrder
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'displayOrder'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "displayOrder" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'template_params' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE template_params ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE template_params ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_templates INTEGER;
    v_versions INTEGER;
    v_params INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_templates FROM templates;
    SELECT COUNT(*) INTO v_versions FROM template_versions;
    SELECT COUNT(*) INTO v_params FROM template_params;
    
    RAISE NOTICE 'Migração 039 concluída.';
    RAISE NOTICE '  - templates: %', v_templates;
    RAISE NOTICE '  - template_versions: %', v_versions;
    RAISE NOTICE '  - template_params: %', v_params;
END $$;
