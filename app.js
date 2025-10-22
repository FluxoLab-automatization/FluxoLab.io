
const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('login-submit');
const loginError = document.getElementById('login-error');
const loginScreen = document.getElementById('login-screen');
const workspaceScreen = document.getElementById('workspace-screen');
const userAvatarInitials = document.getElementById('user-avatar-initials');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayEmail = document.getElementById('user-display-email');
const workspaceStatus = document.getElementById('workspace-status');
const metricTotalWebhooks = document.getElementById('metric-total-webhooks');
const metricTotalEvents = document.getElementById('metric-total-events');
const metricTotalProjects = document.getElementById('metric-total-projects');
const projectsList = document.getElementById('projects-list');
const projectsEmpty = document.getElementById('projects-empty');
const activityList = document.getElementById('activity-list');
const eventList = document.getElementById('event-list');
const capabilityContainer = document.getElementById('workspace-capabilities');
const flowCanvasElement = document.getElementById('flow-canvas');
const flowLogicDetails = document.getElementById('flow-logic-details');

const TOKEN_STORAGE_KEY = 'fluxolab.token';
const USER_STORAGE_KEY = 'fluxolab.user';

const apiBaseUrl = resolveApiBaseUrl();
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const flowDefinition = {
  capabilities: [
    { id: 'it_ops', title: 'IT Ops', description: 'Onboard colaboradores e provisionar contas.', icon: '?', accent: '#6366f1', highlight: true },
    { id: 'sec_ops', title: 'Sec Ops', description: 'Enriquecer tickets de incidentes com contexto.', icon: '???', accent: '#0ea5e9' },
    { id: 'dev_ops', title: 'Dev Ops', description: 'Transformar linguagem natural em APIs.', icon: '??', accent: '#22c55e' },
    { id: 'sales', title: 'Sales', description: 'Gerar insights de clientes a partir de reviews.', icon: '??', accent: '#f97316' },
  ],
  nodes: [
    { id: 'trigger', type: 'trigger', title: "Formulario 'Novo Colaborador'", subtitle: 'Dispara quando o RH envia dados.', icon: '??', accent: '#38bdf8', x: 14, y: 48 },
    { id: 'agent', type: 'agent', title: 'Agente FluxoLab', subtitle: 'Orquestra validacoes, IA e integra APIs.', icon: '??', accent: '#818cf8', badges: ['Chat Model', 'Memoria'], x: 40, y: 48 },
    { id: 'condition', type: 'decision', title: 'Eh gestor?', subtitle: 'Verifica cargo e permissao solicitada.', icon: '??', accent: '#22d3ee', x: 59, y: 48 },
    { id: 'slackAdd', type: 'action', title: 'Adicionar ao canal', subtitle: 'Convida para #gestores-onboarding.', icon: '??', accent: '#fbbf24', x: 80, y: 32 },
    { id: 'slackUpdate', type: 'action', title: 'Atualizar perfil', subtitle: 'Aplica assinatura e grupos padrao.', icon: '??', accent: '#fbbf24', x: 80, y: 64 },
    { id: 'anthropic', type: 'integration', title: 'Anthropic Chat Model', subtitle: 'Resume informacoes do colaborador.', icon: '??', accent: '#a855f7', x: 30, y: 74 },
    { id: 'postgresMemory', type: 'integration', title: 'Postgres Memory', subtitle: 'Busca historico e evita duplicidade.', icon: '???', accent: '#0ea5e9', x: 42, y: 74 },
    { id: 'entra', type: 'integration', title: 'Microsoft Entra ID', subtitle: 'Provisiona licencas corporativas.', icon: '??', accent: '#6366f1', x: 54, y: 74 },
    { id: 'jira', type: 'integration', title: 'Jira Software', subtitle: 'Abre tarefa para follow-up.', icon: '??', accent: '#0284c7', x: 66, y: 74 },
  ],
  edges: [
    { from: 'trigger', to: 'agent', label: 'Dados normalizados', fromAnchor: 'right', toAnchor: 'left' },
    { from: 'agent', to: 'condition', label: 'Perfil analisado', fromAnchor: 'right', toAnchor: 'left' },
    { from: 'condition', to: 'slackAdd', label: 'Sim (gestor)', fromAnchor: 'right', toAnchor: 'left' },
    { from: 'condition', to: 'slackUpdate', label: 'Nao (squads)', fromAnchor: 'bottom', toAnchor: 'top' },
    { from: 'agent', to: 'anthropic', label: 'Briefing', style: 'dashed', fromAnchor: 'bottom', toAnchor: 'top' },
    { from: 'agent', to: 'postgresMemory', label: 'Consulta memoria', style: 'dashed', fromAnchor: 'bottom', toAnchor: 'top' },
    { from: 'agent', to: 'entra', label: 'Provisionar conta', style: 'dashed', fromAnchor: 'bottom', toAnchor: 'top' },
    { from: 'agent', to: 'jira', label: 'Abrir tarefa', style: 'dashed', fromAnchor: 'bottom', toAnchor: 'top' },
  ],
  steps: [
    { title: 'Captura da solicitacao', description: 'Formulario padroniza dados e dispara o fluxo.', outputs: ['Campos validados', 'Informacoes de gestor e equipe'] },
    { title: 'Analise pelo agente', description: 'FluxoLab agrega resumo com IA e memoria.', outputs: ['Resumo do colaborador', 'Checagem de duplicidade'] },
    { title: 'Provisionamento corporativo', description: 'Integra com Entra ID e Jira para abrir tarefas.', outputs: ['Conta criada', 'Ticket de acompanhamento'] },
    { title: 'Roteamento condicional', description: 'Define se e gestor para direcionar etapas no Slack.', outputs: ['Gestor: convite para canal', 'Time: atualizacao de perfil'] },
  ],
};
let authToken = null;
let currentUser = null;
let flowState = null;

document.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  renderCapabilities(flowDefinition.capabilities);
  renderFlow(flowDefinition);
  renderFlowLogic(flowDefinition.steps);
  const session = loadStoredSession();
  if (session) {
    setSession(session.token, session.user, { persist: false });
    showWorkspace();
    refreshSessionFromApi().catch((err) => {
      console.warn('Nao foi possivel validar a sessao armazenada:', err);
      handleUnauthorized('Sessao expirada, faca login novamente.');
    });
  } else {
    refreshFlowConnectors();
  }
});

window.addEventListener('resize', () => refreshFlowConnectors());

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearLoginError();

  const formData = new FormData(loginForm);
  const email = (formData.get('email') || '').toString().trim();
  const password = (formData.get('password') || '').toString();

  if (!email || !password) {
    showLoginError('Informe e-mail e senha.');
    return;
  }

  setButtonLoading(loginButton, true, 'Acessando...');

  try {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Nao foi possivel autenticar.');
    }
    await handleAuthenticatedSession(data.token, data.user, { persist: true });
    loginForm.reset();
  } catch (error) {
    console.error('Falha no login:', error);
    showLoginError(error.message || 'Falha inesperada ao autenticar.');
  } finally {
    setButtonLoading(loginButton, false, 'Acessar plataforma');
  }
});

async function handleAuthenticatedSession(token, user, { persist = true } = {}) {
  setSession(token, user, { persist });
  showWorkspace();
  await loadWorkspaceData();
}
function setSession(token, user, { persist = true } = {}) {
  authToken = token;
  currentUser = user;
  if (persist) {
    storeSession(token, user);
  }
  setWorkspaceUser(user);
}

async function refreshSessionFromApi() {
  const response = await authFetch('/auth/me');
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Nao foi possivel validar a sessao.');
  }
  if (data.user) {
    setSession(authToken, data.user, { persist: true });
  }
  await loadWorkspaceData();
}

async function loadWorkspaceData() {
  try {
    const response = await authFetch('/workspace/overview');
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Nao foi possivel carregar o painel.');
    }
    renderOverview(data.overview || {});
  } catch (err) {
    console.error('Erro ao carregar overview:', err);
    renderOverviewFallback(err.message);
  }
}

function renderOverview(overview) {
  if (!overview) {
    renderOverviewFallback('Nenhum dado disponivel.');
    return;
  }
  renderMetrics(overview.metrics);
  renderProjects(overview.projects, overview.onboarding);
  renderActivities(overview.activities);
  renderEvents(overview.recentWebhooks);
}
function renderMetrics(metrics = {}) {
  if (metricTotalWebhooks) metricTotalWebhooks.textContent = (metrics.totalWebhooks ?? 0).toString();
  if (metricTotalEvents) metricTotalEvents.textContent = (metrics.totalEvents ?? 0).toString();
  if (metricTotalProjects) metricTotalProjects.textContent = (metrics.totalProjects ?? 0).toString();
}

function renderProjects(projects = [], onboarding = []) {
  if (!projectsList || !projectsEmpty) return;
  projectsList.innerHTML = '';
  if (!projects.length) {
    projectsEmpty.classList.remove('hidden');
    if (onboarding?.length) {
      const steps = onboarding[0]?.steps || [];
      const checklist = document.createElement('ul');
      checklist.className = 'mt-4 text-left space-y-2 text-sm text-slate-600';
      steps.forEach((step) => {
        const li = document.createElement('li');
        li.className = 'flex items-start space-x-2';
        li.innerHTML = `<span class="mt-1 text-indigo-500">?</span><span>${step}</span>`;
        checklist.appendChild(li);
      });
      const existing = projectsEmpty.querySelector('ul');
      if (existing) existing.remove();
      projectsEmpty.appendChild(checklist);
    }
    return;
  }
  projectsEmpty.classList.add('hidden');
  projects.forEach((project) => {
    const card = document.createElement('article');
    card.className = 'rounded-xl border border-slate-200 bg-white shadow-sm p-5 flex flex-col space-y-3 hover:border-indigo-200 transition';
    const status = project.status === 'modelo' ? 'Modelo' : project.status || 'Em construcao';
    const updated = project.updatedAt ? formatDateTime(project.updatedAt) : 'Agora';
    const description = project.metadata?.description || 'Fluxo pronto para edicao e testes.';
    const tags = project.metadata?.tags || [];
    card.innerHTML = `
      <div class="flex items-start justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-indigo-500">${status}</span>
        <span class="text-xs text-slate-400">Atualizado ${updated}</span>
      </div>
      <h3 class="text-lg font-semibold text-slate-800">${project.title}</h3>
      <p class="text-sm text-slate-500">${description}</p>
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>ID: ${project.id}</span>
        <div class="flex items-center space-x-1">
          ${tags.map((tag) => `<span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">${tag}</span>`).join('')}
        </div>
      </div>
    `;
    projectsList.appendChild(card);
  });
}

function renderActivities(activities = []) {
  if (!activityList) return;
  activityList.innerHTML = '';
  if (!activities.length) {
    const empty = document.createElement('p');
    empty.className = 'text-sm text-slate-500';
    empty.textContent = 'Sem atividades registradas por enquanto.';
    activityList.appendChild(empty);
    return;
  }
  activities.forEach((activity) => {
    const item = document.createElement('div');
    item.className = 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-3';
    const created = activity.createdAt ? formatDateTime(activity.createdAt) : '';
    const payload = activity.payload || {};
    item.innerHTML = `
      <p class="text-sm text-slate-700 leading-snug">${activity.action || 'Atividade registrada'}</p>
      <div class="flex items-center justify-between text-xs text-slate-400 mt-2">
        <span>${activity.entityType || 'sistema'}</span>
        <span>${created}</span>
      </div>
    `;
    if (payload.linkHref && payload.linkText) {
      const link = document.createElement('a');
      link.href = payload.linkHref;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'mt-2 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700';
      link.textContent = payload.linkText;
      item.appendChild(link);
    }
    activityList.appendChild(item);
  });
}

function renderEvents(events = []) {
  if (!eventList) return;
  eventList.innerHTML = '';
  if (!events.length) {
    const empty = document.createElement('li');
    empty.className = 'text-slate-500';
    empty.textContent = 'Nenhum evento recente.';
    eventList.appendChild(empty);
    return;
  }
  events.forEach((event) => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between text-xs';
    const received = event.receivedAt ? formatDateTime(event.receivedAt) : 'Agora';
    const statusClass = event.status === 'processed' ? 'text-emerald-600' : 'text-amber-600';
    li.innerHTML = `
      <span class="font-medium text-slate-600">${event.type || 'evento'}</span>
      <span class="${statusClass}">${event.status}</span>
      <span class="text-slate-400">${received}</span>
    `;
    eventList.appendChild(li);
  });
}

function renderOverviewFallback(message) {
  renderMetrics();
  if (projectsList) {
    projectsList.innerHTML = '';
    const error = document.createElement('article');
    error.className = 'border border-rose-200 bg-rose-50 text-rose-600 rounded-xl p-4 text-sm';
    error.textContent = message || 'Nao foi possivel carregar os projetos.';
    projectsList.appendChild(error);
  }
  if (activityList) {
    activityList.innerHTML = '';
    const error = document.createElement('p');
    error.className = 'text-sm text-rose-600';
    error.textContent = message || 'Erro ao sincronizar atividades.';
    activityList.appendChild(error);
  }
  if (eventList) {
    eventList.innerHTML = '';
    const error = document.createElement('li');
    error.className = 'text-rose-600';
    error.textContent = message || 'Erro ao carregar eventos.';
    eventList.appendChild(error);
  }
}

function renderCapabilities(capabilities = []) {
  if (!capabilityContainer) return;
  capabilityContainer.innerHTML = '';
  if (!capabilities.length) {
    capabilityContainer.innerHTML = '<article class="capability-card capability-card--empty">Configure os departamentos autorizados.</article>';
    return;
  }
  capabilities.forEach((capability) => {
    const card = document.createElement('article');
    card.className = 'capability-card';
    if (capability.highlight) card.classList.add('capability-card--active');
    card.innerHTML = `
      <div class="capability-icon" style="color:${capability.accent || '#6366f1'}">${capability.icon || '?'}</div>
      <div>
        <p class="capability-title">${capability.title} <span class="capability-title-muted">pode</span></p>
        <p class="capability-description">${capability.description}</p>
      </div>
    `;
    capabilityContainer.appendChild(card);
  });
}

function renderFlow(flow) {
  if (!flowCanvasElement) return;
  flowCanvasElement.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('flow-connector-layer');
  flowCanvasElement.appendChild(svg);
  flow.nodes.forEach((node) => {
    const el = createFlowNode(node);
    flowCanvasElement.appendChild(el);
  });
  flowState = { canvas: flowCanvasElement, svg, edges: flow.edges };
  requestAnimationFrame(refreshFlowConnectors);
}

function createFlowNode(node) {
  const el = document.createElement('div');
  el.className = `flow-node flow-node--${node.type}`;
  el.id = `node-${node.id}`;
  el.style.setProperty('--flow-node-accent', node.accent || '#6366f1');
  el.style.left = `${node.x}%`;
  el.style.top = `${node.y}%`;
  el.innerHTML = `
    <div class="flow-node-icon">${node.icon || '?'}</div>
    <div class="flow-node-body">
      <p class="flow-node-title">${node.title}</p>
      ${node.subtitle ? `<p class="flow-node-subtitle">${node.subtitle}</p>` : ''}
      ${node.badges ? `<div class="flow-node-badges">${node.badges.map((badge) => `<span class="flow-node-badge">${badge}</span>`).join('')}</div>` : ''}
    </div>
  `;
  return el;
}

function renderFlowLogic(steps = []) {
  if (!flowLogicDetails) return;
  flowLogicDetails.innerHTML = '';
  steps.forEach((step, index) => {
    const card = document.createElement('article');
    card.className = 'flow-logic-card';
    card.innerHTML = `
      <div class="flow-logic-card-index">${String(index + 1).padStart(2, '0')}</div>
      <div>
        <h4 class="flow-logic-card-title">${step.title}</h4>
        <p class="flow-logic-card-description">${step.description}</p>
        ${step.outputs ? `<ul class="flow-logic-card-list">${step.outputs.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
      </div>
    `;
    flowLogicDetails.appendChild(card);
  });
}

function drawFlowConnectors(state) {
  if (!state) return;
  const { canvas, svg, edges } = state;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    svg.setAttribute('width', 0);
    svg.setAttribute('height', 0);
    return;
  }
  svg.setAttribute('width', rect.width);
  svg.setAttribute('height', rect.height);
  svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svg.innerHTML = '';
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'flow-arrow');
  marker.setAttribute('viewBox', '0 0 6 6');
  marker.setAttribute('refX', '5.4');
  marker.setAttribute('refY', '3');
  marker.setAttribute('markerWidth', '6');
  marker.setAttribute('markerHeight', '6');
  marker.setAttribute('orient', 'auto');
  const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  markerPath.setAttribute('d', 'M0 0 L6 3 L0 6 Z');
  markerPath.setAttribute('fill', '#a5b4fc');
  marker.appendChild(markerPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  edges.forEach((edge) => {
    const fromNode = canvas.querySelector(`#node-${edge.from}`);
    const toNode = canvas.querySelector(`#node-${edge.to}`);
    if (!fromNode || !toNode) return;
    const start = getAnchorPoint(fromNode.getBoundingClientRect(), rect, edge.fromAnchor || 'right');
    const end = getAnchorPoint(toNode.getBoundingClientRect(), rect, edge.toAnchor || 'left');
    const control = getBezierControls(start, end, edge.fromAnchor || 'right', edge.toAnchor || 'left');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${start.x} ${start.y} C ${control.c1x} ${control.c1y}, ${control.c2x} ${control.c2y}, ${end.x} ${end.y}`);
    path.setAttribute('class', `flow-connector ${edge.style === 'dashed' ? 'flow-connector--dashed' : ''}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#flow-arrow)');
    svg.appendChild(path);

    if (edge.label) {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'flow-connector-label');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2 + (edge.fromAnchor === 'bottom' && edge.toAnchor === 'top' ? -10 : -14);
      label.setAttribute('x', midX);
      label.setAttribute('y', midY);
      label.textContent = edge.label;
      svg.appendChild(label);
    }
  });
}

function getAnchorPoint(nodeRect, canvasRect, anchor) {
  switch (anchor) {
    case 'left':
      return { x: nodeRect.left - canvasRect.left, y: nodeRect.top - canvasRect.top + nodeRect.height / 2 };
    case 'right':
      return { x: nodeRect.right - canvasRect.left, y: nodeRect.top - canvasRect.top + nodeRect.height / 2 };
    case 'top':
      return { x: nodeRect.left - canvasRect.left + nodeRect.width / 2, y: nodeRect.top - canvasRect.top };
    case 'bottom':
      return { x: nodeRect.left - canvasRect.left + nodeRect.width / 2, y: nodeRect.bottom - canvasRect.top };
    default:
      return { x: nodeRect.right - canvasRect.left, y: nodeRect.top - canvasRect.top + nodeRect.height / 2 };
  }
}

function getBezierControls(start, end, fromAnchor, toAnchor) {
  const horizontal = Math.max(Math.abs(end.x - start.x) / 2, 60);
  if (fromAnchor === 'bottom' && toAnchor === 'top') {
    const vertical = Math.max(Math.abs(end.y - start.y) / 2, 60);
    return { c1x: start.x, c1y: start.y + vertical, c2x: end.x, c2y: end.y - vertical };
  }
  // Default horizontal connection
  const c1x = fromAnchor === 'left' ? start.x - horizontal : start.x + horizontal;
  const c2x = toAnchor === 'right' ? end.x + horizontal : end.x - horizontal;
  return { c1x, c1y: start.y, c2x, c2y: end.y };
}

function refreshFlowConnectors() {
  if (!flowState) return;
  drawFlowConnectors(flowState);
}
function renderFlowLogicFallback() {
  if (!flowLogicDetails) return;
  flowLogicDetails.innerHTML = '<article class="flow-logic-card">Defina os passos do fluxo para visualizar o encadeamento.</article>';
}

function resolveApiBaseUrl() {
  try {
    const origin = window.location.origin;
    if (origin && origin !== 'null') {
      return origin;
    }
  } catch (err) {
    console.warn('Nao foi possivel detectar origin da pagina, usando fallback.');
  }
  return 'http://localhost:3000';
}

function setWorkspaceUser(user) {
  if (!user) return;
  const displayName = user.displayName || user.email;
  userDisplayName.textContent = displayName;
  userDisplayEmail.textContent = user.email;
  userAvatarInitials.textContent = deriveInitials(displayName, user.email);
  if (workspaceStatus) {
    const baseStatus = workspaceStatus.dataset.default || 'Em construcao';
    if (user.lastLoginAt) {
      const date = new Date(user.lastLoginAt);
      workspaceStatus.textContent = `${baseStatus} - Ultimo acesso ${dateFormatter.format(date)}`;
    } else {
      workspaceStatus.textContent = baseStatus;
    }
  }
}

function showWorkspace() {
  clearLoginError();
  loginScreen.classList.add('hidden');
  workspaceScreen.classList.remove('hidden');
  requestAnimationFrame(() => refreshFlowConnectors());
}

function showLogin() {
  workspaceScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
}

function storeSession(token, user) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Nao foi possivel salvar a sessao localmente:', err);
  }
}

function clearSession() {
  authToken = null;
  currentUser = null;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.warn('Erro ao limpar dados locais:', err);
  }
}

function loadStoredSession() {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!token || !rawUser) return null;
    return { token, user: JSON.parse(rawUser) };
  } catch (err) {
    console.warn('Nao foi possivel recuperar sessao armazenada:', err);
    return null;
  }
}

async function authFetch(path, options = {}) {
  if (!authToken) throw new Error('Sessao nao encontrada.');
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${authToken}`);
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });
  if (response.status === 401) {
    handleUnauthorized('Sessao expirada, faca login novamente.');
  }
  return response;
}

function handleUnauthorized(message) {
  clearSession();
  showLoginError(message);
  showLogin();
}

function deriveInitials(name, fallbackEmail) {
  const source = name || fallbackEmail || 'FluxoLab';
  const parts = source.replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/).slice(0, 2);
  if (!parts.length) return 'FL';
  return parts.map((segment) => segment[0] || '').join('').toUpperCase().slice(0, 2) || 'FL';
}

function formatDateTime(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return dateFormatter.format(date);
}

function showLoginError(message) {
  if (!loginError) return;
  loginError.textContent = message;
  loginError.classList.remove('hidden');
}

function clearLoginError() {
  if (!loginError) return;
  loginError.classList.add('hidden');
  loginError.textContent = '';
}

function setButtonLoading(button, loading, loadingLabel) {
  if (!button) return;
  if (loading) {
    button.dataset.originalLabel = button.textContent;
    button.textContent = loadingLabel || 'Carregando...';
    button.disabled = true;
    button.classList.add('opacity-80', 'cursor-not-allowed');
  } else {
    const original = button.dataset.originalLabel || 'Enviar';
    button.textContent = original;
    button.disabled = false;
    button.classList.remove('opacity-80', 'cursor-not-allowed');
  }
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .skeleton-card {
      position: relative;
      overflow: hidden;
      background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 37%, #e2e8f0 63%);
      background-size: 400% 100%;
      animation: skeleton-loading 1.4s ease infinite;
    }
    @keyframes skeleton-loading { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
    .capability-card {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      box-shadow: 0 15px 35px -25px rgba(79, 70, 229, 0.35);
      transition: all 0.25s ease;
    }
    .capability-card:hover { transform: translateY(-4px); box-shadow: 0 25px 45px -30px rgba(79, 70, 229, 0.4); }
    .capability-card--active { border-color: rgba(99, 102, 241, 0.6); box-shadow: 0 25px 50px -20px rgba(79, 70, 229, 0.4); }
    .capability-card--empty { justify-content: center; color: #64748b; }
    .capability-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(99, 102, 241, 0.08);
      font-size: 1.5rem;
    }
    .capability-title { font-weight: 600; color: #0f172a; margin-bottom: 0.1rem; }
    .capability-title-muted { color: #94a3b8; font-weight: 400; font-size: 0.9rem; margin-left: 0.25rem; }
    .capability-description { font-size: 0.9rem; color: #64748b; line-height: 1.4; }
    #flow-canvas { position: relative; }
    .flow-connector-layer { position: absolute; inset: 0; pointer-events: none; }
    .flow-node {
      position: absolute;
      transform: translate(-50%, -50%);
      min-width: 180px;
      max-width: 240px;
      display: flex;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      border-radius: 1.5rem;
      border: 1px solid rgba(129, 140, 248, 0.25);
      background: rgba(15, 23, 42, 0.85);
      color: #e2e8f0;
      box-shadow: 0 15px 35px -25px rgba(79, 70, 229, 0.5);
      backdrop-filter: blur(6px);
    }
    .flow-node-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      background: rgba(99, 102, 241, 0.12);
      color: var(--flow-node-accent, #818cf8);
    }
    .flow-node-title { font-weight: 600; font-size: 0.95rem; color: #f8fafc; }
    .flow-node-subtitle { font-size: 0.75rem; color: #cbd5f5; line-height: 1.4; }
    .flow-node-badges { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.35rem; }
    .flow-node-badge { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.15rem 0.45rem; border-radius: 999px; background: rgba(129, 140, 248, 0.18); color: rgba(209, 213, 255, 0.95); }
    .flow-node--integration { border-style: dashed; border-color: rgba(148, 163, 184, 0.35); opacity: 0.92; }
    .flow-node--action { border-color: rgba(250, 204, 21, 0.35); box-shadow: 0 18px 35px -22px rgba(250, 204, 21, 0.35); }
    .flow-connector { stroke: rgba(165, 180, 252, 0.65); stroke-width: 2.2; }
    .flow-connector--dashed { stroke-dasharray: 6 6; stroke: rgba(129, 140, 248, 0.45); }
    .flow-connector-label { font-size: 0.7rem; fill: #cbd5f5; text-shadow: 0 1px 2px rgba(15, 23, 42, 0.8); }
    .flow-logic-card {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.2rem;
      border-radius: 1.25rem;
      border: 1px solid rgba(129, 140, 248, 0.25);
      background: rgba(30, 41, 59, 0.65);
      color: #e2e8f0;
      backdrop-filter: blur(6px);
    }
    .flow-logic-card-index { width: 36px; height: 36px; border-radius: 14px; background: rgba(129, 140, 248, 0.2); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.8rem; }
    .flow-logic-card-title { font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem; }
    .flow-logic-card-description { font-size: 0.8rem; color: #cbd5f5; line-height: 1.4; }
    .flow-logic-card-list { margin-top: 0.6rem; padding-left: 1rem; display: grid; gap: 0.3rem; list-style: disc; }
  `;
  document.head.appendChild(style);
}
