#!/usr/bin/env node
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { pool } = require('./index');
const logger = require('../lib/logger');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function detectHasOwnTransaction(sql) {
  // Heurística simples: se o arquivo contém BEGIN/COMMIT em linhas próprias,
  // assumimos que ele controla a transação.
  const hasBegin = /^\s*BEGIN\s*;/mi.test(sql);
  const hasCommit = /^\s*COMMIT\s*;/mi.test(sql);
  return hasBegin && hasCommit;
}

function readMigrationsList(migrationsDir, onlyFiles = []) {
  let files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (onlyFiles.length) {
    const only = new Set(onlyFiles);
    files = files.filter((f) => only.has(f));
  }
  return files;
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const onlyArgs = process.argv.slice(2).filter((a) => a.endsWith('.sql'));
  const files = readMigrationsList(migrationsDir, onlyArgs);

  const client = await pool.connect();
  try {
    // Evita dois processos aplicando migrations ao mesmo tempo
    await client.query('SELECT pg_advisory_lock($1)', [88123456]);

    await ensureMigrationsTable(client);

    for (const file of files) {
      const alreadyApplied = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file]
      );
      if (alreadyApplied.rowCount) {
        logger.info({ file }, 'Skipping migration (already applied)');
        continue;
      }

      const fullpath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullpath, 'utf8');

      // Garante schema esperado nesta sessão
      await client.query(`SET search_path TO public, "$user"`);

      logger.info({ file }, 'Applying migration');

      const controlsTx = detectHasOwnTransaction(sql);

      try {
        if (!controlsTx) {
          // Envolve o arquivo numa transação nossa
          await client.query('BEGIN');
          await client.query(sql);
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
        } else {
          // Deixa o arquivo controlar seu BEGIN/COMMIT
          await client.query(sql);
          await client.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)',
            [file]
          );
        }
        logger.info({ file }, 'Applied migration');
      } catch (err) {
        // Se falhou e estávamos numa transação nossa, faz rollback
        try {
          await client.query('ROLLBACK');
        } catch (_) {}
        // Mostra um trecho do SQL perto da posição (se vier)
        const pos = Number(err.position || 0);
        const context =
          pos > 0 ? sql.substring(Math.max(0, pos - 120), pos + 120) : '';
        logger.error({ file, err, context }, 'Migration failed at file');
        process.exitCode = 1;
        // sai no primeiro erro
        return;
      }
    }

    logger.info('Database migrations completed');
  } catch (err) {
    logger.error({ err }, 'Migration runner failed');
    process.exitCode = 1;
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock($1)', [88123456]);
    } catch (_) {}
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  logger.error({ err }, 'Migration runner failed (outer)');
  process.exit(1);
});
