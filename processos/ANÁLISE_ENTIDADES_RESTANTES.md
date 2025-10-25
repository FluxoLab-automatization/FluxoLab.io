# 🔍 Análise das Entidades Restantes - Migrações Futuras

## 📋 Resumo

Este documento detalha as **8 entidades TypeORM** do módulo `engine` que ainda precisam de migrações para correção de nomenclatura `snake_case` vs `camelCase`.

## 🎯 Entidades Analisadas

### 1. CircuitBreaker (`circuit_breakers`)

**Colunas que precisam de migração:**
- ✅ `workspaceId` → snake_case: `workspace_id`
- ✅ `tenantId` → snake_case: `tenant_id`
- ✅ `failureCount` → snake_case: `failure_count`
- ✅ `failureThreshold` → snake_case: `failure_threshold`
- ✅ `lastFailureTime` → snake_case: `last_failure_at` (nome diferente!)
- ✅ `nextAttemptTime` → snake_case: N/A (pode não existir)
- ✅ `createdAt` → snake_case: `created_at`
- ✅ `updatedAt` → snake_case: `updated_at`

**Observações:**
- Nome da entidade: `CircuitBreaker`
- Tabela: `circuit_breakers`
- Criada em: `019_core_engine_system.sql`
- Estado atual: `state` já está em snake_case correto

### 2. CompensationAction (`compensation_actions`)

**Colunas que precisam de migração:**
- ✅ `runId` → snake_case: `run_id`
- ✅ `stepId` → snake_case: `step_id`
- ✅ `actionType` → snake_case: `action_type`
- ✅ `actionData` → snake_case: `action_config` (JSONB na migração original)
- ✅ `executedAt` → snake_case: `executed_at`
- ✅ `errorMessage` → snake_case: `error_message`
- ✅ `createdAt` → snake_case: `created_at`
- ✅ `updatedAt` → snake_case: N/A (pode não ter na tabela)

**Observações:**
- Nome da entidade: `CompensationAction`
- Tabela: `compensation_actions`
- Criada em: `019_core_engine_system.sql`
- Campo `actionData` na entidade é `action_config` no banco (JSONB)

### 3. IdempotencyKey (`idempotency_keys`)

**Colunas que precisam de migração:**
- ✅ `tenantId` → snake_case: `tenant_id`
- ✅ `workspaceId` → snake_case: `workspace_id`
- ✅ `runId` → snake_case: `run_id`
- ✅ `expiresAt` → snake_case: `expires_at`
- ✅ `created_at` → já está snake_case (não precisa mudar)

**Observações:**
- Nome da entidade: `IdempotencyKey`
- Tabela: `idempotency_keys`
- Criada em: `019_core_engine_system.sql`
- Tem constraint UNIQUE em `(tenantId, workspaceId, scope, key)`

### 4. RetryQueue (`retry_queue`)

**Colunas que precisam de migração:**
- ✅ `runId` → snake_case: `run_id`
- ✅ `stepId` → snake_case: `step_id`
- ✅ `retryCount` → snake_case: `retry_count`
- ✅ `maxRetries` → snake_case: `max_retries`
- ✅ `nextRetryAt` → snake_case: `next_retry_at`
- ✅ `errorMessage` → snake_case: `error_message`
- ✅ `errorDetails` → snake_case: `error_details`
- ✅ `created_at` → já está snake_case (não precisa mudar)

**Observações:**
- Nome da entidade: `RetryQueue`
- Tabela: `retry_queue`
- Criada em: `019_core_engine_system.sql`
- Tem índices em `nextRetryAt` e `runId`

### 5. ScheduleJob (`schedule_jobs`)

**Colunas que precisam de migração:**
- ✅ `workspaceId` → snake_case: `workspace_id`
- ✅ `tenantId` → snake_case: `tenant_id`
- ✅ `workflowId` → snake_case: `workflow_id`
- ✅ `cronExpression` → snake_case: `cron_expression`
- ✅ `isActive` → snake_case: `is_active`
- ✅ `triggerData` → snake_case: `trigger_data`
- ✅ `lastExecution` → snake_case: `last_execution`
- ✅ `nextExecution` → snake_case: `next_execution`
- ✅ `executionCount` → snake_case: `execution_count`
- ✅ `failureCount` → snake_case: `failure_count`
- ✅ `createdAt` → snake_case: `created_at`
- ✅ `updatedAt` → snake_case: `updated_at`

**Observações:**
- Nome da entidade: `ScheduleJob`
- Tabela: `schedule_jobs`
- Criada em: migração específica (verificar qual)

### 6. SystemEvent (`system_events`)

**Colunas que precisam de migração:**
- ✅ `eventType` → snake_case: `event_type`
- ✅ `tenantId` → snake_case: `tenant_id`
- ✅ `workspaceId` → snake_case: `workspace_id`
- ✅ `runId` → snake_case: `run_id`
- ✅ `correlationId` → snake_case: `correlation_id`
- ✅ `traceId` → snake_case: `trace_id`
- ✅ `spanId` → snake_case: `span_id`
- ✅ `created_at` → já está snake_case (não precisa mudar)

**Observações:**
- Nome da entidade: `SystemEvent`
- Tabela: `system_events`
- Criada em: migração específica (verificar qual)
- Tem múltiplos índices

### 7. ExecutionWindow (`execution_windows`)

**Colunas que precisam de migração:**
- ✅ `workspaceId` → snake_case: `workspace_id`
- ✅ `tenantId` → snake_case: `tenant_id`
- ✅ `cronExpression` → snake_case: `cron_expression`
- ✅ `isActive` → snake_case: `is_active`
- ✅ `lastExecution` → snake_case: `last_execution`
- ✅ `nextExecution` → snake_case: `next_execution`
- ✅ `createdAt` → snake_case: `created_at`
- ✅ `updatedAt` → snake_case: `updated_at`

**Observações:**
- Nome da entidade: `ExecutionWindow`
- Tabela: `execution_windows`
- Criada em: `019_core_engine_system.sql`

### 8. DistributedLock (`distributed_locks`)

**Colunas que precisam de migração:**
- ✅ `lockKey` → snake_case: `lock_key`
- ✅ `lockedBy` → snake_case: `locked_by`
- ✅ `lockedAt` → snake_case: `locked_at`
- ✅ `expiresAt` → snake_case: `expires_at`

**Observações:**
- Nome da entidade: `DistributedLock`
- Tabela: `distributed_locks`
- Criada em: `019_core_engine_system.sql`
- Tem índice em `expiresAt` e constraint UNIQUE em `lockKey`
- NÃO tem `created_at` na entidade (diferente das outras)

## 📊 Resumo de Colunas por Entidade

| Entidade | Colunas a Migrar | FK Necessárias | Status |
|----------|-----------------|----------------|--------|
| CircuitBreaker | 8 | `workspaceId` | ⏳ |
| CompensationAction | 8 | `runId` | ⏳ |
| IdempotencyKey | 5 | `runId` (opcional) | ⏳ |
| RetryQueue | 8 | `runId` | ⏳ |
| ScheduleJob | 12 | `workspaceId`, `workflowId` | ⏳ |
| SystemEvent | 8 | N/A | ⏳ |
| ExecutionWindow | 8 | `workspaceId` | ⏳ |
| DistributedLock | 4 | N/A | ⏳ |

**Total de colunas**: 61 colunas a migrar

## 🎯 Próximas Migrações Necessárias

### Migração 040: CircuitBreaker e DistributedLock
**Tabelas:** `circuit_breakers`, `distributed_locks`
**Colunas:** 12 total (8 + 4)
**Complexidade:** Baixa (poucas FKs)

### Migração 041: CompensationAction e RetryQueue
**Tabelas:** `compensation_actions`, `retry_queue`
**Colunas:** 16 total (8 + 8)
**Complexidade:** Média (FK em `runId`)

### Migração 042: ScheduleJob e ExecutionWindow
**Tabelas:** `schedule_jobs`, `execution_windows`
**Colunas:** 20 total (12 + 8)
**Complexidade:** Média (FK em `workspaceId`, `workflowId`)

### Migração 043: SystemEvent e IdempotencyKey
**Tabelas:** `system_events`, `idempotency_keys`
**Colunas:** 13 total (8 + 5)
**Complexidade:** Alta (múltiplos índices e constraints UNIQUE)

## 📝 Padrão de Migração

Cada migração deve seguir o padrão estabelecido:

```sql
-- 1. Desabilitar triggers
ALTER TABLE tabela DISABLE TRIGGER ALL;

-- 2. Adicionar coluna como nullable
ALTER TABLE tabela ADD COLUMN "colunaCamelCase" tipo;

-- 3. Popular a partir de snake_case
UPDATE tabela SET "colunaCamelCase" = coluna_snake_case WHERE coluna_snake_case IS NOT NULL;

-- 4. Tornar NOT NULL (se necessário)
ALTER TABLE tabela ALTER COLUMN "colunaCamelCase" SET NOT NULL;

-- 5. Adicionar FK (se necessário)
ALTER TABLE tabela ADD CONSTRAINT "FK_nome" FOREIGN KEY ("colunaCamelCase") REFERENCES outra_tabela(id);

-- 6. Criar índice
CREATE INDEX IF NOT EXISTS "IDX_nome" ON tabela ("colunaCamelCase");

-- 7. Reabilitar triggers
ALTER TABLE tabela ENABLE TRIGGER ALL;
```

## 🚨 Atenção Especial

### SystemEvent
- Tem múltiplos índices que precisam ser recriados
- Campo `payload` é JSONB
- Campo `checksum` é VARCHAR(64)

### IdempotencyKey
- Tem constraint UNIQUE em 4 colunas
- Precisa verificar se FK em `runId` é necessária

### RetryQueue
- Tem índices em `nextRetryAt` e `runId`
- Campo `errorDetails` é JSONB

### CompensationAction
- `actionData` na entidade é `action_config` no banco (JSONB)

## ✅ Status Atual

- **Migrações completadas**: 14 (030-043) ✅
- **Migrações necessárias**: 0
- **Total de entidades migradas**: 27/27 (100%) 🎉
- **Total de entidades pendentes**: 0/27

## 🎯 Status Final

✅ **TODAS AS ENTIDADES FORAM MIGRADAS COM SUCESSO!**

- ✅ Migração 040: circuit_breakers, distributed_locks - CONCLUÍDA
- ✅ Migração 041: compensation_actions, retry_queue - CONCLUÍDA
- ✅ Migração 042: schedule_jobs, execution_windows - CONCLUÍDA
- ✅ Migração 043: system_events, idempotency_keys - CONCLUÍDA

**Projeto 100% corrigido e pronto para uso!** 🎉

---

**Data:** 2025-10-25  
**Versão:** 1.0  
**Status:** ✅ Completo - Todas as Migrações Concluídas
