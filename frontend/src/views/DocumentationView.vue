<script setup lang="ts">
const sections = [
  { id: 'visao', label: 'Visao geral' },
  { id: 'versao', label: 'Versao' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'apis', label: 'APIs' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'acessos', label: 'Acessos' },
  { id: 'suporte', label: 'Suporte' },
];

const releaseSummary = [
  {
    version: '1.4.0',
    releasedAt: '03 out 2025',
    status: 'Producao',
    changes: [
      'Dashboard com filtros dinamicos de projetos',
      'Monitoramento em tempo real de filas de workflow',
      'Melhorias de seguranca nas credenciais de API',
    ],
  },
  {
    version: '1.3.2',
    releasedAt: '12 set 2025',
    status: 'Producao',
    changes: [
      'Webhooks com assinatura HMAC',
      'Rotas de auditoria para eventos de usuarios',
    ],
  },
];

const userProfiles = [
  {
    role: 'Administrador',
    responsibilities: [
      'Cria workspaces e configura SSO',
      'Gerencia politicas de acesso e auditoria',
      'Publica workflows em producao',
    ],
    permissions: 'Controle total sobre recursos, conectores e dados sensiveis',
  },
  {
    role: 'Editor',
    responsibilities: [
      'Cria e testa workflows em ambientes de sandbox',
      'Gerencia credenciais de integracao aprovadas',
      'Analisa webhooks recebidos e corrige erros',
    ],
    permissions: 'Acesso de escrita em projetos e conectores homologados',
  },
  {
    role: 'Observador',
    responsibilities: [
      'Consulta execucoes e dashboards operacionais',
      'Recebe alertas de incidentes e webhooks falhos',
    ],
    permissions: 'Somente leitura em dashboards, logs e relatorios',
  },
];

const apiCatalog = [
  {
    group: 'Projetos',
    description: 'Gerenciamento de workflows e publicacoes',
    endpoints: [
      { method: 'GET', path: '/api/projects', scope: 'projects:read', detail: 'Lista projetos com paginacao' },
      { method: 'POST', path: '/api/projects', scope: 'projects:write', detail: 'Cria novo projeto com versao inicial' },
      { method: 'POST', path: '/api/projects/{id}/deploy', scope: 'projects:deploy', detail: 'Publica configuracao ativa para producao' },
    ],
  },
  {
    group: 'Credenciais',
    description: 'Cofres e conectores autorizados',
    endpoints: [
      { method: 'GET', path: '/api/credentials', scope: 'credentials:read', detail: 'Lista credenciais por workspace' },
      { method: 'POST', path: '/api/credentials', scope: 'credentials:write', detail: 'Registra credencial criptografada' },
      { method: 'PATCH', path: '/api/credentials/{id}', scope: 'credentials:write', detail: 'Atualiza chaves e metadados' },
    ],
  },
  {
    group: 'Execucoes',
    description: 'Eventos e monitoramento de fluxos',
    endpoints: [
      { method: 'GET', path: '/api/runs', scope: 'runs:read', detail: 'Lista execucoes mais recentes' },
      { method: 'GET', path: '/api/runs/{id}', scope: 'runs:read', detail: 'Retorna detalhe completo da execucao' },
      { method: 'POST', path: '/api/runs/{id}/retry', scope: 'runs:write', detail: 'Agenda reprocessamento do fluxo' },
    ],
  },
];

const webhookCatalog = [
  {
    event: 'workflow.executed',
    payload: ['workflowId', 'runId', 'status', 'durationMs', 'traceId'],
    delivery: 'Enviado imediatamente apos a conclusao de cada execucao',
  },
  {
    event: 'workflow.failed',
    payload: ['workflowId', 'runId', 'errorCode', 'errorMessage', 'attempt'],
    delivery: 'Reenvio ate 5 vezes com exponencial backoff',
  },
  {
    event: 'credential.expiring',
    payload: ['credentialId', 'provider', 'expiresAt', 'workspaceId'],
    delivery: 'Emitido 15 dias antes do vencimento configurado',
  },
];

const accessMatrix = [
  {
    area: 'Console web',
    controls: ['SSO corporativo (SAML/OIDC)', 'MFA obrigatorio', 'Timeout de sessao de 30 minutos'],
    notes: 'Perfis e permissoes sincronizados com diretoria de TI via SCIM',
  },
  {
    area: 'APIs publicas',
    controls: ['Tokens pessoais com expiracao configuravel', 'Escopos granulares por recurso', 'Rate limit padrao de 120 req/min'],
    notes: 'Eventos criticos registrados em auditoria com retencao de 180 dias',
  },
  {
    area: 'Infraestrutura',
    controls: ['Isolamento por workspace', 'Criptografia em repouso (AES-256)', 'Backup incremental diario'],
    notes: 'Planos de continuidade revisados trimestralmente com area de plataforma',
  },
];

const supportChannels = [
  { label: 'Central de conhecimento', value: 'docs.fluxolab.com' },
  { label: 'Suporte prioritario', value: 'suporte@fluxolab.com' },
  { label: 'Status da plataforma', value: 'status.fluxolab.com' },
];
</script>

<template>
  <div class="docs-shell">
    <header class="docs-hero">
      <div class="docs-tag">FluxoLab</div>
      <h1>Documentacao oficial da plataforma</h1>
      <p>
        Guia vivo com arquitetura funcional, APIs e politicas de acesso para operar automacoes com seguranca.
      </p>
      <div class="docs-meta">
        <span>Ultima revisao: 05 out 2025</span>
        <span>Contato: plataforma@fluxolab.com</span>
      </div>
    </header>

    <div class="docs-layout">
      <nav class="docs-sidebar" aria-label="Indice da documentacao">
        <p class="docs-sidebar__title">Conteudo</p>
        <ul>
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">{{ section.label }}</a>
          </li>
        </ul>
      </nav>

      <main class="docs-content">
        <section id="visao" class="docs-section">
          <h2>Visao geral</h2>
          <p>
            A plataforma FluxoLab integra orquestracao de workflows, conectores de dados e ferramentas de monitoramento.
            Esta documentacao concentra as informacoes chave para equipes de produto, engenharia e operacao.
          </p>
          <div class="docs-grid">
            <article class="docs-card">
              <h3>Arquitetura</h3>
              <ul>
                <li>Engine de workflows com filas distribuidas</li>
                <li>API GraphQL e REST para integracao externa</li>
                <li>Monitoramento centralizado com alertas proativos</li>
              </ul>
            </article>
            <article class="docs-card">
              <h3>SLAs principais</h3>
              <ul>
                <li>Disponibilidade alvo: 99.9% mensal</li>
                <li>Tempo medio de execucao: &lt; 5 minutos</li>
                <li>Retencao de logs: 180 dias</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="versao" class="docs-section">
          <h2>Versao e roadmap</h2>
          <p>Resumo das entregas em producao e proximas janelas de manutencao.</p>
          <div class="docs-timeline">
            <article v-for="release in releaseSummary" :key="release.version" class="docs-release">
              <header>
                <span class="docs-release__version">{{ release.version }}</span>
                <span class="docs-release__status">{{ release.status }}</span>
              </header>
              <p class="docs-release__date">Liberado em {{ release.releasedAt }}</p>
              <ul>
                <li v-for="change in release.changes" :key="change">{{ change }}</li>
              </ul>
            </article>
          </div>
          <aside class="docs-note">
            <strong>Proxima janela:</strong> 18 out 2025 para atualizacao de conectores bancarios.
          </aside>
        </section>

        <section id="usuarios" class="docs-section">
          <h2>Usuarios e perfis</h2>
          <p>Perfis padrao com responsabilidades e nivel de acesso recomendado.</p>
          <div class="docs-grid docs-grid--three">
            <article v-for="profile in userProfiles" :key="profile.role" class="docs-card">
              <h3>{{ profile.role }}</h3>
              <p class="docs-card__muted">{{ profile.permissions }}</p>
              <ul>
                <li v-for="item in profile.responsibilities" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="apis" class="docs-section">
          <h2>APIs oficiais</h2>
          <p>Catalogo de recursos REST. Autenticacao via bearer token e escopos granulares.</p>
          <div class="docs-api-group" v-for="group in apiCatalog" :key="group.group">
            <header>
              <h3>{{ group.group }}</h3>
              <p>{{ group.description }}</p>
            </header>
            <table>
              <thead>
                <tr>
                  <th>Metodo</th>
                  <th>Rota</th>
                  <th>Escopo</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="endpoint in group.endpoints" :key="endpoint.path + endpoint.method">
                  <td><span class="docs-method">{{ endpoint.method }}</span></td>
                  <td><code>{{ endpoint.path }}</code></td>
                  <td>{{ endpoint.scope }}</td>
                  <td>{{ endpoint.detail }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <aside class="docs-note">
            <strong>Dica:</strong> utilize o header <code>X-Idempotency-Key</code> para evitar execucoes duplicadas em chamadas de escrita.
          </aside>
        </section>

        <section id="webhooks" class="docs-section">
          <h2>Webhooks e eventos</h2>
          <p>Eventos emitidos pela plataforma. Cada entrega inclui assinatura HMAC (header <code>X-Fluxo-Signature</code>).</p>
          <div class="docs-grid">
            <article v-for="hook in webhookCatalog" :key="hook.event" class="docs-card docs-card--hook">
              <header>
                <span class="docs-badge">{{ hook.event }}</span>
              </header>
              <p class="docs-card__muted">{{ hook.delivery }}</p>
              <h4>Payload</h4>
              <ul>
                <li v-for="field in hook.payload" :key="field">{{ field }}</li>
              </ul>
            </article>
          </div>
          <aside class="docs-note">
            Configure o endpoint de webhook em <strong>Configuracoes > Integracoes</strong> e valide a assinatura com o segredo do workspace.
          </aside>
        </section>

        <section id="acessos" class="docs-section">
          <h2>Politicas de acesso</h2>
          <p>Controles de seguranca aplicados por superficie da plataforma.</p>
          <table class="docs-access">
            <thead>
              <tr>
                <th>Superficie</th>
                <th>Controles</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in accessMatrix" :key="row.area">
                <td>{{ row.area }}</td>
                <td>
                  <ul>
                    <li v-for="control in row.controls" :key="control">{{ control }}</li>
                  </ul>
                </td>
                <td>{{ row.notes }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section id="suporte" class="docs-section">
          <h2>Suporte e escalacao</h2>
          <p>Como acionar o time de plataforma e acompanhar disponibilidade.</p>
          <ul class="docs-support">
            <li v-for="channel in supportChannels" :key="channel.label">
              <strong>{{ channel.label }}</strong>
              <span>{{ channel.value }}</span>
            </li>
          </ul>
          <aside class="docs-note">
            Incidentes de severidade alta devem ser registrados tambem via canal telefonico indicado na politica interna de continuidade.
          </aside>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.docs-shell {
  min-height: 100vh;
  background: radial-gradient(120% 120% at 100% 0%, rgba(99, 102, 241, 0.14), transparent),
    linear-gradient(180deg, #111827 0%, #0b0f19 100%);
  color: #e2e8f0;
  padding-bottom: 4rem;
}

.docs-hero {
  max-width: 960px;
  margin: 0 auto;
  padding: 4rem 1.5rem 2rem;
  text-align: center;
}

.docs-tag {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.15);
  color: #93c5fd;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.docs-hero h1 {
  margin-top: 1rem;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
}

.docs-hero p {
  margin-top: 1rem;
  color: rgba(226, 232, 240, 0.82);
  font-size: 1rem;
}

.docs-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.9);
}

.docs-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
}

.docs-sidebar {
  position: sticky;
  top: 1.5rem;
  align-self: flex-start;
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(10px);
}

.docs-sidebar__title {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.9);
}

.docs-sidebar ul {
  display: grid;
  gap: 0.6rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.docs-sidebar a {
  display: block;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  color: rgba(226, 232, 240, 0.9);
  background: transparent;
  transition: background 0.2s ease, color 0.2s ease;
  text-decoration: none;
  font-size: 0.92rem;
}

.docs-sidebar a:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
}

.docs-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.docs-section h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #f8fafc;
}

.docs-section p {
  color: rgba(203, 213, 225, 0.9);
  max-width: 760px;
  font-size: 1rem;
  line-height: 1.6;
}

.docs-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.docs-grid--three {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.docs-card {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.35);
}

.docs-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #f8fafc;
}

.docs-card h4 {
  margin: 1rem 0 0.5rem;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(148, 163, 184, 0.9);
}

.docs-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.45rem;
  color: rgba(226, 232, 240, 0.85);
  font-size: 0.95rem;
}

.docs-card__muted {
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.92rem;
  margin-bottom: 0.8rem;
}

.docs-timeline {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.docs-release {
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.66);
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.docs-release header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.docs-release__version {
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.25);
  color: #bfdbfe;
  font-size: 0.85rem;
  font-weight: 600;
}

.docs-release__status {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-release__date {
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.92rem;
  margin-bottom: 0.6rem;
}

.docs-release ul {
  list-style: disc;
  margin: 0;
  padding-left: 1.2rem;
  color: rgba(226, 232, 240, 0.85);
}

.docs-note {
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  background: rgba(30, 64, 175, 0.22);
  border: 1px solid rgba(99, 102, 241, 0.35);
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.95rem;
}

.docs-api-group {
  margin-top: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.docs-api-group header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.docs-api-group h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #f8fafc;
}

.docs-api-group p {
  margin: 0;
  color: rgba(148, 163, 184, 0.85);
}

.docs-api-group table {
  width: 100%;
  border-collapse: collapse;
}

.docs-api-group th,
.docs-api-group td {
  padding: 0.9rem 1.2rem;
  text-align: left;
  font-size: 0.92rem;
}

.docs-api-group th {
  background: rgba(59, 130, 246, 0.12);
  color: rgba(219, 234, 254, 0.9);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.docs-api-group tbody tr:nth-child(odd) {
  background: rgba(30, 41, 59, 0.5);
}

.docs-api-group tbody tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.7);
}

.docs-method {
  display: inline-block;
  min-width: 4.5rem;
  text-align: center;
  padding: 0.25rem 0.6rem;
  border-radius: 0.6rem;
  background: rgba(45, 212, 191, 0.18);
  color: #5eead4;
  font-weight: 600;
  font-size: 0.82rem;
}

code {
  font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: rgba(15, 23, 42, 0.85);
  border-radius: 0.5rem;
  padding: 0.15rem 0.4rem;
  color: #bae6fd;
  font-size: 0.85rem;
}

.docs-card--hook {
  border: 1px solid rgba(56, 189, 248, 0.25);
}

.docs-badge {
  display: inline-block;
  border-radius: 0.75rem;
  padding: 0.35rem 0.8rem;
  background: rgba(56, 189, 248, 0.22);
  color: #bae6fd;
  font-size: 0.82rem;
  font-weight: 600;
}

.docs-access {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.docs-access th,
.docs-access td {
  padding: 1rem 1.2rem;
  text-align: left;
  font-size: 0.95rem;
}

.docs-access thead {
  background: rgba(59, 130, 246, 0.18);
  color: rgba(219, 234, 254, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

.docs-access tbody tr:nth-child(odd) {
  background: rgba(30, 41, 59, 0.45);
}

.docs-access ul {
  list-style: disc;
  margin: 0;
  padding-left: 1.2rem;
  color: rgba(226, 232, 240, 0.9);
}

.docs-support {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0.9rem;
}

.docs-support li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.95rem;
}

.docs-support strong {
  font-weight: 600;
  color: #f8fafc;
}

@media (max-width: 1080px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }

  .docs-sidebar__title {
    width: 100%;
  }

  .docs-sidebar ul {
    width: 100%;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

@media (max-width: 640px) {
  .docs-hero {
    padding: 3rem 1.2rem 2rem;
  }

  .docs-meta {
    flex-direction: column;
    gap: 0.6rem;
  }

  .docs-support li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}
</style>
