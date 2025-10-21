FluxoLab — Mapeamento completo para implementar E-mail, WhatsApp, Captação de Leads e Automação de Processos (com Gemini)

Abaixo está um plano executável alinhado ao seu stack atual (NestJS/TypeScript, Vue 3 + Vite + Pinia + Tailwind, Postgres, Redis, JWT). Ele cobre arquitetura, contratos, modelo de dados, fluxos, backlog por sprints, segurança/observabilidade e exemplos práticos de nós de workflow (como nas imagens).

## Arquitetura de alto nível
### Camadas

*   **Frontend (Vue 3)**
    *   Builder visual de fluxos (canvas com nós, propriedades, zoom, simulação/test).
    *   Inbox Omnichannel (WhatsApp/Email) + visão de contatos/segmentos.
    *   Catálogo de templates (Email/WhatsApp).
    *   Configurações por workspace/tenant.

*   **API Gateway (NestJS)**
    *   Auth (JWT, multi-tenant, RBAC).
    *   Recursos REST/WS para Workflows, Mensagens, Contatos, Templates, Integrações.
    *   Webhooks públicos: `/webhooks/whatsapp`, `/webhooks/email`, `/webhooks/leads`, `/webhooks/forms`.

*   **Orquestrador/Engine de Workflow**
    *   Runner baseado em jobs (BullMQ + Redis).
    *   Tipos de nós: Trigger, Condição, Delay, Enriquecimento (AI), Envio (WhatsApp/Email), Webhook, Atualizar CRM/DB.
    *   Scheduler (delays, retries, DLQ).
    *   Event bus interno (pub/sub simples em Redis): `lead.captured`, `message.delivered`, `purchase.created`, etc.

*   **Conectores**
    *   **WhatsApp** (Cloud API/provedor compatível): envio/recebimento, templates interativos (botões, listas), mídias, status.
    *   **Email** (abstração de provedor: SMTP/SendGrid/SES): templates, anexos, rastreio de eventos.
    *   **Leads**: Webhook universal + conectores específicos (ex.: Meta Lead Ads / Formulários / Landing page).
    *   **Gemini**: classificação de intenção, sumarização, resposta gerada, extração estrutural.

*   **Persistência**
    *   **Postgres**: multi-tenant, audit trail, execuções de workflow, contatos, mensagens, templates, leads, consentimento.
    *   **Redis**: filas, cache de sessão e throttling de provedores.

*   **Observabilidade & Segurança**
    *   Logs estruturados (NestJS LoggerService), métricas (Prometheus/OpenTelemetry), erros (Sentry).
    *   Assinatura/HMAC nos webhooks (verificação de integridade), idempotência (chave por `event_id`).
    *   LGPD: consentimento, opt-in/opt-out, retenção, mascaramento.

## Modelo de dados essencial (Postgres)
`tenants` (id, name, domain, plan, created_at)
`users` (id, tenant_id, role, …)
`contacts` (id, tenant_id, name, email, phone_e164, tags[], consent_status, last_channel)
`lead_sources` (id, tenant_id, type, config_json, active)
`leads` (id, tenant_id, source_id, external_id, payload_json, contact_id?, captured_at)
`channels` (id, tenant_id, kind: 'whatsapp'|'email', provider, config_secret_ref, verified_at)
`templates` (id, tenant_id, kind, name, body, variables_json, approved_status, meta_json)
`conversations` (id, tenant_id, contact_id, channel_id, status)
`messages` (id, tenant_id, conversation_id, direction 'in'|'out', kind, provider_msg_id, content_json, status, error?, created_at)
`workflows` (id, tenant_id, name, definition_json, status)
`workflow_runs` (id, tenant_id, workflow_id, trigger_event_id, status, started_at, finished_at)
`nodes` & `node_runs` (ou dentro de `definition_json` + `node_runs` para auditoria)
`events` (id, tenant_id, type, source, payload_json, correlation_id, received_at)
`consents` (id, tenant_id, contact_id, channel, mode, source, timestamp)
`usage_metering` (tenant_id, metric, qty, period)

*Obs.: `content_json` armazena estruturado (texto, template_id + vars, botões, mídia).*

## Contratos e eventos (MCP/Envelope)
**Envelope padrão (interno):**
```json
{
  "event_id": "evt_9y…",
  "tenant_id": "tnt_123",
  "type": "lead.captured",
  "source": "instagram|landing|whatsapp",
  "occurred_at": "2025-10-18T23:12:00Z",
  "correlation_id": "corr_…",
  "payload": { "name": "Ana", "phone_e164": "+5531999999999", "tags": ["promo"], "raw": { } }
}
```

**Webhook público (ex.: Leads) `POST /webhooks/leads?tenant=…`**
*   Header `X-Signature`: `sha256=…` (HMAC com secret do connector).
*   Body: transformar para o Envelope e publicar no bus.

**Mensagem WhatsApp (saída) – comando ao Worker**
```json
{
  "cmd": "whatsapp.send",
  "tenant_id": "tnt_123",
  "channel_id": "chn_wpp_01",
  "to": "+55319…",
  "content": {
    "type": "template",
    "name": "boas_vindas",
    "language": "pt_BR",
    "components": {
      "body": ["Ana", "30% OFF"],
      "buttons": [{ "type": "url", "index": 0, "param": "https://…" }]
    }
  },
  "meta": { "conversation_id": "cnv_…" }
}
```

**Resposta do Gemini (structured) – para roteamento**
```json
{
  "intent": "interesse_compra|suporte|agendamento|outro",
  "confidence": 0.86,
  "entities": { "produto": "Plano XYZ", "cidade": "Patos de Minas" },
  "reply_text": "Oi, Ana! Vi que…",
  "next_action": "enviar_template_compra"
}
```

## Tipos de nós do Workflow (MVP)
*   **Triggers**
    *   `lead.captured`, `message.received.whatsapp`, `form.submitted`, `purchase.approved`.
*   **Condição/Branch**
    *   Comparação por campos (tag, origem, horário), match de intenção (via Gemini).
*   **Ações**
    *   `whatsapp.send_text` | `send_template` | `send_list` | `send_buttons` | `send_media`
    *   `email.send_template`
    *   `contact.upsert` (merge por email/telefone)
    *   `crm.create_deal` (placeholder)
    *   `webhook.call` (POST com mapping)
    *   `ai.classify` | `ai.reply` | `ai.extract`
*   **Controle**
    *   `delay`, `wait.for.event` (ex.: clicar link/comprar), `loop.for-each`, `set.variable`, `transform.json`.

**Exemplo de definição (trecho)**
```json
{
  "id": "wf_lead_nurture",
  "name": "Nurture WhatsApp",
  "trigger": { "type": "lead.captured", "filter": {"source": ["instagram","landing"]}},
  "nodes": [
    { "id": "n1", "type": "contact.upsert", "map": {"name":"$.payload.name","phone":"$.payload.phone_e164"} },
    { "id": "n2", "type": "ai.classify", "input": "Intenção do lead: {{name}} perguntou: {{payload.message}}"},
    { "id": "n3", "type": "switch", "on": "$.n2.intent", "cases": {
      "interesse_compra": "n4", "suporte": "n5", "default": "n6"
    }},
    { "id": "n4", "type": "whatsapp.send_template", "template":"boas_vindas", "vars":{"nome":"{{name}}"}, "next":"n7" },
    { "id": "n5", "type": "whatsapp.send_text", "text":"Encaminhando para suporte…", "next":"n8" },
    { "id": "n6", "type": "email.send_template", "template":"followup_padrao" },
    { "id": "n7", "type": "wait.for.event", "event":"purchase.approved", "timeout":"P2D", "timeoutNext":"n9" },
    { "id": "n9", "type": "whatsapp.send_template", "template":"lembrete_carrinho" }
  ]
}
```

## Integrações
*   **WhatsApp**
    *   **Endpoints**:
        *   Recebimento: `POST /webhooks/whatsapp` (mensagens, status).
        *   Envio: serviço `WhatsappService` com throttle, rate limit, retry exponencial.
    *   **Recursos**: templates, mídia, mensagens interativas (listas/botões), status (sent/delivered/read), sessão/conversação.
    *   **Compliance**: opt-in, stop words (opt-out), janelas de mensagem, guarda de consentimento.
*   **E-mail**
    *   Abstração (`EmailProvider`): SMTP simples + provedores.
    *   Eventos: `delivered`, `opened`, `clicked` (quando disponível).
    *   Templates com placeholders e partials.
*   **Captação de Leads**
    *   Webhook universal para Landing Page/Form (com recaptcha opcional).
    *   Conectores específicos (Meta, etc.) → todos normalizados para o Envelope.
    *   Dedupe: por email/telefone, `external_id`, time-window.
    *   Enfileirar `lead.captured` → iniciar workflows.
*   **Gemini**
    *   **Serviços**:
        *   `classifyIntent(text, context)` → intenção/entidades.
        *   `generateReply(context, history)` → mensagem natural multi-turno.
        *   `extractStructured(text, schema)` → JSON validado (Zod).
    *   **Guardrails**: prompt com persona + limites + conteúdo permitido; fallback para mensagens template se `confidence < X`.
    *   Cache de prompts (Redis) quando aplicável.

## Segurança, Resiliência e LGPD
*   Webhook HMAC (`X-Signature`); replay protection (nonce + timestamp).
*   Idempotência em operações de envio (`Idempotency-Key`).
*   Rate limiting por tenant e por conector.
*   DLQ (dead-letter) para jobs com falha; reprocessamento manual.
*   LGPD: finalidade declarada, registro de consentimento, opt-out em um clique, retenção e anonimização sob solicitação.

## Observabilidade/Métricas
*   KPIs por tenant: leads/dia, conversões, CTR de templates, tempo médio 1ª resposta, SLA de entrega.
*   Tracing de `workflow_run` (cada nó com `started_at`, `finished_at`, `status`, `error`).
*   Dash de erros de provedor (quota, bloqueio, template não aprovado).

## Backlog por Sprints (6–8 semanas de MVP)
*   **Sprint 0 – Fundações**
    *   Monorepo + CI, ambientes (dev/stg/prod), Postgres + Prisma, Redis, Auth JWT multi-tenant, RBAC (owner/admin/agent).
*   **Sprint 1 – Captação de Leads**
    *   Webhook universal + conectores iniciais.
    *   Tabelas `contacts`, `leads`, `lead_sources`.
    *   Inbox básica de leads e visão de contato.
*   **Sprint 2 – Conector WhatsApp**
    *   Webhook de entrada + envio de texto/template.
    *   Catálogo de templates (CRUD + preview).
    *   Conversas e status de mensagens.
*   **Sprint 3 – Conector E-mail**
    *   Abstração de envio + templates de e-mail.
    *   Eventos de abertura/clique (quando disponível).
*   **Sprint 4 – Engine de Workflow (MVP)**
    *   Nós: Trigger, Condição, Delay, `WhatsApp.send`, `Email.send`, `Contact.upsert`.
    *   Runner (BullMQ), idempotência, retries, simulação no builder.
*   **Sprint 5 – Gemini (AI no Loop)**
    *   `ai.classify` + `ai.reply` com guardrails e fallback.
    *   Roteamento por intenção e resposta automática opcional.
*   **Sprint 6 – Relatórios & Cobrança**
    *   Métricas por tenant, limites de plano, `usage_metering`.
    *   Webhooks de saída para integrar com ERP/CRM (GLPI/PIX/… no roadmap BR).

## Endpoints principais (exemplos)
*   `POST /api/workflows` – cria/atualiza definição JSON.
*   `POST /api/workflows/:id/test` – simula com payload.
*   `POST /api/messages/whatsapp` – envio direto (debug).
*   `GET /api/conversations/:id/messages` – histórico.
*   `POST /webhooks/whatsapp` / `email` / `leads` – ingestão.
*   `POST /api/contacts/upsert` – normalização e merge.

## Exemplo de Prompt (Gemini)
**Sistema:**
“Você é atendente virtual da `{{tenant_name}}`. Responda em PT-BR, educado e objetivo. Se a pergunta envolver preço/pagamento, ofereça agendamento com humano. Nunca invente informações.
Devolva JSON no formato:
`{ "reply_text": "...", "intent": "interesse_compra|suporte|agendamento|outro", "entities": {} }`
Se não tiver confiança, use `intent=‘outro’`.”

**Usuário:** “Oi, vi o plano empresarial, como funciona?”
**Contexto:** histórico + catálogo resumido.

## UI (Vue) — módulos iniciais
*   **Flow Builder**: canvas, palette de nós, painel de propriedades, Test/Preview, versão/rollback.
*   **Inbox Omnichannel**: filtro por canal, responder via WA/Email, macros/atalhos, “Responder com AI”.
*   **Templates**: editor (placeholders), aprovação (WA), preview, variáveis.
*   **Contatos & Segmentos**: tags, filtros rápidos, opt-in/out.
*   **Configurações**: chaves do WhatsApp/Email, secrets (via vault), webhooks.

## Testes
*   **Unit**: serviços (`WhatsappService`, `EmailService`, `GeminiService`).
*   **Integração**: webhooks → event bus → runner → status.
*   **E2E**: fluxo “Lead Instagram → WhatsApp Boas-vindas → Compra/Follow-up”.
*   Mock de provedores e fixtures para templates.

## Roadmap BR (próximos conectores)
*   PIX (consulta/checkout), GLPI (abrir/atualizar ticket), Zoho/HubSpot (CRM), RD Station (leads), Telegram/Instagram DM (omni).
*   Biblioteca de templates prontos (promo, cobrança, suporte, recuperação de carrinho).

## Resultado prático que você pode atacar já
1.  Subir redis (ok) + seeds do Postgres.
2.  Criar Webhook Universal de Leads (rota + assinatura HMAC + normalização para Envelope).
3.  Implementar `WhatsappService` (envio texto/template) + webhook de entrada.
4.  Engine MVP com nós: `Trigger(lead.captured)` → `contact.upsert` → `whatsapp.send_template` → `delay` → `whatsapp.send_text`.
5.  Integrar Gemini com `ai.classify` + fallback para template.
