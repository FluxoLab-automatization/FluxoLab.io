const fs = require('fs');
const { Client } = require('pg');
(async () => {
  const sql = fs.readFileSync('db/migrations/005_workflows.sql', 'utf8');
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const stmt of statements) {
      console.log('EXEC:', stmt.slice(0, 80));
      await client.query(stmt);
    }
  } catch (err) {
    console.error('Failed on statement:', err);
  } finally {
    await client.end();
  }
})();
