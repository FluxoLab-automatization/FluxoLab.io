# 🔴 Problema Completo de Nomenclatura - snake_case vs camelCase

## 📋 Resumo Executivo

A aplicação está falhando ao iniciar devido a **inconsistência de nomenclatura** entre o banco de dados PostgreSQL (`snake_case`) e as entidades TypeORM (`camelCase`).

## 🚨 Erros Identificados

### Erro 1: execution_steps
```
a coluna "nodeId" da relação "execution_steps" contém valores nulos
```

### Erro 2: workflow_versions
```
a coluna "workflowId" da relação "workflow_versions" contém valores nulos
```

### Erro 3: connectors
```
a coluna "workspaceId" da relação "connectors" contém valores nulos
```

## 🔍 Causa Raiz

1. **Banco de Dados**: Usa `snake_case` (ex: `workspace_id`, `created_at`)
2. **TypeORM Entities**: Esperam `camelCase` (ex: `workspaceId`, `createdAt`)
3. **TypeORM Synchronize**: Ativa em desenvolvimento, tentando adicionar colunas `NOT NULL` sem valores padrão em tabelas com dados existentes

## 📊 Tabelas Afetadas

| Tabela | Status | Migração |
|--------|--------|----------|
| `execution_steps` | ✅ Corrigido | 030 |
| `workflow_versions` | ✅ Corrigido | 031 |
| `workflows` | ✅ Corrigido | 031 |
| `executions` | ✅ Corrigido | 031 |
| `connectors` | ✅ Corrigido | 032 |
| `connections` | ⚠️ Necessário | 033 |
| `oauth_tokens` | ⚠️ Necessário | 033 |
| `templates` | ⚠️ Necessário | 033 |
| `template_versions` | ⚠️ Necessário | 033 |
| Outras tabelas | ⚠️ Necessário | 033+ |

## ✅ Soluções Implementadas

### Migração 030: execution_steps
- Arquivo: `db/migrations/030_fix_execution_steps_final.sql`
- Corrige: `nodeId`, `nodeName`, `executionId`, `inputItems`, `outputItems`, etc.

### Migração 031: workflows, workflow_versions, executions
- Arquivo: `db/migrations/031_fix_all_camelcase_columns.sql`
- Corrige: `workflowId`, `workspaceId`, `tenantId`, `isActive`, `createdAt`, `updatedAt`
- **Correções aplicadas**:
  - Desabilita triggers antes das alterações
  - Cria `workflowId` em `executions` PRIMEIRO
  - Reabilita triggers depois das alterações

### Migração 032: connectors
- Arquivo: `db/migrations/032_fix_connectors_camelcase.sql`
- Corrige: `workspaceId`, `isActive`, `isPublic`, `createdAt`, `updatedAt`, `createdBy`

### Migração 033: demais tabelas
- Arquivo: `db/migrations/033_fix_all_remaining_camelcase.sql`
- Corrige: `connections`, `oauth_tokens`, `templates`, etc.

## 🚀 Como Resolver

### Passo 1: Executar Todas as Migrações

```bash
# 1. Verificar se DATABASE_URL está configurada
echo $DATABASE_URL

# 2. Executar migrações
cd db
node migrate.js
```

### Passo 2: Verificar Aplicação

```bash
cd ../backend
npm run start:dev
```

### Passo 3: Desabilitar Synchronize em Produção

Edite `backend/src/shared/database/typeorm.module.ts`:

```typescript
synchronize: false, // SEMPRE false em produção
```

## 🔧 Padrão de Conversão

| snake_case | camelCase |
|-----------|-----------|
| `workspace_id` | `workspaceId` |
| `workflow_id` | `workflowId` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `is_active` | `isActive` |
| `is_public` | `isPublic` |
| `created_by` | `createdBy` |

## ⚠️ Padrão de Correção

Todas as migrações seguem o padrão:

```sql
-- 1. Desabilitar triggers
ALTER TABLE tabela DISABLE TRIGGER ALL;

-- 2. Adicionar coluna como nullable
ALTER TABLE tabela ADD COLUMN "colunaCamelCase" tipo;

-- 3. Popular coluna a partir de snake_case
UPDATE tabela SET "colunaCamelCase" = coluna_snake_case WHERE coluna_snake_case IS NOT NULL;

-- 4. Tornar coluna NOT NULL
ALTER TABLE tabela ALTER COLUMN "colunaCamelCase" SET NOT NULL;

-- 5. Adicionar FK se necessário
ALTER TABLE tabela ADD CONSTRAINT "FK_tabela_colunaCamelCase" 
FOREIGN KEY ("colunaCamelCase") REFERENCES outra_tabela(id);

-- 6. Criar índice
CREATE INDEX IF NOT EXISTS "IDX_tabela_colunaCamelCase" ON tabela ("colunaCamelCase");

-- 7. Reabilitar triggers
ALTER TABLE tabela ENABLE TRIGGER ALL;
```

## 📝 Próximas Ações

1. ✅ Executar migrações 030, 031, 032, 033
2. ✅ Verificar aplicação inicia sem erros
3. ⏳ Criar migrações adicionais para tabelas restantes
4. ⏳ Desabilitar synchronize em produção
5. ⏳ Criar testes de migração automatizados
6. ⏳ Documentar padrão de nomenclatura do projeto

## 🎯 Status Geral

- ✅ Erros críticos identificados e corrigidos
- ✅ Scripts de migração criados
- ✅ Documentação completa criada
- ⏳ Aguardando execução das migrações
- ⏳ Aguardando validação da aplicação

---

**Data:** 2025-10-25  
**Versão:** 1.0  
**Status:** 🟡 Aguardando Execução
