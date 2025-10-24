**Descrição:** Criar base de dados multi-tenant para isolamento de clientes
**Estimativa:** 3 dias
**Prioridade:** 🔴 Alta

**Checklist:**
- [ ] Criar tabela `organizations`
- [ ] Criar tabela `workspaces` 
- [ ] Criar tabela `workspace_members`
- [ ] Implementar relação organization → workspaces
- [ ] Criar endpoints CRUD básicos
- [ ] Testes de integração multi-tenant

**Critérios de Aceite:**
- [ ] 3 organizações de teste funcionando
- [ ] Isolamento de dados entre workspaces
- [ ] APIs retornando apenas dados do tenant
- [ ] Testes passando com 100% coverage