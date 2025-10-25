const { Client } = require('pg');
require('dotenv').config();

async function removeMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    await client.query(`DELETE FROM schema_migrations WHERE filename = '044_fix_workflow_versions_version_null.sql'`);
    console.log('Migration 044 removed from schema_migrations');
    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

removeMigration();
