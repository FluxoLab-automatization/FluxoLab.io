# Migracao do Express para NestJS

Guia incremental para portar as funcionalidades do servidor Express (`server.js`) para a nova base NestJS/TypeScript.

## 1. Autenticacao (`AuthModule`)
- [x] Integrar `pg` via `DatabaseService` para reaproveitar o pool de conexoes.
- [x] Portar hashing/comparacao de senhas (`lib/auth.js`) para `PasswordService` e JWT para `TokenService`.
- [x] Reimplementar `POST /auth/login`, `POST /auth/register`, `GET /auth/me` com DTOs, guard JWT e decorator `@CurrentUser`.
- [ ] Adicionar testes unitarios e e2e (ex.: `auth.service.spec.ts`, `auth.e2e-spec.ts`).

## 2. Workspace (`WorkspaceModule`)
- [ ] Migrar `services/overview.js` para um provider Nest com DTOs tipadas.
- [ ] Converter repositórios (`db/conversations.js`, `db/activities.js`, `db/repository.js`) em providers injetaveis.
- [ ] Serializar respostas (`OverviewDto`, `ProjectDto`, etc.) e cobrir com testes.

## 3. Webhooks (`WebhooksModule`)
- [ ] Portar utilitarios de seguranca (`lib/security.js`) para um `SecurityService`.
- [ ] Reimplementar `POST /generate-webhook` e endpoints `/webhooks/:token` com assinatura Meta e persistencia.
- [ ] Criar interceptor/pipes para `rawBody` (validacao `X-Hub-Signature-256`) e testes de integracao simulando eventos.

## 4. Infraestrutura Complementar
- [ ] Adaptar runner de migracoes (`db/migrate.js`) ou adotar CLI de ORM equivalente.
- [ ] Implementar filtros globais de excecao com respostas consistentes.
- [ ] Configurar `ThrottlerGuard` global e avaliar cache/pagination para consultas.
- [ ] Expor health-check (`/health`) e metricas (pool de banco, filas, filas futuras).

## 5. Decomissionamento Gradual
- [ ] Manter o servidor Express ate validar todos os endpoints na nova API.
- [ ] Atualizar o front-end (`app.js`) para consumir o prefixo `/api`.
- [ ] Planejar o cut-over e remover o legado apos garantir paridade funcional e performance.
