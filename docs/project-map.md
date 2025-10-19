# FluxoLab – Project Mapping (Integrations, APIs, Credentials, Workflows)

## Monorepo Overview
- **Root services**: Node/Nest backend (`backend/`), Vue 3 + Vite frontend (`frontend/`), shared express server (`server.js`, `app.js`), legacy helpers (`lib/`, `middleware/`), monitoring scripts (`monitoring/`), docs (`docs/`).
- **Database migrations** under `db/migrations`: canonical source of truth for relational schema.
- **docker-compose.yml** orchestrates Postgres + app containers for local/staging parity.

## Database Layers (migrations 001→008)
| Migration | Main Entities | Notes / Relations |
|-----------|---------------|-------------------|
| `001_init.sql` | `webhook_registrations`, `webhook_events` (legacy, user-scoped) | Superseded by `005`/`008`; kept for compatibility until cleanup. |
| `002_fluxolab_core.sql` | `users`, `conversations`, `activities` (legacy), indexes | Activities here lack `workspace_id`; replaced by `005`/`008`. |
| `003_business_core.sql` | `workspaces`, `workspace_members`, `profiles`, `plans`, `permissions`, `workspace_settings`, `workspace_usage_snapshots`, `workspace_api_keys`, `workspace_environments`, `workspace_secret_providers`, `workspace_sso_configs`, `workspace_ldap_configs`, `workspace_log_destinations`, `workspace_community_connectors` | Seeds default plans/profiles/grants. Foundation for settings & integrations. |
| `004_settings_layer.sql` | User settings/security, workspace API keys/environments/secret providers/... | Complements `003` with more settings tables and seed data. |
| `005_workflows.sql` | `credentials`, `workflows`, `workflow_versions`, `executions`, `execution_steps`, workspace-aware webhooks, activities | Introduces workflow engine storage + workspace-scoped activity log. |
| `006_workspace_defaults.sql` | Adds `users.default_workspace_id` FK with prioritized backfill via `workspace_members → profiles.code` | Aligns auth/session with workspace context. |
| `007_credentials_bootstrap.sql` | Backfills `credentials.workspace_id`, enforces FK + NOT NULL, creates index | Ensures encryption layer works per workspace. |
| `008_webhooks_activities_alignment.sql` | Drops legacy webhook/activity tables when legacy columns detected, recreates workspace-aware versions, reattaches FK to executions | Must announce data loss for legacy payloads before deploy. |

**Key schema areas to extend next:** settings tables (already in `003/004`), integrations tables (secret providers, connectors, etc.), workflow execution lineage, credentials security.

## Backend (NestJS) Map
### Configuration & Shared Utilities
- `backend/src/config/` – environment validation (`env.validation.ts`), config modules.
- `backend/src/shared/database` – Postgres pool via `pg`, exported through `DatabaseModule` (`PG_POOL` token).
- `backend/src/shared/security`, `shared/auth`, `shared/logging`, `shared/interceptors` – reusable providers for hashing, auth utilities, logging (Pino), metrics interceptors.

### Auth Domain (`modules/auth`)
- `auth.controller.ts`, `auth.service.ts` – login/register flows, JWT issuance, workspace attachment.
- Repositories for `users`, `profiles`, `user_settings`, `user_security_settings`; rely on tables seeded in `002/003/004`.
- Guards: `JwtAuthGuard`, `RequireWorkspaceGuard` enforce authenticated + workspace-selected requests for downstream controllers.

### Workspace & Settings (`modules/workspace`)
- `workspace.controller.ts`, `workspace.service.ts` power dashboard overview (projects, activities, recent webhooks). Uses repositories:
  - `conversations.repository.ts` ↔ `conversations` table (`002`).
  - `activities.repository.ts` ↔ currently legacy `activities` shape (needs update to new `metadata`, `workspace_id`).
  - `webhook-events.repository.ts` ↔ new workspace-aware tables (`005`/`008`).
- `settings.controller.ts` exposes `/api/settings/*` endpoints consumed by frontend services. Business services:
  - `workspace-settings.service.ts` aggregates plan/subscription, usage, API keys, environments, integrations.
  - `services/usage-analytics.service.ts`, `services/plan-management.service.ts` orchestrate detailed slices (billing history, usage alerts, plan upgrades). Depend on repositories under `workspace/repositories` and `billing/repositories`.
- Integration-layer repositories map directly to tables:
  - `workspace-settings.repository.ts` ↔ `workspace_settings` (preferences/notifications/branding).
  - `workspace-api-keys.repository.ts` ↔ `workspace_api_keys`.
  - `workspace-environments.repository.ts` ↔ `workspace_environments` (ensures seed rows).
  - `workspace-integrations.repository.ts` ↔ `workspace_secret_providers`, `workspace_log_destinations`, `workspace_sso_configs`, `workspace_ldap_configs`, `workspace_community_connectors`.
  - `workspace-usage.repository.ts` ↔ `workspace_usage_snapshots`.
  - `workspace-members.repository.ts` ↔ `workspace_members` (used across services for default workspace, plan enforcement).
- Provisioning helpers (`workspace-provisioning.service.ts`) ensure seeds for new workspaces (API keys, secret providers, etc.).

### Workflows Domain (`modules/workflows`)
- Controllers: `WorkflowsController` (`POST /api/workflows`, `/api/workflows/:id/test`), `WorkflowCredentialsController` (`GET/POST /api/workflows/credentials`).
- Services:
  - `WorkflowsService` ↔ `workflows`, `workflow_versions` (CRUD + activation).
  - `WorkflowExecutionsService` ↔ `executions`, `execution_steps` (run tracking).
  - `WorkflowCredentialsService` ↔ `credentials` (encrypt/decrypt secrets, uses AES-GCM with key derived from `APP_SECRET`).
  - `WorkflowWebhookService`, `WorkflowQueueService`, `WorkflowRunnerService`, `WorkflowEngineService` implement node engine with registry under `engine/` (e.g., `webhook-in.node.ts`, `smtp-send.node.ts`).
- Monitoring integration via `MonitoringModule` for metrics/logs of run pipeline.

### Webhooks Domain (`modules/webhooks`)
- `WebhooksController` (Meta-compatible verification + event ingestion), `WebhooksService` handles token generation, signature validation, event persistence.
- Repository split:
  - `webhook-registrations.repository.ts` **still targets legacy schema** (fields: `user_id`, `token_hash`, no `workspace_id`). Needs refactor to align with new table shape (workspace + workflow IDs).
  - `webhook-events.repository.ts` (module-local) persists payload/headers/signatures – currently expects legacy columns (`payload`, `headers`). Must migrate to new workspace-aware structure in `008`.
- Contrast with `workspace/repositories/webhook-events.repository.ts`, which already assumes new schema for dashboard counts; both need harmonization.

### Monitoring & MCP Modules
- `modules/monitoring` likely wraps Prometheus/metrics (check exporters).
- `modules/mcp` integrates MCP connectors (not fully fleshed out yet).

## Frontend (Vite + Vue) Map
- `src/services/api.ts` centralizes API base URL + error handling. All domain services build on it.
- Domain services of interest:
  - `services/workflows.service.ts` – CRUD/test workflows, manage credentials (`/api/workflows/*` endpoints).
  - `services/settings.service.ts` – rich settings API surface (usage analytics, plan upgrades, API keys, integrations, SSO, logs). Mirrors controller stubs in backend.
  - `services/workspace.service.ts` – (not yet inspected) likely handles overview endpoints.
- Components:
  - `components/workflows/WorkflowCredentialsPanel.vue` uses credentials service to list/add secrets.
  - `views/WorkflowBuilderView.vue` orchestrates workflow creation/testing pipeline.
  - `components/dashboard/WebhooksPanel.vue`, `ActivitiesPanel.vue` rely on workspace overview endpoints.
  - `views/SettingsView.vue` integrates multiple settings services (plan cards, usage charts, integration toggles).
- State:
  - `stores/session.store.ts` retains auth token, user/workspace context (expects `default_workspace_id` to be set).

## API Surface Alignment
| Endpoint (frontend expectation) | Backend implementation | Data source |
|---------------------------------|------------------------|-------------|
| `POST /api/workflows` | `WorkflowsController.createWorkflow` | `workflows`, `workflow_versions` |
| `POST /api/workflows/:id/test` | `WorkflowsController.executeWorkflow` | `executions`, engine nodes |
| `GET/POST /api/workflows/credentials` | `WorkflowCredentialsController` | `credentials` |
| `GET /api/settings/summary` | `SettingsController.getSettingsSummary` | Aggregates `workspace_*`, `plans`, `subscriptions`, `workspace_usage_snapshots`, `workspace_api_keys`, integrations tables |
| `GET /api/settings/usage/history` | `SettingsController.getUsageHistory` → `UsageAnalyticsService` | `workspace_usage_snapshots` (implementation pending) |
| `GET/POST /api/settings/usage/alerts` | Placeholder returning data from `UsageAnalyticsService` (needs table wiring) | likely new table to create (not yet in migrations) |
| `POST /api/settings/api/keys` etc. | Controller stubs (no repository calls yet) | `workspace_api_keys` |
| `GET /api/settings/integrations/status` | Not yet implemented | Should use `workspace-integrations.repository` |
| Workspace overview endpoints (dashboard) | `workspace.controller.ts` | Conversations, activities, webhook counts |
| Auth endpoints `/api/auth/*` | Implemented via `auth.controller.ts` | `users`/`user_settings` tables |

**Observation:** Several settings/integration endpoints are stubbed (return canned messages). Repositories exist, but controllers/services need to call them and commit to schema conventions.

## Identified Gaps & Action Items
1. **Webhook schema alignment**
   - Update `modules/webhooks/repositories` and service to use workspace-aware tables (`workspace_id`, `workflow_id`, new columns). Ensure data migration strategy from legacy tokens if required (before `008` forces drop).
   - Unify event storage columns (`payload` + `metadata` vs. `body_json`/`raw_body`) to match `005/008` definitions.
2. **Activities repository mismatch**
   - `activities.repository.ts` still selects `payload` and lacks `workspace_id` filters. Refactor to new schema (`metadata`, `workspace_id`, `user_id` optional). Update DTOs and seeds.
3. **Usage alerts / API key management** (settings)
   - Controllers currently return placeholders. Need migrations for `workspace_usage_alerts`, audit tables, and repository implementations (or wire to existing tables if already planned).
   - Implement create/revoke/rotate operations on `workspace_api_keys` (currently only read side).
4. **Integrations endpoints**
   - Add controllers/services to expose `workspace_integrations.repository` data (`/settings/integrations/status`, `/settings/environments/:id/status`, `/settings/sso/configure`, etc.). Ensure commands persist into relevant tables.
   - Extend migrations if additional columns (e.g., integration configs) needed.
5. **Credentials hardening**
   - `WorkflowCredentialsService` writes raw `secret` back to response. Confirm masking requirements. Add auditing/tracing if required by compliance.
6. **Workflow engine dependencies**
   - Ensure `workflow_engine` nodes align with DB schema (e.g., `webhook-in` node must register workflow's webhook via `WorkflowWebhookService`).
7. **Documentation**
   - New `docs/staging-playbook.md` (created earlier) + this map should feed runbooks. Keep architecture diagrams in sync.

## Suggested Next Steps
1. **Schema wiring for integrations & APIs**
   - Add migrations for `workspace_usage_alerts`, `workspace_api_key_audit`, `workspace_integration_events` if planned.
   - Implement repository methods to create/update/delete entries and expose them via `SettingsController` endpoints consumed by frontend.
2. **Refactor webhook + activities modules to new schema**
   - Update backend services/repositories, add data backfill scripts, adjust tests (`modules/workspace/__tests__`, `webhooks` specs) accordingly.
   - Sync frontend components if payload shape changes (`WebhooksPanel`, `ActivitiesPanel`).
3. **End-to-end credential flow**
   - Ensure credential creation triggers necessary encryption, integrate with workflow nodes that require credentials (e.g., `smtp-send.node.ts`). Add API to fetch decrypted secrets server-side only.
4. **Integration testing**
   - Create Postman/VS Code REST collections or Jest e2e tests targeting `/api/workflows`, `/api/settings/*`, `/api/webhooks/*` to validate alignment.
5. **Monitoring & Observability**
   - Hook new DB tables into monitoring dashboards (metrics interceptors already present). Record counts/latencies for key flows (workflow executions, webhook ingestion).

This mapping should serve as a reference while we continue implementing configuration tables and wiring integrations/APIs/credentials/workflows through the stack. Update as schemas or modules evolve.
