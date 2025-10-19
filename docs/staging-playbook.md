# Staging Playbook – Migrations 001→008

## 1. Pré-migração
- **Backup completo:**  
  ```bash
  pg_dump --format=custom --file=staging_before_migration.backup "$STAGING_DATABASE_URL"
  ```
- **Comunicação:** Alinhar squads de que `008_webhooks_activities_alignment` remove estruturas legadas (`webhook_registrations/events` sem `workspace_id` e `activities` com `payload`). Solicitar congela geral em integrações que dependam desses dados.
- **Janela e monitoria:** Programar janela e preparar alertas (APM, ingestão de eventos). Validar que há storage para snapshots/backup.

## 2. Execução das migrations
1. Garantir que a aplicação esteja parada ou em modo manutenção.
2. Executar migrations sequenciais:  
   ```bash
   node backend/scripts/run-migrations.js --from 001_init.sql --to 008_webhooks_activities_alignment.sql --database "$STAGING_DATABASE_URL"
   ```
   > Ajuste para o comando/runner equivalente do projeto caso seja diferente.
3. Verificar logs do runner; qualquer erro aborta a execução e requer restore do backup.

## 3. Validações pós-006/007
Executar imediatamente após `006_workspace_defaults.sql` e `007_credentials_bootstrap.sql`:
```sql
-- usuários sem workspace padrão
SELECT COUNT(*) AS usuarios_sem_default
FROM public.users
WHERE default_workspace_id IS NULL;

-- credenciais sem workspace mapeado
SELECT COUNT(*) AS credentials_sem_workspace
FROM public.credentials
WHERE workspace_id IS NULL;

-- consistência: default do owner deve apontar para workspace de posse
SELECT u.id, u.default_workspace_id, w.id AS workspace_id, (u.default_workspace_id = w.id) AS coerente
FROM public.users u
JOIN public.workspaces w ON w.owner_id = u.id;

-- auditoria rápida: distribuição por profile
SELECT p.code, COUNT(*) 
FROM public.workspace_members wm
JOIN public.profiles p ON p.id = wm.profile_id
JOIN public.users u ON u.id = wm.user_id
WHERE u.default_workspace_id = wm.workspace_id
GROUP BY p.code;
```
Se qualquer contagem diferir de zero, interrompa o fluxo e investigue antes de seguir.

## 4. Revisão de privilégios
Reexecutar grants do papel de aplicação, confirmando que (`003_business_core.sql`) permaneceu efetivo:
```bash
psql "$STAGING_DATABASE_URL" <<'SQL'
GRANT CONNECT ON DATABASE current_database() TO fluxolab_devmode;
GRANT USAGE ON SCHEMA public TO fluxolab_devmode;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fluxolab_devmode;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fluxolab_devmode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fluxolab_devmode;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO fluxolab_devmode;
SQL
```
Confirme que não há papéis órfãos ou restrições inesperadas com `\dp` e `\dn+` no `psql`.

## 5. Smoke-tests dirigidos
1. **Webhooks:** Criar registro, disparar evento e verificar processamento (`public.webhook_events`).  
2. **Activities:** Executar ação que gere log de auditoria e confirmar `workspace_id` correto.  
3. **Credentials:** Criar/editar credencial; checar constraint `workspace_id` NOT NULL.

Utilizar scripts automatizados ou Postman/Insomnia. Validar que índices (`idx_activities_workspace`, `idx_credentials_workspace`) estão sendo usados (via `EXPLAIN` se necessário).

## 6. Contingências
- Se surgir necessidade de migrar dados legado (pré-005), mapear estrutura antiga (tokens sem workspace/payload) e preparar migração ad hoc antes de tocar produção.
- Caso alguma verificação falhe: **parar** e restaurar backup com `pg_restore --clean --if-exists`.
- Documentar qualquer correção manual aplicada em staging.

## 7. Fechamento
- Reativar aplicação, soltar comunicação de sucesso para squads.
- Anexar métricas pós-deployment (tempo de execução, contagens verificadas, resultados dos testes) ao registro de mudança.
- Preparar cronograma para produção reutilizando o mesmo roteiro, ajustando a janela e as equipes envolvidas.
