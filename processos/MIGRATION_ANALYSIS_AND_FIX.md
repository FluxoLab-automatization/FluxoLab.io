# Análise Completa de Migrações - FluxoLab

## 🚨 PROBLEMA IDENTIFICADO

**Erro:** `a coluna "nodeId" da relação "execution_steps" contém valores nulos`

**Causa raiz:** 
- TypeORM está tentando adicionar a coluna `nodeId` com NOT NULL em uma tabela que já possui dados
- A migração 029 (que corrigiria isso) provavelmente não foi executada
- Há discrepância entre nomenclatura snake_case (BD) e camelCase (TypeORM)

## 📊 MAPEAMENTO DE MIGRAÇÕES

### Migrações Existentes (29 arquivos)

#### Grupo 1: Inicialização (001-004)
- `001_init.sql` - Schema básico
- `002_fluxolab_core.sql` - Core do FluxoLab
- `003_business_core.sql` - Business core
- `004_settings_layer.sql` - Camada de configurações

#### Grupo 2: Workflows e Execuções (005-011)
- `005_workflows.sql` - **Tabela execution_steps criada aqui com snake_case**
- `006_workspace_defaults.sql`
- `007_credentials_bootstrap.sql`
- `008_webhooks_activities_alignment.sql`
- `009_activity_backfill.sql`
- `010_settings_audit_alerts.sql`
- `011_leads_and_workflows.sql`

#### Grupo 3: Features Avançadas (012-020)
- `012_variables_and_tags.sql`
- `013_ai_chat_system.sql`
- `014_support_system.sql`
- `015_project_sharing.sql`
- `016_br_compliance_and_tenancy.sql`
- `017_connectors_and_templates.sql`
- `018_ai_guardrails_and_billing.sql`
- `019_core_engine_system.sql`
- `020_evidence_and_audit_system.sql`

#### Grupo 4: Correções Nomeação (021-029)
- `021_human_tasks_and_approvals.sql`
- `022_usage_billing_system.sql`
- `023_br_connectors_system.sql`
- `024_vertical_templates_system.sql`
- `025_ai_guardrails_system.sql`
- `026_advanced_observability_system.sql`
- `027_password_reset_system.sql`
- `028_fix_execution_steps_execution_id.sql` - **Corrige executionId**
- `029_fix_execution_steps_camelcase_columns.sql` - **Corrige nodeId e demais**

## 🔍 ANÁLISE DETALHADA

### Estrutura Atual da Tabela execution_steps

**Criada em 005_workflows.sql (snake_case):**
```sql
CREATE TABLE execution_steps (
  id uuid,
  execution_id uuid NOT NULL,
  node_id text NOT NULL,
  node_name text NOT NULL,
  status step_status,
  attempt int,
  started_at timestamptz,
  finished_at timestamptz,
  input_items jsonb,
  output_items jsonb,
  logs jsonb,
  error jsonb
);
```

**Entidade TypeORM (camelCase):**
```typescript
@Entity('execution_steps')
export class ExecutionStep {
  @Column() executionId: string;
  @Column() nodeId: string;
  @Column() nodeName: string;
  @Column() nodeType: string;
  @Column() status: string;
  @Column() inputItems: any;
  @Column() outputItems: any;
  @Column() startedAt: Date;
  @Column() finishedAt: Date;
  @Column() errorMessage: string;
  @Column() metadata: any;
}
```

### Problemas Identificados

1. **Discrepância de Nomenclatura**
   - BD usa: `node_id`, `node_name`, `execution_id`
   - TypeORM espera: `nodeId`, `nodeName`, `executionId`

2. **Coluna nodeType não existe no BD**
   - Entidade requer `nodeType` mas migração inicial não criou

3. **Coluna metadata não existe no BD**
   - Entidade requer `metadata` mas migração inicial não criou

4. **Sincronização Automática Habilitada**
   - TypeORM tenta sincronizar em desenvolvimento
   - Falha ao adicionar colunas NOT NULL em tabela com dados

5. **Registros Orfãos**
   - Pode haver registros com valores NULL que impedem constraint NOT NULL

## 🔧 SOLUÇÃO IMPLEMENTADA

### Opção 1: Criar Nova Migração (Recomendado)

Criar `030_fix_execution_steps_final.sql` que:

1. Remove registros órfãos (valores nulos)
2. Adiciona coluna nodeId como nullable
3. Popula nodeId a partir de node_id
4. Torna nodeId NOT NULL
5. Repete para nodeName, executionId, etc.
6. Adiciona nodeType com valor padrão
7. Adiciona metadata
8. Remove colunas antigas (opcional)

### Opção 2: Desabilitar Sincronização Automática

```typescript
synchronize: false // Sempre usar migrations manuais
```

### Opção 3: Configurar Nomeação de Colunas

```typescript
namingStrategy: new SnakeNamingStrategy()
```

## 📋 AÇÕES RECOMENDADAS

### Curto Prazo
- ✅ Executar migração 029 ou criar nova migração corrigida
- ✅ Desabilitar synchronize em produção
- ✅ Verificar e limpar registros órfãos

### Médio Prazo
- 🔄 Padronizar nomenclatura em todo o projeto
- 🔄 Adicionar testes de migração
- 🔄 Documentar estratégia de migração

### Longo Prazo
- 📝 Implementar naming strategy consistente
- 📝 Automatizar validação de migrações
- 📝 Backup automático antes de migrações

## 🎯 CHECKLIST DE VALIDAÇÃO

- [ ] Todas as migrações foram executadas?
- [ ] Schema do BD está consistente com entidades?
- [ ] Não há registros órfãos?
- [ ] Constraints estão corretos?
- [ ] Índices foram criados?
- [ ] Foreign keys estão válidas?
- [ ] Sincronização automática desabilitada em produção?

## 📝 PRÓXIMOS PASSOS

1. Executar migração de correção
2. Validar estrutura do banco
3. Atualizar documentação
4. Criar testes de integração
