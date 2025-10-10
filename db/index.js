const { Pool } = require('pg');
const logger = require('../lib/logger');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  max: Number(process.env.PG_POOL_MAX || 10),
  ssl:
    process.env.PG_SSL === 'true'
      ? { rejectUnauthorized: false }
      : undefined,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected Postgres pool error');
});

async function shutdown() {
  logger.info('Shutting down Postgres pool');
  await pool.end();
}

module.exports = {
  pool,
  shutdown,
};
