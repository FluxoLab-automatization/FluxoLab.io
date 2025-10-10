const { pool } = require('./index');

async function findByEmail(email) {
  const result = await pool.query(
    `
      SELECT id,
             email,
             display_name,
             password_hash,
             avatar_color,
             created_at,
             updated_at,
             last_login_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email.toLowerCase()]
  );

  return result.rows[0] || null;
}

async function touchLastLogin(id) {
  await pool.query(
    `
      UPDATE users
      SET last_login_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

async function createUser({
  email,
  passwordHash,
  displayName,
  avatarColor,
}) {
  const result = await pool.query(
    `
      INSERT INTO users (email, password_hash, display_name, avatar_color)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, display_name, avatar_color, created_at
    `,
    [email.toLowerCase(), passwordHash, displayName, avatarColor]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    `
      SELECT id,
             email,
             display_name,
             avatar_color,
             created_at,
             updated_at,
             last_login_at
      FROM users
      WHERE id = $1
    `,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  touchLastLogin,
  createUser,
};
