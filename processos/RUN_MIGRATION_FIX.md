# 🚀 Guia de Execução da Correção de Migrações

## ⚠️ IMPORTANTE: Faça Backup Antes!

```bash
# Fazer backup do banco de dados
pg_dump -h localhost -U seu_usuario -d fluxolab > backup_antes_migracao_$(date +%Y%m%d_%H%M%S).sql
```

## 📋 Pré-requisitos

- PostgreSQL rodando
- Acesso ao banco de dados
- Credenciais configuradas no `.env`

## 🔧 Opção 1: Executar Apenas a Migração 030 (Recomendado)

### Passo 1: Executar a migração

```bash
cd db
node migrate.js 030_fix_execution_steps_final.sql
```

### Passo 2: Verificar se funcionou

```bash
# Conectar ao PostgreSQL
psql -h localhost -U seu_usuario -d fluxolab

# Executar verificação
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'execution_steps' 
ORDER BY column_name;

# Deve mostrar as colunas:
# - executionId (NOT NULL)
# - nodeId (NOT NULL)
# - nodeName (NOT NULL)
# - nodeType (NOT NULL, default 'unknown')
# - metadata (nullable)
# - ... (outras colunas)
```

### Passo 3: Testar a aplicação

```bash
cd backend
npm run start:dev
```

## 🔧 Opção 2: Executar Todas as Migrações Pendentes

```bash
cd db
node migrate.js
```

## 🔧 Opção 3: Executar Manualmente via psql

```bash
# Conectar ao PostgreSQL
psql -h localhost -U seu_usuario -d fluxolab

# Executar a migração
\i db/migrations/030_fix_execution_steps_final.sql
```

## 🔧 Opção 4: Desabilitar Sincronização Automática (Temporário)

Se precisar de uma solução temporária enquanto não executa a migração:

### Editar `backend/src/shared/database/typeorm.module.ts`

```typescript
synchronize: false, // Forçar usar migrations manuais
```

## ✅ Verificações Pós-Migração

### 1. Verificar estrutura da tabela

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'execution_steps'
ORDER BY ordinal_position;
```

### 2. Verificar se há registros órfãos

```sql
SELECT COUNT(*) 
FROM execution_steps
WHERE "nodeId" IS NULL 
   OR "nodeName" IS NULL 
   OR "executionId" IS NULL;
-- Deve retornar 0
```

### 3. Verificar índices

```sql
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'execution_steps';
```

### 4. Verificar constraints

```sql
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'execution_steps';
```

## 🐛 Troubleshooting

### Erro: "coluna nodeId já existe"

A migração foi executada anteriormente. Verifique se está tudo certo:

```sql
SELECT COUNT(*) 
FROM execution_steps
WHERE "nodeId" IS NULL;

-- Se retornar > 0, execute manualmente:
UPDATE execution_steps 
SET "nodeId" = node_id 
WHERE "nodeId" IS NULL AND node_id IS NOT NULL;

ALTER TABLE execution_steps ALTER COLUMN "nodeId" SET NOT NULL;
```

### Erro: "relação execution_steps não existe"

A tabela ainda não foi criada. Execute primeiro as migrações anteriores:

```bash
cd db
node migrate.js
```

### Erro: "permission denied"

Verifique permissões do usuário:

```sql
GRANT ALL PRIVILEGES ON DATABASE fluxolab TO seu_usuario;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO seu_usuario;
```

## 📊 Script de Validação Completa

Crie um arquivo `validate_migration.sql`:

```sql
-- Validação completa da migração 030

-- 1. Verificar colunas criadas
SELECT 
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeId') > 0 THEN '✓ nodeId existe'
        ELSE '✗ nodeId NÃO existe'
    END as nodeId_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeName') > 0 THEN '✓ nodeName existe'
        ELSE '✗ nodeName NÃO existe'
    END as nodeName_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'nodeType') > 0 THEN '✓ nodeType existe'
        ELSE '✗ nodeType NÃO existe'
    END as nodeType_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'metadata') > 0 THEN '✓ metadata existe'
        ELSE '✗ metadata NÃO existe'
    END as metadata_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'executionId') > 0 THEN '✓ executionId existe'
        ELSE '✗ executionId NÃO existe'
    END as executionId_status
FROM information_schema.columns
WHERE table_name = 'execution_steps';

-- 2. Verificar valores nulos
SELECT 
    COUNT(*) FILTER (WHERE "nodeId" IS NULL) as null_nodeId,
    COUNT(*) FILTER (WHERE "nodeName" IS NULL) as null_nodeName,
    COUNT(*) FILTER (WHERE "nodeType" IS NULL) as null_nodeType,
    COUNT(*) FILTER (WHERE "executionId" IS NULL) as null_executionId,
    COUNT(*) as total_records
FROM execution_steps;

-- 3. Verificar constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'execution_steps'
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK');
```

Execute:

```bash
psql -h localhost -U seu_usuario -d fluxolab -f validate_migration.sql
```

## 🎯 Próximos Passos Após Correção

1. ✅ Testar a aplicação completamente
2. ✅ Verificar logs por erros
3. ✅ Testar criação de workflow
4. ✅ Testar execução de workflow
5. ✅ Verificar dados de execution_steps no banco

## 📞 Suporte

Se houver problemas, verifique:
- Logs do PostgreSQL
- Logs da aplicação backend
- Tabela de migrações executadas: `SELECT * FROM schema_migrations ORDER BY executed_at DESC;`
