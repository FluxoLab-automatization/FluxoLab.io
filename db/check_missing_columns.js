const { Client } = require('pg');
require('dotenv').config();

const problematicTables = [
  'connector_versions',
  'connections',
  'oauth_tokens',
  'connection_secrets',
  'alerts',
  'execution_metrics',
  'templates',
  'template_versions',
  'template_params'
];

async function checkColumns() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    for (const tableName of problematicTables) {
      console.log(`\n📋 Colunas em: ${tableName}`);
      console.log('─'.repeat(60));

      const result = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

      result.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  - ${row.column_name} (${row.data_type}) ${nullable}`);
      });
    }

    await client.end();
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
}

checkColumns();
