-- Migração 038: Correção completa de nomenclatura camelCase para todas as tabelas do engine
-- Data: 2025-10-25
-- Problema: Múltiplas tabelas do engine usam snake_case mas TypeORM espera camelCase
-- Solução: Adiciona colunas camelCase para alerts, alert_history, alert_notifications, execution_metrics, etc.

BEGIN;

-- ============================================================================
-- TABELA: alerts
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
        ALTER TABLE alerts DISABLE TRIGGER ALL;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "workspaceId" uuid NOT NULL DEFAULT gen_random_uuid();
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workspaces') THEN
                ALTER TABLE alerts ADD CONSTRAINT "FK_alerts_workspaceId" 
                FOREIGN KEY ("workspaceId") REFERENCES workspaces(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- alertType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'alertType'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "alertType" character varying(50) NOT NULL DEFAULT 'custom';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        END IF;
        
        -- notificationChannels
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'notificationChannels'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "notificationChannels" jsonb;
        END IF;
        
        -- triggerCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'triggerCount'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "triggerCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- lastTriggered
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'lastTriggered'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "lastTriggered" timestamp with time zone;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alerts' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE alerts ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE alerts ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: alert_notifications
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_notifications') THEN
        ALTER TABLE alert_notifications DISABLE TRIGGER ALL;
        
        -- alertId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'alertId'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "alertId" uuid NOT NULL DEFAULT gen_random_uuid();
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
                ALTER TABLE alert_notifications ADD CONSTRAINT "FK_alert_notifications_alertId" 
                FOREIGN KEY ("alertId") REFERENCES alerts(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "workspaceId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- channelType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'channelType'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "channelType" character varying(50) NOT NULL DEFAULT 'email';
        END IF;
        
        -- channelConfig
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'channelConfig'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "channelConfig" text NOT NULL DEFAULT '{}';
        END IF;
        
        -- isActive
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'isActive'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
        END IF;
        
        -- sentCount
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'sentCount'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "sentCount" integer NOT NULL DEFAULT 0;
        END IF;
        
        -- lastSent
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'lastSent'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "lastSent" timestamp with time zone;
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- updatedAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_notifications' AND column_name = 'updatedAt'
        ) THEN
            ALTER TABLE alert_notifications ADD COLUMN "updatedAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE alert_notifications ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: alert_history
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alert_history') THEN
        ALTER TABLE alert_history DISABLE TRIGGER ALL;
        
        -- alertId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_history' AND column_name = 'alertId'
        ) THEN
            ALTER TABLE alert_history ADD COLUMN "alertId" uuid NOT NULL DEFAULT gen_random_uuid();
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'alerts') THEN
                ALTER TABLE alert_history ADD CONSTRAINT "FK_alert_history_alertId" 
                FOREIGN KEY ("alertId") REFERENCES alerts(id) ON DELETE CASCADE;
            END IF;
        END IF;
        
        -- triggeredAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_history' AND column_name = 'triggeredAt'
        ) THEN
            ALTER TABLE alert_history ADD COLUMN "triggeredAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        -- severity
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_history' AND column_name = 'severity'
        ) THEN
            ALTER TABLE alert_history ADD COLUMN "severity" character varying(20) NOT NULL DEFAULT 'info';
        END IF;
        
        -- message
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_history' AND column_name = 'message'
        ) THEN
            ALTER TABLE alert_history ADD COLUMN "message" text;
        END IF;
        
        -- contextData
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'alert_history' AND column_name = 'contextData'
        ) THEN
            ALTER TABLE alert_history ADD COLUMN "contextData" jsonb;
        END IF;
        
        ALTER TABLE alert_history ENABLE TRIGGER ALL;
    END IF;
END $$;

-- ============================================================================
-- TABELA: execution_metrics
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'execution_metrics') THEN
        ALTER TABLE execution_metrics DISABLE TRIGGER ALL;
        
        -- workspaceId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'workspaceId'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "workspaceId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- tenantId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'tenantId'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "tenantId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- workflowId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'workflowId'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "workflowId" uuid NOT NULL DEFAULT gen_random_uuid();
        END IF;
        
        -- runId
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'runId'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "runId" uuid;
        END IF;
        
        -- metricType
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'metricType'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "metricType" character varying(50) NOT NULL DEFAULT 'execution_time';
        END IF;
        
        -- createdAt
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'execution_metrics' AND column_name = 'createdAt'
        ) THEN
            ALTER TABLE execution_metrics ADD COLUMN "createdAt" timestamp with time zone NOT NULL DEFAULT NOW();
        END IF;
        
        ALTER TABLE execution_metrics ENABLE TRIGGER ALL;
    END IF;
END $$;

COMMIT;

-- Relatório
DO $$
DECLARE
    v_alerts INTEGER;
    v_notifications INTEGER;
    v_history INTEGER;
    v_metrics INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_alerts FROM alerts;
    SELECT COUNT(*) INTO v_notifications FROM alert_notifications;
    SELECT COUNT(*) INTO v_history FROM alert_history;
    SELECT COUNT(*) INTO v_metrics FROM execution_metrics;
    
    RAISE NOTICE 'Migração 038 concluída.';
    RAISE NOTICE '  - alerts: %', v_alerts;
    RAISE NOTICE '  - alert_notifications: %', v_notifications;
    RAISE NOTICE '  - alert_history: %', v_history;
    RAISE NOTICE '  - execution_metrics: %', v_metrics;
END $$;
