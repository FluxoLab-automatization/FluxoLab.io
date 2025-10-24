**Descrição:** Sistema de logging de auditoria para compliance
**Estimativa:** 2 dias
**Prioridade:** 🟡 Média

**Checklist:**
- [ ] Criar tabela `audit_events`
- [ ] Logar eventos: login, CRUD workflows, execuções
- [ ] Endpoint GET /audit com filtros
- [ ] Middleware de captura automática
- [ ] Export de logs em CSV

**Critérios de Aceite:**
- [ ] Todos os logins são registrados
- [ ] Mudanças em workflows são auditadas
- [ ] Filtros por data/usuário/ação funcionando
- [ ] Logs contêm IP e user agent