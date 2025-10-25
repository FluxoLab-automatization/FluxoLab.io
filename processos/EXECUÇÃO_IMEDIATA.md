# ⚡ EXECUÇÃO IMEDIATA - Correção de Nomenclatura

## 🚨 PROBLEMA ATUAL

Aplicação não inicia devido a erros de nomenclatura:
- ❌ `execution_steps`: coluna "nodeId" contém valores nulos
- ❌ `workflow_versions`: coluna "workflowId" contém valores nulos

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Configurar DATABASE_URL

**Opção A: Usar .env**
```bash
# Verificar se .env existe
cat .env

# Se DATABASE_URL não estiver configurada, adicionar:
echo 'DATABASE_URL="postgresql://usuario:senha@localhost:5432/fluxolab"' >> .env
```

**Opção B: Exportar variável temporariamente**
```bash
export DATABASE_URL="postgresql://fluxolab:senha@localhost:5432/fluxolab"
```

### Passo 2: Fazer Backup (IMPORTANTE!)

```bash
# Windows PowerShell
pg_dump -h localhost -U seu_usuario -d fluxolab > backup_antes_migracoes.sql

# Linux/Mac
pg_dump -h localhost -U seu_usuario -d fluxolab > backup_antes_migracoes_$(date +%Y%m%d_%H%M%S).sql
```

### Passo 3: Executar Migrações

```bash
# Navegar para a pasta db
cd db

# Executar migrações
node migrate.js
```

### Passo 4: Verificar Se Funcionou

```bash
# Conectar ao PostgreSQL
psql -h localhost -U seu_usuario -d fluxolab

# Verificar se as colunas foram criadas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'execution_steps' 
  AND column_name IN ('nodeId', 'nodeName', 'executionId')
ORDER BY column_name;

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'workflow_versions' 
  AND column_name IN ('workflowId', 'nodes', 'edges')
ORDER BY column_name;
```

### Passo 5: Reiniciar Aplicação

```bash
cd ../backend
npm run start:dev
```

## 🔧 ALTERNATIVA: Executar via psql

Se o Node.js não funcionar, execute diretamente:

```bash
# Conectar ao banco
psql -h localhost -U seu_usuario -d fluxolab

# Executar migrações
\i db/migrations/030_fix_execution_steps_final.sql
\i db/migrations/031_fix_all_camelcase_columns.sql
```

## 🚨 EM CASO DE ERRO

### Erro: "DATABASE_URL not found"

```bash
# Verificar variável de ambiente
echo $DATABASE_URL

# Windows PowerShell
$env:DATABASE_URL

# Configurar manualmente
export DATABASE_URL="postgresql://usuario:senha@localhost:5432/fluxolab"
```

### Erro: "relation does not exist"

Execute as migrações anteriores primeiro:
```bash
cd db
node migrate.js
```

### Erro: "permission denied"

Conceda permissões ao usuário:
```sql
GRANT ALL PRIVILEGES ON DATABASE fluxolab TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
```

### Erro: "trigger events pending" (ERRADO 55006)

Este erro ocorre quando há triggers pendentes na tabela. A migração 031 corrigida desabilita os triggers automaticamente.

**Se ainda ocorrer, execute manualmente:**

```sql
-- 1. Desabilitar triggers
ALTER TABLE workflows DISABLE TRIGGER ALL;
ALTER TABLE workflow_versions DISABLE TRIGGER ALL;
ALTER TABLE executions DISABLE TRIGGER ALL;

-- 2. Executar migração manualmente
\i db/migrations/031_fix_all_camelcase_columns.sql

-- 3. Reabilitar triggers
ALTER TABLE workflows ENABLE TRIGGER ALL;
ALTER TABLE workflow_versions ENABLE TRIGGER ALL;
ALTER TABLE executions ENABLE TRIGGER ALL;
```

**Ou resetar a migração:**

```bash
# 1. Remover entrada da migração 031
psql -h localhost -U usuario -d fluxolab -c "DELETE FROM schema_migrations WHERE filename = '031_fix_all_camelcase_columns.sql';"

# 2. Re-executar
cd db
node migrate.js
```

## ✅ VALIDAÇÃO FINAL

Após executar as migrações, verifique:

1. ✅ Aplicação inicia sem erros
2. ✅ Sem mensagens de "valores nulos"
3. ✅ TypeORM conecta ao banco
4. ✅ Endpoints respondem corretamente

## 📞 SE AINDA HOUVER PROBLEMAS

1. Verifique logs do PostgreSQL
2. Verifique logs da aplicação
3. Execute script de validação: `db/validate_migration.sql`
4. Consulte documentação em `processos/`

---

**Tempo estimado:** 5-10 minutos  
**Risco:** Baixo (se backup foi feito)  
**Reversibilidade:** Sim (via backup)
