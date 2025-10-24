**Descrição:** Conector genérico HTTP e sistema de webhooks
**Estimativa:** 3 dias
**Prioridade:** 🔴 Alta

**Checklist:**
- [ ] SDK Base para conectores
- [ ] Conector HTTP genérico (GET/POST/PUT/DELETE)
- [ ] Hub de Webhooks (/webhooks/:provider/:workspace)
- [ ] Validação HMAC para webhooks
- [ ] Roteamento de webhooks para workflows
- [ ] Documentação da API de webhooks

**Critérios de Aceite:**
- [ ] HTTP requests com auth (Bearer/API Key)
- [ ] Webhooks com assinatura válida são aceitos
- [ ] Roteamento para workflow correto
- [ ] Payload preservado na execução