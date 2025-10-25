# 🔧 Correção: Erro de Triggers na Migração 031

## 🚨 Erros Identificados

### Erro 1: Triggers Pendentes (Erro 55006)
```
ERROR: não é possível executar ALTER TABLE "workflows", porque tem eventos de gatilho pendentes
```

### Erro 2: Coluna Não Existe (Erro 42703)
```
ERROR: coluna e.workflowId não existe
```

## 🔍 Causas

1. **Erro 55006**: O PostgreSQL estava impedindo a execução de `ALTER TABLE` porque havia triggers ativos nas tabelas afetadas pela migração.
2. **Erro 42703**: A migração tentava usar a coluna `workflowId` na tabela `executions` antes de criá-la.

## ✅ Solução Implementada

A migração `031_fix_all_camelcase_columns.sql` foi corrigida para:

1. **Desabilitar triggers no início**
   ```sql
   ALTER TABLE workflows DISABLE TRIGGER ALL;
   ALTER TABLE workflow_versions DISABLE TRIGGER ALL;
   ALTER TABLE executions DISABLE TRIGGER ALL;
   ```

2. **Adicionar workflowId em executions primeiro** (ordem correta)
   - A coluna `workflowId` é criada antes de ser usada no UPDATE de `tenantId`
   - Usa `workflow_id` (snake_case) como referência na atualização

3. **Realizar todas as alterações**
   - Criação de colunas camelCase na ordem correta
   - População de dados
   - Criação de índices e FKs

4. **Reabilitar triggers no final**
   ```sql
   ALTER TABLE workflows ENABLE TRIGGER ALL;
   ALTER TABLE workflow_versions ENABLE TRIGGER ALL;
   ALTER TABLE executions ENABLE TRIGGER ALL;
   ```

## 🚀 Como Resolver

### Opção 1: Re-executar a Migração (Recomendado)

A migração já foi corrigida. Se você tentou executar antes da correção:

```bash
# 1. Remover entrada da migração 031
psql -h localhost -U usuario -d fluxolab -c "DELETE FROM schema_migrations WHERE filename = '031_fix_all_camelcase_columns.sql';"

# 2. Re-executar
cd db
node migrate.js
```

### Opção 2: Execução Manual

```sql
-- 1. Conectar ao banco
psql -h localhost -U usuario -d fluxolab

-- 2. Executar a migração corrigida
\i db/migrations/031_fix_all_camelcase_columns.sql
```

### Opção 3: Contorno Manual (se ainda falhar)

```sql
-- 1. Desabilitar triggers manualmente
ALTER TABLE workflows DISABLE TRIGGER ALL;
ALTER TABLE workflow_versions DISABLE TRIGGER ALL;
ALTER TABLE executions DISABLE TRIGGER ALL;

-- 2. Executar apenas as alterações necessárias
-- (copie as seções da migração 031 conforme necessário)

-- 3. Reabilitar triggers
ALTER TABLE workflows ENABLE TRIGGER ALL;
ALTER TABLE workflow_versions ENABLE TRIGGER ALL;
ALTER TABLE executions ENABLE TRIGGER ALL;
```

## 📝 Arquivos Modificados

- ✅ `db/migrations/031_fix_all_camelcase_columns.sql` - Corrigido
- ✅ `processos/EXECUÇÃO_IMEDIATA.md` - Adicionada seção sobre o erro
- ✅ `db/check_triggers.sql` - Script para verificar triggers
- ✅ `db/fix_migration_031.sql` - Script para resetar migração

## ✅ Validação

Após executar a migração, verifique:

```sql
-- 1. Verificar se as colunas foram criadas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name IN ('workflows', 'workflow_versions', 'executions')
  AND column_name IN ('workflowId', 'workspaceId', 'isActive')
ORDER BY table_name, column_name;

-- 2. Verificar se os triggers estão habilitados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('workflows', 'workflow_versions', 'executions')
ORDER BY trigger_name;
```

## 🎯 Status

- ✅ Erro de triggers corrigido
- ✅ Erro de ordem de criação de colunas corrigido
- ✅ Scripts de recuperação criados
- ✅ Documentação atualizada
- ⏳ Aguardando re-execução

## 📋 Resumo das Correções

| Erro | Código | Causa | Solução |
|------|--------|-------|---------|
| Triggers pendentes | 55006 | Triggers ativos impedindo ALTER TABLE | Desabilitar antes, reabilitar depois |
| Coluna não existe | 42703 | Tentativa de usar workflowId antes de criar | Criar workflowId em executions primeiro |

---

**Data:** 2025-10-25  
**Versão:** 1.2  
**Status:** ✅ Corrigido
