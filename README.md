# Webhooks API

API em Node.js para geracao e recebimento de webhooks com persistencia em Postgres.

## Requisitos

- Node.js 18+
- Postgres 13+

## Configuracao

1. Copie `.env` e ajuste as variaveis:
   - `DATABASE_URL`: string de conexao do Postgres (usuario com permissaes para criar extensoes e tabelas).
   - `TOKEN_HASH_SECRET`: segredo usado para derivar o hash do token (nao compartilhe).
   - `VERIFY_TOKEN` e `APP_SECRET`: exigidos pela integracao Meta/WhatsApp.
   - `JWT_SECRET` e `JWT_EXPIRES_IN`: configuram a assinatura do token de sessao.
   - `SIGNUP_ACCESS_TOKEN` (opcional): token de bootstrap para permitir registro de usuarios.
2. Instale dependencias:

```bash
npm install
```

3. Rode as migracoes:

```bash
npm run migrate
```

4. Inicie o servidor:

```bash
npm start
```

## Endpoints

- `POST /auth/register`: cria um usuario (requer `SIGNUP_ACCESS_TOKEN` definido, se configurado).
- `POST /auth/login`: autentica usuario e retorna JWT + dados basicos para a UI.
- `POST /generate-webhook`: gera token e URL para um usuario. O token completo so e retornado uma vez.
- `GET /webhooks/:token`: valida o webhook com a Meta/WhatsApp (challenge). Registro precisa existir e o `VERIFY_TOKEN` precisa casar.
- `POST /webhooks/:token`: recebe eventos, valida assinatura `X-Hub-Signature-256` se `APP_SECRET` estiver configurado e armazena o payload no Postgres.

## Banco de dados

As tabelas principais sao:

- `users`: armazen a credencial (hash) e perfil basico para o workspace FluxoLab.
- `webhook_registrations`: registros por usuario com hash dos tokens e auditoria de uso.
- `webhook_events`: eventos recebidos (payload, headers, status, erros).
- `conversations`: projetos/fluxos pertencentes a um usuario.
- `activities`: timeline de eventos relevantes (auditoria, execucoes, comentarios, etc).

O runner `npm run migrate` aplica os arquivos SQL em `db/migrations`.

## Desenvolvimento

- Logs estruturados com [pino](https://github.com/pinojs/pino); no modo local o output e formatado.
- Limite de requisicao configuravel via `RATE_LIMIT_WINDOW_MS` e `RATE_LIMIT_MAX`.
- Testes unitarios (exemplo em `tests/security.test.js`) executados com `npm test`.

## Proximos passos sugeridos

- Adicionar fila de mensagens para entregar eventos a outros servicos (por exemplo BullMQ).
- Criar painel para consultar registros e eventos armazenados.
- Implementar reprocessamento de eventos com base na tabela `webhook_events`.


