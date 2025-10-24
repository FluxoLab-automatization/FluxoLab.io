-- Migration: Add workflow_credentials table
-- Description: Creates the workflow_credentials table for storing workflow credential information

-- Create workflow_credentials table
CREATE TABLE IF NOT EXISTS workflow_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    secret JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Ensure unique credential names per workspace
    UNIQUE(workspace_id, name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workflow_credentials_workspace_id ON workflow_credentials(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_credentials_type ON workflow_credentials(type);
CREATE INDEX IF NOT EXISTS idx_workflow_credentials_created_by ON workflow_credentials(created_by);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_workflow_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_credentials_updated_at
    BEFORE UPDATE ON workflow_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_credentials_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE workflow_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see credentials from their workspace
CREATE POLICY workflow_credentials_workspace_policy ON workflow_credentials
    FOR ALL
    USING (
        workspace_id IN (
            SELECT w.id 
            FROM workspaces w 
            JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: Users can only insert credentials in their workspace
CREATE POLICY workflow_credentials_insert_policy ON workflow_credentials
    FOR INSERT
    WITH CHECK (
        workspace_id IN (
            SELECT w.id 
            FROM workspaces w 
            JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: Users can only update credentials in their workspace
CREATE POLICY workflow_credentials_update_policy ON workflow_credentials
    FOR UPDATE
    USING (
        workspace_id IN (
            SELECT w.id 
            FROM workspaces w 
            JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = current_setting('app.current_user_id')::UUID
        )
    );

-- Policy: Users can only delete credentials in their workspace
CREATE POLICY workflow_credentials_delete_policy ON workflow_credentials
    FOR DELETE
    USING (
        workspace_id IN (
            SELECT w.id 
            FROM workspaces w 
            JOIN workspace_members wm ON w.id = wm.workspace_id 
            WHERE wm.user_id = current_setting('app.current_user_id')::UUID
        )
    );


