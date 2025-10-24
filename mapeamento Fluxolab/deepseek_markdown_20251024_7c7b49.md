**Descrição:** Implementar controle de acesso baseado em roles
**Estimativa:** 4 dias
**Prioridade:** 🔴 Alta

**Checklist:**
- [ ] Definir roles: Admin, Builder, Operator, Viewer
- [ ] Criar tabela `roles` e permissions
- [ ] Implementar guards de autorização na API
- [ ] Middleware de verificação de permissões
- [ ] Endpoints para gerenciar membros do workspace
- [ ] UI básica para gestão de usuários

**Critérios de Aceite:**
- [ ] Usuário com role Viewer não pode editar workflows
- [ ] Admin pode adicionar/remover membros
- [ ] Builder pode criar/editarr workflows
- [ ] Operator só executa workflows existentes