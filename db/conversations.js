const { pool } = require('./index');

async function listRecentByOwner(ownerId, { limit = 6 } = {}) {
  const result = await pool.query(
    `
      SELECT id,
             title,
             status,
             metadata,
             created_at,
             updated_at
      FROM conversations
      WHERE owner_id = $1
      ORDER BY updated_at DESC
      LIMIT $2
    `,
    [ownerId, limit]
  );
  return result.rows;
}

async function countByOwner(ownerId) {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM conversations
      WHERE owner_id = $1
    `,
    [ownerId]
  );
  return result.rows[0]?.total || 0;
}

module.exports = {
  listRecentByOwner,
  countByOwner,
};
