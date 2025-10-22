# FluxoLab Platform

Monorepo dos servicos principais da FluxoLab:

- `backend/`: API oficial em NestJS/TypeScript (auth, workspaces, workflows, integracoes, WhatsApp e monitoramento).
- `frontend/`: dashboard SPA em Vue 3 + Vite consumindo a API (`/api`).
- `db/`: migrations SQL e utilitários para evolução do schema Postgres.
- `monitoring/`: configuração de Prometheus/Grafana e exporters auxiliares.

> **Requisitos gerais**
> - Node.js 20+
> - Postgres 13+

## Comandos principais

A raiz delega os scripts para o backend NestJS:

```bash
npm install            # instala dependências do backend
npm run migrate        # aplica migrations em db/migrations
npm run start          # inicia a API em modo produção
npm run start:dev      # modo watch (nest start --watch)
npm run test           # testes do backend
npm run lint           # lint do backend
```

Para o front-end:

```bash
cd frontend
npm install
npm run dev            # servidor Vite (proxy para http://localhost:3000/api)
```

## Backend (NestJS)

O diretorio `backend/` concentra modulos de autenticacao (`AuthModule`), workspaces (settings, billing, integracoes), webhooks, workflows (engine + fila Bull), leads, WhatsApp, MCP e monitoramento.

- Configuracao de ambiente validada com Zod (`src/config/env.validation.ts`).
- Postgres via `DatabaseModule` (pool `pg`) e Redis para filas (`BullModule`).
- Logs com `nestjs-pino`, rate limiting com `@nestjs/throttler`.
- Métricas expostas em `/api/monitoring/metrics/prometheus`.

Execução manual:

```bash
cd backend
npm install
npm run start:dev
```

## Banco de dados

Migrations SQL em `db/migrations/*.sql`. O runner (`npm run migrate`) executa em ordem alfabetica e registra historico em `schema_migrations`. Os scripts utilizam `dotenv` e o logger simples de `lib/logger.js`.

Tabelas principais (apos migrations):

- `users`, `workspaces`, `workspace_members`
- `webhook_registrations`, `webhook_events`
- `workflows`, `workflow_versions`, `executions`
- `plans`, `subscriptions`, `billing_records`

## Front-end (Vue 3 + Vite)

Em `frontend/` estao as telas de Login, Dashboard, Settings e Workflow Builder.

- Estado global com Pinia (`stores/session.store.ts`).
- Serviços centralizados em `src/services/*.ts`.
- Tailwind para UI, Vitest e ESLint configurados.

Rodando localmente:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Monitoramento

`monitoring/prometheus.yml` aponta para os exporters padrao e coleta as metricas da API (`/api/monitoring/metrics/prometheus`). Ha diretorios auxiliares para Grafana e Logstash.

## Observacoes

- O servidor Express legado foi removido; toda a superficie HTTP esta centralizada em `backend/`.
- Scripts antigos (`lib/`, `services/`, `middleware/`) permanecem apenas para tooling legado (ex.: runner de migrations) e podem ser limpos futuramente.
- Para build front-end em pipelines existe o script `npm run cf:build`.
