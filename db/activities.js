const { pool } = require('./index');

async function listRecentByUser(userId, { limit = 10 } = {}) {
  const result = await pool.query(
    `
      SELECT id,
             entity_type,
             entity_id,
             action,
             payload,
             created_at
      FROM activities
      WHERE user_id = $1
         OR (user_id IS NULL AND entity_type = 'system')
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [userId, limit]
  );
  return result.rows;
}

module.exports = {
  listRecentByUser,
};
