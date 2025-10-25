# 🔧 Correção Completa de Nomenclatura de Banco de Dados

## 🚨 PROBLEMAS IDENTIFICADOS

### Erro 1: execution_steps
```
a coluna "nodeId" da relação "execution_steps" contém valores nulos
```

### Erro 2: workflow_versions
```
a coluna "workflowId" da relação "workflow_versions" contém valores nulos
```

## 🔍 CAUSA RAIZ

**Inconsistência de Nomenclatura:**
- Banco de dados usa: `snake_case` (ex: `workflow_id`, `node_id`)
- TypeORM espera: `camelCase` (ex: `workflowId`, `nodeId`)

## ✅ SOLUÇÕES IMPLEMENTADAS

### Migração 030: Fix execution_steps
**Arquivo:** `db/migrations/030_fix_execution_steps_final.sql`

**Corrige:**
- `nodeId` (de `node_id`)
- `nodeName` (de `node_name`)
- `nodeType` (nova coluna)
- `executionId` (de `execution_id`)
- `inputItems` (de `input_items`)
- `outputItems` (de `output_items`)
- `startedAt` (de `started_at`)
- `finishedAt` (de `finished_at`)
- `errorMessage` (extrai de `error`)
- `metadata` (nova coluna)

### Migração 031: Fix todas as tabelas
**Arquivo:** `db/migrations/031_fix_all_camelcase_columns.sql`

**Corrige 3 tabelas:**

#### 1. workflow_versions
- `workflowId` (de `workflow_id`)
- `isActive`
- `nodes`
- `edges`
- `settings`
- `metadata`
- `createdAt` (de `created_at`)
- `updatedAt` (de `updated_at`)

#### 2. workflows
- `workspaceId` (de `workspace_id`)
- `tenantId`
- `isActive`
- `isPublic`
- `activeVersionId` (de `active_version_id`)
- `tags`
- `metadata`
- `createdAt` (de `created_at`)
- `updatedAt` (de `updated_at`)

#### 3. executions
- `workspaceId` (de `workspace_id`)
- `tenantId`
- `triggerData`
- `correlationId`
- `traceId`
- `startedAt` (de `started_at`)
- `finishedAt` (de `finished_at`)
- `errorMessage` (extrai de `error`)
- `result`
- `createdAt` (de `created_at`)
- `updatedAt` (de `updated_at`)

## 🚀 COMO EXECUTAR

### Opção 1: Via script de migração (recomendado)

```bash
# Verificar se DATABASE_URL está configurada
echo $DATABASE_URL

# Se não estiver, configurar
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/fluxolab"

# Executar migrações
cd db
node migrate.js
```

### Opção 2: Via psql diretamente

```bash
# Conectar ao banco
psql -h localhost -U seu_usuario -d fluxolab

# Executar migrações
\i db/migrations/030_fix_execution_steps_final.sql
\i db/migrations/031_fix_all_camelcase_columns.sql
```

### Opção 3: Executar migração específica

```bash
cd db
node migrate.js 030_fix_execution_steps_final.sql
node migrate.js 031_fix_all_camelcase_columns.sql
```

## 📊 VERIFICAÇÃO

### Verificar se as migrações foram executadas

```sql
SELECT * FROM schema_migrations 
WHERE filename IN (
    '030_fix_execution_steps_final.sql',
    '031_fix_all_camelcase_columns.sql'
)
ORDER BY executed_at DESC;
```

### Verificar colunas criadas

```sql
-- workflow_versions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workflow_versions' 
  AND column_name IN ('workflowId', 'nodes', 'edges', 'settings', 'metadata')
ORDER BY column_name;

-- workflows
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workflows' 
  AND column_name IN ('workspaceId', 'tenantId', 'activeVersionId')
ORDER BY column_name;

-- executions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'executions' 
  AND column_name IN ('workspaceId', 'tenantId', 'triggerData')
ORDER BY column_name;
```

## 🔄 PRÓXIMAS AÇÕES

### Imediato
1. ✅ Executar migrações 030 e 031
2. ✅ Verificar se não há erros
3. ✅ Reiniciar aplicação

### Curto Prazo
- 🔄 Desabilitar `synchronize` em produção
- 🔄 Criar padrão de nomenclatura para o projeto
- 🔄 Adicionar validações de migração

### Médio Prazo
- 📝 Configurar naming strategy no TypeORM
- 📝 Criar testes de migração automatizados
- 📝 Documentar padrão de criação de entidades

### Longo Prazo
- 📝 Migrar todas as tabelas para snake_case
- 📝 OU migrar todas para camelCase
- 📝 Automatizar validação de consistência

## ⚠️ IMPORTANTE

### ⚠️ Desabilitar Synchronize em Produção

Edite `backend/src/shared/database/typeorm.module.ts`:

```typescript
synchronize: false, // SEMPRE false em produção
```

### ⚠️ Backup Antes de Executar

```bash
pg_dump -h localhost -U seu_usuario -d fluxolab > backup_$(date +%Y%m%d).sql
```

## 🎯 TABELAS AFETADAS

| Tabela | Colunas Corrigidas | Status |
|--------|-------------------|---------|
| `execution_steps` | 10 colunas | ✅ Migração 030 |
| `workflow_versions` | 8 colunas | ✅ Migração 031 |
| `workflows` | 9 colunas | ✅ Migração 031 |
| `executions` | 11 colunas | ✅ Migração 031 |

## 📝 CHECKLIST DE VALIDAÇÃO

- [ ] Migração 030 executada sem erros
- [ ] Migração 031 executada sem erros
- [ ] Todas as colunas camelCase criadas
- [ ] Dados migrados corretamente
- [ ] Sem registros órfãos
- [ ] Índices criados
- [ ] Foreign keys criadas
- [ ] Aplicação inicia sem erros

---

**Criado em:** 2025-10-25  
**Versão:** 1.0  
**Status:** ⚠️ Requer execução manual (DATABASE_URL não configurada)
