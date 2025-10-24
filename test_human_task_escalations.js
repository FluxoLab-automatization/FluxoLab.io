const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testHumanTaskEscalations() {
  try {
    console.log('Tentando criar tabela human_task_escalations...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS human_task_escalations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL REFERENCES human_tasks(id) ON DELETE CASCADE,
          escalation_level INTEGER NOT NULL DEFAULT 1,
          escalated_to UUID REFERENCES users(id),
          escalated_to_name TEXT,
          escalation_reason TEXT,
          escalated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          resolved_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('Tabela human_task_escalations criada com sucesso!');
    
    // Verificar se foi criada
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'human_task_escalations'");
    console.log('Tabela human_task_escalations existe:', result.rows.length > 0);
    
  } catch (error) {
    console.error('Erro ao criar tabela human_task_escalations:', error.message);
  } finally {
    await pool.end();
  }
}

testHumanTaskEscalations();
