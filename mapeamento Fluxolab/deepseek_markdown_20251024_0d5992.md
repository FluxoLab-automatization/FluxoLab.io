**Descrição:** Motor de execução de workflows com versionamento
**Estimativa:** 5 dias
**Prioridade:** 🔴 Alta
**Dependências:** Sprint 1

**Checklist:**
- [ ] Criar tabelas: `workflows`, `workflow_versions`
- [ ] Implementar grafo de execução
- [ ] Sistema de versionamento (draft/published)
- [ ] Endpoints CRUD workflows
- [ ] Publicação com versionamento
- [ ] Histórico de versões

**Critérios de Aceite:**
- [ ] Workflow salva como grafo JSON
- [ ] Versionamento mantém histórico
- [ ] Rollback para versões anteriores
- [ ] Publicação cria versão imutável