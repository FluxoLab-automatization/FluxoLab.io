const { pool } = require('./index');

async function createRegistration({ userId, tokenHash }) {
  const result = await pool.query(
    `
      INSERT INTO webhook_registrations (user_id, token_hash)
      VALUES ($1, $2)
      ON CONFLICT (token_hash) DO NOTHING
      RETURNING id, user_id, status, created_at
    `,
    [userId, tokenHash]
  );

  if (!result.rowCount) {
    throw new Error('Token hash already exists');
  }

  return result.rows[0];
}

async function findActiveRegistrationByTokenHash(tokenHash) {
  const result = await pool.query(
    `
      SELECT id, user_id, status, created_at, verified_at, last_used_at
      FROM webhook_registrations
      WHERE token_hash = $1 AND status = 'active'
    `,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function markRegistrationVerified(id) {
  await pool.query(
    `
      UPDATE webhook_registrations
      SET verified_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

async function updateLastUsedAt(id) {
  await pool.query(
    `
      UPDATE webhook_registrations
      SET last_used_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

async function recordEvent({
  registrationId,
  eventType,
  payload,
  headers,
  signatureValid,
  status,
  errorMessage,
}) {
  const result = await pool.query(
    `
      INSERT INTO webhook_events
        (registration_id, event_type, payload, headers, signature_valid, status, error_message)
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7)
      RETURNING id, received_at, status
    `,
    [
      registrationId,
      eventType,
      payload ? JSON.stringify(payload) : null,
      headers ? JSON.stringify(headers) : null,
      signatureValid,
      status,
      errorMessage || null,
    ]
  );
  return result.rows[0];
}

async function countRegistrations() {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM webhook_registrations
    `
  );
  return result.rows[0]?.total || 0;
}

async function countEvents() {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM webhook_events
    `
  );
  return result.rows[0]?.total || 0;
}

async function listRecentEvents({ limit = 5 } = {}) {
  const result = await pool.query(
    `
      SELECT id,
             event_type,
             status,
             signature_valid,
             received_at
      FROM webhook_events
      ORDER BY received_at DESC
      LIMIT $1
    `,
    [limit]
  );
  return result.rows;
}

async function healthCheck() {
  await pool.query('SELECT 1');
}

module.exports = {
  createRegistration,
  findActiveRegistrationByTokenHash,
  markRegistrationVerified,
  recordEvent,
  countRegistrations,
  countEvents,
  listRecentEvents,
  updateLastUsedAt,
  healthCheck,
};
