-- Migration for Dashboard and Users functionality
-- This migration adds tables and columns needed for the new frontend features

-- Add trial and plan information to workspaces
ALTER TABLE workspaces 
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50) DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS executions_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS executions_used INTEGER DEFAULT 0;

-- Add preferences column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) DEFAULT '#a855f7';

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'POST',
    authentication VARCHAR(20) NOT NULL DEFAULT 'none',
    respond_mode VARCHAR(20) NOT NULL DEFAULT 'immediately',
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    token VARCHAR(64) NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    headers JSONB NOT NULL DEFAULT '{}',
    query JSONB NOT NULL DEFAULT '{}',
    payload JSONB NOT NULL DEFAULT '{}',
    response_status INTEGER NOT NULL,
    response_body JSONB NOT NULL DEFAULT '{}',
    execution_time INTEGER NOT NULL, -- in milliseconds
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_token ON webhooks(token);
CREATE INDEX IF NOT EXISTS idx_webhooks_workflow_id ON webhooks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Add execution statistics tracking
CREATE TABLE IF NOT EXISTS execution_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    executions_count INTEGER NOT NULL DEFAULT 0,
    successful_executions INTEGER NOT NULL DEFAULT 0,
    failed_executions INTEGER NOT NULL DEFAULT 0,
    avg_duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, workflow_id, date)
);

-- Create index for execution stats
CREATE INDEX IF NOT EXISTS idx_execution_stats_workspace_date ON execution_stats(workspace_id, date);
CREATE INDEX IF NOT EXISTS idx_execution_stats_workflow_date ON execution_stats(workflow_id, date);

-- Add node templates and categories tables
CREATE TABLE IF NOT EXISTS node_templates (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    inputs INTEGER NOT NULL DEFAULT 0,
    outputs INTEGER NOT NULL DEFAULT 0,
    config_schema JSONB NOT NULL DEFAULT '{}',
    default_config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS node_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert default node categories
INSERT INTO node_categories (id, name, description, icon, order_index) VALUES
('ai', 'AI', 'Build autonomous agents, summarize or search documents, etc.', 'ai', 1),
('action', 'Action in an app', 'Do something in an app or service like Google Sheets, Telegram or Notion', 'action', 2),
('data', 'Data transformation', 'Manipulate, filter or convert data', 'data', 3),
('flow', 'Flow', 'Branch, merge or loop the flow, etc.', 'flow', 4),
('core', 'Core', 'Run code, make HTTP requests, set webhooks, etc.', 'core', 5),
('human', 'Human in the loop', 'Wait for approval or human input before continuing', 'human', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert default node templates
INSERT INTO node_templates (id, name, description, category, icon, type, inputs, outputs, config_schema, default_config) VALUES
('ai-agent', 'AI Agent', 'Build autonomous agents, summarize or search documents, etc.', 'ai', 'ai', 'ai-agent', 1, 1, 
 '{"type":"object","properties":{"prompt":{"type":"string","title":"Prompt"},"model":{"type":"string","title":"Model"},"temperature":{"type":"number","title":"Temperature","minimum":0,"maximum":2},"maxTokens":{"type":"number","title":"Max Tokens"}},"required":["prompt"]}',
 '{"prompt":"","model":"gpt-3.5-turbo","temperature":0.7,"maxTokens":1000}'),
('http-request', 'HTTP Request', 'Make HTTP requests to external APIs', 'action', 'action', 'http-request', 1, 1,
 '{"type":"object","properties":{"url":{"type":"string","title":"URL"},"method":{"type":"string","title":"Method","enum":["GET","POST","PUT","DELETE","PATCH"]},"headers":{"type":"object","title":"Headers"},"body":{"type":"string","title":"Body"}},"required":["url","method"]}',
 '{"url":"","method":"GET","headers":{},"body":""}'),
('webhook', 'Webhook', 'Receive HTTP requests as workflow triggers', 'core', 'core', 'webhook', 0, 1,
 '{"type":"object","properties":{"path":{"type":"string","title":"Path"},"method":{"type":"string","title":"Method","enum":["GET","POST","PUT","DELETE","PATCH"]},"authentication":{"type":"string","title":"Authentication","enum":["none","basic","bearer","api-key"]},"respondMode":{"type":"string","title":"Respond Mode","enum":["immediately","when_complete","never"]}},"required":["path","method"]}',
 '{"path":"","method":"POST","authentication":"none","respondMode":"immediately"}')
ON CONFLICT (id) DO NOTHING;

-- Add workflow status tracking
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_executed_at TIMESTAMP NULL;

-- Create function to update execution stats
CREATE OR REPLACE FUNCTION update_execution_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workflow execution count
    UPDATE workflows 
    SET execution_count = execution_count + 1,
        last_executed_at = NEW.created_at
    WHERE id = NEW.workflow_id;
    
    -- Update daily execution stats
    INSERT INTO execution_stats (workspace_id, workflow_id, date, executions_count, successful_executions, failed_executions, avg_duration_ms)
    VALUES (
        NEW.workspace_id,
        NEW.workflow_id,
        NEW.created_at::date,
        1,
        CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
        CASE WHEN NEW.finished_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NEW.finished_at - NEW.created_at)) * 1000
        ELSE 0 END
    )
    ON CONFLICT (workspace_id, workflow_id, date) 
    DO UPDATE SET
        executions_count = execution_stats.executions_count + 1,
        successful_executions = execution_stats.successful_executions + 
            CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
        failed_executions = execution_stats.failed_executions + 
            CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
        avg_duration_ms = CASE WHEN NEW.finished_at IS NOT NULL THEN 
            (execution_stats.avg_duration_ms * execution_stats.executions_count + 
             EXTRACT(EPOCH FROM (NEW.finished_at - NEW.created_at)) * 1000) / 
            (execution_stats.executions_count + 1)
        ELSE execution_stats.avg_duration_ms END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for execution stats
DROP TRIGGER IF EXISTS trigger_update_execution_stats ON workflow_executions;
CREATE TRIGGER trigger_update_execution_stats
    AFTER INSERT ON workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_execution_stats();

-- Add some sample data for testing
UPDATE workspaces 
SET plan_name = 'trial', 
    trial_ends_at = NOW() + INTERVAL '5 days',
    executions_limit = 1000,
    executions_used = 6
WHERE id IN (SELECT id FROM workspaces LIMIT 1);

