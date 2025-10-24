**Descrição:** Sistema seguro para armazenamento de credenciais
**Estimativa:** 3 dias
**Prioridade:** 🔴 Alta

**Checklist:**
- [ ] Criar tabela `secrets`
- [ ] Implementar envelope encryption (AES-GCM)
- [ ] API para criar/ler secrets (POST/GET /secrets)
- [ ] Masking em logs e UI
- [ ] Rotação de chaves básica
- [ ] Validação de permissões por secret

**Critérios de Aceite:**
- [ ] Secrets armazenados cifrados no banco
- [ ] UI mostra apenas **** para valores
- [ ] Apenas usuários autorizados podem acessar secrets
- [ ] Logs nunca expõem valores plain text