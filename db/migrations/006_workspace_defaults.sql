ALTER TABLE users
  ADD COLUMN IF NOT EXISTS default_workspace_id UUID REFERENCES workspaces (id);

CREATE INDEX IF NOT EXISTS idx_users_default_workspace
  ON users (default_workspace_id);

WITH ranked_members AS (
  SELECT
    wm.user_id,
    wm.workspace_id,
    ROW_NUMBER() OVER (PARTITION BY wm.user_id ORDER BY wm.created_at ASC) AS rn
  FROM workspace_members wm
  WHERE wm.status = 'active'
),
ranked_owner AS (
  SELECT
    w.owner_id AS user_id,
    w.id AS workspace_id,
    ROW_NUMBER() OVER (PARTITION BY w.owner_id ORDER BY w.created_at ASC) AS rn
  FROM workspaces w
)
UPDATE users u
SET default_workspace_id = rm.workspace_id
FROM ranked_members rm
WHERE u.default_workspace_id IS NULL
  AND rm.user_id = u.id
  AND rm.rn = 1;

UPDATE users u
SET default_workspace_id = ro.workspace_id
FROM ranked_owner ro
WHERE u.default_workspace_id IS NULL
  AND ro.user_id = u.id
  AND ro.rn = 1;

