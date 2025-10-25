# 🔧 Resolução do Erro: Coluna version em workflow_versions

## 📋 Problema

**Erro**: `QueryFailedError: a coluna "version" da relação "workflow_versions" contém valores nulos`

### Descrição
- A coluna `version` na tabela `workflow_versions` continha valores NULL
- TypeORM tentava adicionar a constraint NOT NULL mas falhava
- O TypeORM `synchronize: true` tentava modificar a estrutura da tabela

## 🔍 Causa Raiz

### Inconsistência de Tipo de Dados
A tabela `workflow_versions` tinha **duas definições diferentes** para a coluna `version`:

1. **Migração 005** (original): `version integer NOT NULL`
2. **Migração 037**: `version character varying` com valores padrão

### Problema Principal
- TypeORM entity esperava: `version: string`
- Banco de dados tinha: `version: integer`
- Migração 037 tentou converter mas não completou corretamente
- Resultado: valores NULL foram introduzidos

## ✅ Solução Implementada

### Migração 044: Correção Completa da Coluna version

A migração 044 realiza as seguintes operações:

1. **Verifica o tipo atual** da coluna `version`
2. **Converte de INTEGER para VARCHAR** se necessário
3. **Atualiza valores NULL** para '1.0.0'
4. **Define NOT NULL** constraint
5. **Adiciona DEFAULT** '1.0.0'

### Código SQL da Solução

```sql
-- Verificar e converter tipo se necessário
IF v_data_type = 'integer' THEN
    ALTER TABLE workflow_versions 
    ALTER COLUMN version TYPE character varying 
    USING version::text;
END IF;

-- Atualizar valores NULL
UPDATE workflow_versions 
SET version = '1.0.0' 
WHERE version IS NULL;

-- Tornar NOT NULL
ALTER TABLE workflow_versions 
ALTER COLUMN version SET NOT NULL;

-- Adicionar DEFAULT
ALTER TABLE workflow_versions 
ALTER COLUMN version SET DEFAULT '1.0.0';
```

## 📊 Resultado

### Antes
```sql
-- Estado da tabela workflow_versions
version: integer | NULL valores
```

### Depois
```sql
-- Estado da tabela workflow_versions
version: character varying | NOT NULL | DEFAULT '1.0.0'
```

## 🔧 Comandos Executados

1. **Remover entrada da migração 044** (para re-execução):
```bash
node db/remove_044.js
```

2. **Aplicar migração 044 corrigida**:
```bash
cd db
node migrate.js
```

## ✅ Verificação

A migração foi aplicada com sucesso:
- ✅ Tipo de dados convertido: INTEGER → VARCHAR
- ✅ Valores NULL atualizados para '1.0.0'
- ✅ Constraint NOT NULL adicionada
- ✅ DEFAULT adicionado

## 📝 Arquivos Modificados

- `db/migrations/044_fix_workflow_versions_version_null.sql` - Migração corrigida
- `db/remove_044.js` - Script para remover entrada de re-execução

## 🎯 Status Final

- ✅ **Erro resolvido**: Coluna version agora é VARCHAR com NOT NULL
- ✅ **Dados preservados**: Todos os valores foram convertidos corretamente
- ✅ **Aplicação funcionando**: Sem erros de banco de dados

## 📚 Lições Aprendidas

1. **Verificar tipos de dados** antes de criar migrações
2. **Converter tipos** quando há inconsistências entre entidade e banco
3. **Testar conversões** com valores NULL antes de aplicar constraints
4. **Desabilitar synchronize** em produção para evitar conflitos

---

**Data**: 2025-10-25  
**Status**: ✅ Resolvido
