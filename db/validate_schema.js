const { Client } = require('pg');
require('dotenv').config();

// Configuração das entidades e suas colunas esperadas
const entitiesConfig = {
  'execution_steps': ['nodeId', 'nodeName', 'nodeType', 'executionId', 'inputItems', 'outputItems', 'startedAt', 'finishedAt', 'errorMessage', 'metadata'],
  'workflow_versions': ['workflowId', 'isActive', 'nodes', 'edges', 'settings', 'metadata', 'version', 'createdAt', 'updatedAt'],
  'workflows': ['workspaceId', 'tenantId', 'isActive', 'isPublic', 'activeVersionId', 'tags', 'metadata', 'createdAt', 'updatedAt'],
  'executions': ['workflowId', 'workspaceId', 'tenantId', 'triggerData', 'correlationId', 'traceId', 'startedAt', 'finishedAt', 'errorMessage', 'result', 'createdAt', 'updatedAt'],
  'connectors': ['workspaceId', 'connectorType', 'category', 'iconUrl', 'documentationUrl', 'isActive', 'isPublic', 'createdBy', 'createdAt', 'updatedAt'],
  'connector_versions': ['connectorId', 'version', 'isActive', 'changelog', 'configSchema', 'authSchema'],
  'connector_actions': ['connectorId', 'actionName', 'actionType', 'description', 'inputSchema', 'outputSchema', 'isActive'],
  'connections': ['workspaceId', 'connectorId', 'connectionName', 'description', 'config', 'isActive', 'createdBy'],
  'oauth_tokens': ['connectionId', 'tokenType', 'accessToken', 'refreshToken', 'expiresAt', 'scope'],
  'connection_secrets': ['connectionId', 'secretKey', 'secretValue', 'isActive'],
  'circuit_breakers': ['workspaceId', 'tenantId', 'failureCount', 'failureThreshold', 'lastFailureTime', 'nextAttemptTime'],
  'distributed_locks': ['lockKey', 'lockedBy', 'lockedAt', 'expiresAt'],
  'compensation_actions': ['runId', 'stepId', 'actionType', 'actionData', 'executedAt', 'errorMessage'],
  'retry_queue': ['runId', 'stepId', 'retryCount', 'maxRetries', 'nextRetryAt', 'errorMessage', 'errorDetails'],
  'schedule_jobs': ['workspaceId', 'tenantId', 'workflowId', 'cronExpression', 'isActive', 'triggerData', 'lastExecution', 'nextExecution', 'executionCount', 'failureCount'],
  'execution_windows': ['workspaceId', 'tenantId', 'cronExpression', 'isActive', 'lastExecution', 'nextExecution'],
  'system_events': ['eventType', 'tenantId', 'workspaceId', 'runId', 'correlationId', 'traceId', 'spanId'],
  'idempotency_keys': ['tenantId', 'workspaceId', 'runId', 'expiresAt'],
  'alerts': ['workspaceId', 'tenantId', 'name', 'description', 'alertType', 'conditions', 'isActive', 'severity', 'notificationChannels', 'triggerCount', 'lastTriggered'],
  'alert_notifications': ['alertId', 'workspaceId', 'tenantId', 'channelType', 'channelConfig', 'isActive', 'sentCount', 'lastSent'],
  'alert_history': ['alertId', 'triggeredAt', 'severity', 'message', 'contextData'],
  'execution_metrics': ['workspaceId', 'tenantId', 'workflowId', 'runId', 'metricType', 'metricValue'],
  'templates': ['name', 'description', 'category', 'slug', 'isActive', 'isPublic', 'isFeatured', 'vertical', 'installCount', 'rating', 'metadata'],
  'template_versions': ['templateId', 'version', 'isActive', 'workflowData', 'changelog'],
  'template_params': ['templateVersionId', 'templateId', 'name', 'type', 'isRequired', 'defaultValue', 'description', 'displayOrder', 'validation'],
};

async function validateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao banco de dados\n');

    let totalErrors = 0;
    let totalTables = 0;
    let totalColumns = 0;

    for (const [tableName, expectedColumns] of Object.entries(entitiesConfig)) {
      console.log(`\n📋 Validando tabela: ${tableName}`);
      console.log('─'.repeat(60));

      // Verificar se a tabela existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);

      if (!tableExists.rows[0].exists) {
        console.log(`⚠️  TABELA NÃO EXISTE: ${tableName}`);
        totalErrors++;
        continue;
      }

      totalTables++;

      // Obter colunas existentes na tabela
      const existingColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

      const existingColumnNames = existingColumns.rows.map(row => row.column_name);

      // Verificar cada coluna esperada
      for (const expectedColumn of expectedColumns) {
        totalColumns++;
        const exists = existingColumnNames.includes(expectedColumn);
        
        if (!exists) {
          console.log(`❌ FALTANDO: ${expectedColumn}`);
          totalErrors++;
        }
      }

      console.log(`✅ Tabela validada: ${expectedColumns.length} colunas esperadas, ${existingColumnNames.length} colunas existentes`);
    }

    // Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de tabelas validadas: ${totalTables}`);
    console.log(`Total de colunas verificadas: ${totalColumns}`);
    console.log(`Total de erros encontrados: ${totalErrors}`);
    
    if (totalErrors === 0) {
      console.log('\n✅ SUCESSO: Todas as colunas estão presentes!');
    } else {
      console.log(`\n⚠️  ATENÇÃO: Encontrados ${totalErrors} colunas faltantes`);
    }

    console.log('='.repeat(60));

    await client.end();
    
    // Retornar código de saída
    process.exit(totalErrors > 0 ? 1 : 0);
  } catch (err) {
    console.error('❌ Erro ao validar schema:', err);
    process.exit(1);
  }
}

validateSchema();
