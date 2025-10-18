const { Client } = require('pg');
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query('DROP TABLE IF EXISTS credentials CASCADE');
    await client.query(CREATE TABLE credentials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      data_encrypted BYTEA NOT NULL,
      data_iv BYTEA NOT NULL,
      key_id TEXT NOT NULL,
      created_by UUID REFERENCES users (id),
      updated_by UUID REFERENCES users (id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ,
      UNIQUE (workspace_id, name)
    ););
    await client.query('CREATE INDEX idx_credentials_workspace_test ON credentials (workspace_id, name)');
    console.log('Success');
  } catch (err) {
    console.error('Error', err);
  } finally {
    await client.end();
  }
})();
