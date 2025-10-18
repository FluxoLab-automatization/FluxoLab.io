<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  watchEffect,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../stores/session.store';
import {
  createWorkflow,
  executeWorkflow,
  listWorkflowCredentials,
  type WorkflowDefinitionPayload,
  type WorkflowCredentialSummary,
} from '../services/workflows.service';

interface WorkflowNode {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width?: number;
  icon: string;
  accent: string;
  badges?: Array<{ icon: string; label: string }>;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

const nodes: WorkflowNode[] = [];

const edges: WorkflowEdge[] = [];

const canvasRef = ref<HTMLElement | null>(null);
const nodeRefs = reactive<Record<string, HTMLElement | null>>({});
const edgePaths = ref<string[]>([]);
const projectName = ref('');
const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const { token } = storeToRefs(sessionStore);

const workflowDefinition = ref<WorkflowDefinitionPayload | null>(null);
const createdWorkflowId = ref<string | null>(null);
const saving = ref(false);
const executionResult = ref<string | null>(null);
const workflowJson = computed(() =>
  workflowDefinition.value ? JSON.stringify(workflowDefinition.value, null, 2) : '',
);
const credentials = ref<WorkflowCredentialSummary[]>([]);
const credentialsLoading = ref(false);
const credentialsError = ref<string | null>(null);
const selectedCredentialId = ref<string>('');

function registerNodeRef(id: string, el: HTMLElement | null) {
  nodeRefs[id] = el;
}

function computePaths() {
  const canvasRect = canvasRef.value?.getBoundingClientRect();
  if (!canvasRect) {
    edgePaths.value = [];
    return;
  }

  const paths: string[] = [];
  const offsetX = canvasRect.left;
  const offsetY = canvasRect.top;

  const getAnchor = (rect: DOMRect | undefined, side: 'left' | 'right') => {
    if (!rect) return null;
    const x = side === 'left' ? rect.left - offsetX : rect.right - offsetX;
    const y = rect.top - offsetY + rect.height / 2;
    return { x, y };
  };

  edges.forEach((edge) => {
    const fromRect = nodeRefs[edge.from]?.getBoundingClientRect();
    const toRect = nodeRefs[edge.to]?.getBoundingClientRect();
    const start = getAnchor(fromRect, 'right');
    const end = getAnchor(toRect, 'left');
    if (!start || !end) return;

    const delta = Math.max(80, (end.x - start.x) / 2);
    const d = `M ${start.x} ${start.y} C ${start.x + delta} ${start.y}, ${end.x - delta} ${end.y}, ${end.x} ${end.y}`;
    paths.push(d);
  });

  edgePaths.value = paths;
}

function schedulePaths() {
  nextTick(() => {
    computePaths();
  });
}

onMounted(() => {
  schedulePaths();
  window.addEventListener('resize', computePaths);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', computePaths);
});

watchEffect(() => {
  schedulePaths();
});

async function loadCredentials() {
  if (!token.value) {
    credentials.value = [];
    selectedCredentialId.value = '';
    return;
  }
  credentialsLoading.value = true;
  credentialsError.value = null;
  try {
    const response = await listWorkflowCredentials(token.value);
    credentials.value = response.credentials;
    if (!selectedCredentialId.value && response.credentials.length > 0) {
      selectedCredentialId.value = response.credentials[0].id;
    }
  } catch (error) {
    credentialsError.value =
      error instanceof Error ? error.message : 'Não foi possível carregar credenciais.';
  } finally {
    credentialsLoading.value = false;
  }
}

watch(
  () => token.value,
  (next) => {
    if (next) {
      loadCredentials().catch(() => {
        credentialsError.value = 'Falha ao carregar credenciais.';
      });
    } else {
      credentials.value = [];
      selectedCredentialId.value = '';
    }
  },
  { immediate: true },
);

function applyPilotWorkflow() {
  const pilotNodes: WorkflowNode[] = [
    { id: 'webhookIn', title: 'Webhook Trigger', icon: 'WEB', accent: '#38bdf8', x: 80, y: 140 },
    { id: 'setVars', title: 'Definir Variaveis', icon: 'SET', accent: '#facc15', x: 300, y: 140 },
    { id: 'smtpSend', title: 'Enviar Email', icon: 'MAIL', accent: '#f472b6', x: 520, y: 140 },
    { id: 'respond', title: 'Responder', icon: 'RESP', accent: '#22c55e', x: 750, y: 140 },
  ];
  const pilotEdges: WorkflowEdge[] = [
    { from: 'webhookIn', to: 'setVars' },
    { from: 'setVars', to: 'smtpSend' },
    { from: 'smtpSend', to: 'respond' },
  ];

  nodes.splice(0, nodes.length, ...pilotNodes);
  edges.splice(0, edges.length, ...pilotEdges);
  projectName.value = 'Webhook to Email (Piloto)';
  const credentialId = selectedCredentialId.value || credentials.value[0]?.id || 'cred-smtp-default';
  workflowDefinition.value = {
    nodes: [
      { id: 'webhookIn', type: 'webhook.in', params: { respondMode: 'via_node' } },
      {
        id: 'setVars',
        type: 'set',
        params: {
          assign: {
            email: '{{$json.email}}',
            subject: '{{$json.subject ?? "FluxoLab Piloto"}}',
            body: '{{$json.body}}',
          },
        },
      },
      {
        id: 'smtpSend',
        type: 'smtp.send',
        params: {
          credentialId,
          from: 'no-reply@fluxolab.dev',
          to: '{{$json.email}}',
          subject: '{{$json.subject}}',
          text: '{{$json.body}}',
        },
      },
      {
        id: 'respond',
        type: 'webhook.respond',
        params: {
          status: 200,
          json: {
            status: 'sent',
            to: '{{$json.email}}',
          },
        },
      },
    ],
    connections: [
      { from: 'webhookIn', to: 'setVars' },
      { from: 'setVars', to: 'smtpSend' },
      { from: 'smtpSend', to: 'respond' },
    ],
  };
  executionResult.value = null;
  schedulePaths();
}

async function saveWorkflow() {
  if (!token.value) {
    executionResult.value = 'Faça login para salvar o workflow.';
    return;
  }
  if (!workflowDefinition.value) {
    executionResult.value = 'Nenhum workflow carregado.';
    return;
  }
  saving.value = true;
  try {
    const response = await createWorkflow(token.value, {
      name: projectName.value || 'Workflow Piloto',
      definition: workflowDefinition.value,
      tags: ['pilot'],
    });
    createdWorkflowId.value = response.workflow.id;
    executionResult.value = `Workflow criado: ${response.workflow.id}`;
  } catch (error) {
    executionResult.value =
      error instanceof Error ? error.message : 'Falha ao salvar workflow.';
  } finally {
    saving.value = false;
  }
}

async function executeWorkflowTest() {
  if (!token.value) {
    executionResult.value = 'Faça login para executar o workflow.';
    return;
  }
  if (!createdWorkflowId.value) {
    executionResult.value = 'Salve o workflow antes de testar.';
    return;
  }
  saving.value = true;
  try {
    const response = await executeWorkflow(token.value, createdWorkflowId.value, {
      email: 'pilot@example.com',
      subject: 'FluxoLab Piloto',
      body: 'Workflow executado com sucesso!',
    });
    executionResult.value = `Execução iniciada: ${response.executionId}`;
  } catch (error) {
    executionResult.value =
      error instanceof Error ? error.message : 'Falha ao executar workflow.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="builder">
    <div class="builder__trial">
      <div class="trial__info">
        <span class="trial__icon">⏱️</span>
        <span>7 dias restantes na sua avaliação FluxoLab</span>
        <div class="trial__progress">
          <div class="trial__progress-fill" />
        </div>
        <span>2/2000 execuções</span>
      </div>
      <button class="trial__upgrade" type="button">Fazer upgrade</button>
    </div>

    <div class="builder__layout">
      <aside class="builder__sidebar">
        <div class="sidebar__brand">FluxoLab</div>
        <nav class="sidebar__nav">
          <p class="sidebar__section">Workspaces</p>
          <router-link
            :to="{ name: 'dashboard' }"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': route.name === 'dashboard' }"
          >
            <span>Overview</span>
          </router-link>
          <router-link
            :to="{ name: 'workflow-builder' }"
            class="sidebar__item"
            :class="{ 'sidebar__item--active': route.name === 'workflow-builder' }"
          >
            <span>Projetos</span>
          </router-link>
          <a href="#" class="sidebar__item">
            <span>Templates</span>
          </a>
          <a href="#" class="sidebar__item">
            <span>Variáveis</span>
          </a>
          <a href="#" class="sidebar__item">
            <span>Insights</span>
          </a>
        </nav>

        <footer class="sidebar__footer">
          <div class="sidebar__profile">
            <span class="sidebar__avatar">KS</span>
            <div>
              <p>Kelven Silva</p>
              <small>Administrador</small>
            </div>
          </div>
        </footer>
      </aside>

      <main class="builder__main">
        <header class="canvas-header">
          <div class="canvas-header__title">
            <p class="canvas-header__path">Workspaces / Projetos</p>
            <input
              v-model="projectName"
              type="text"
              class="canvas-header__input"
              placeholder="Nome do workflow"
            />
          </div>
          <div class="canvas-header__actions">
            <div class="credential-select">
              <label>
                <span>Credencial SMTP</span>
                <select
                  v-model="selectedCredentialId"
                  :disabled="credentialsLoading || credentials.length === 0"
                >
                  <option v-if="credentialsLoading" value="">Carregando...</option>
                  <option v-for="cred in credentials" :key="cred.id" :value="cred.id">
                    {{ cred.name }}
                  </option>
                </select>
              </label>
              <router-link
                class="credential-manage-link"
                :to="{ name: 'settings', params: { section: 'integrations' } }"
              >
                Gerenciar
              </router-link>
            </div>
            <button type="button" class="canvas-header__btn" @click="applyPilotWorkflow">
              Workflow de exemplo
            </button>
            <button
              type="button"
              class="canvas-header__btn"
              :disabled="saving"
              @click="saveWorkflow"
            >
              {{ saving ? 'Salvando...' : 'Salvar workflow' }}
            </button>
            <button
              type="button"
              class="canvas-header__btn"
              :disabled="saving || !createdWorkflowId"
              @click="executeWorkflowTest"
            >
              Executar teste
            </button>
          </div>
        </header>

        <section ref="canvasRef" class="workflow-canvas">
          <div v-if="nodes.length === 0" class="canvas-empty-state">
            <p>Comece adicionando um nó ao seu fluxo.</p>
            <button type="button" class="canvas-add-node" @click="applyPilotWorkflow">+</button>
          </div>
          <div v-else class="canvas-preview">
            <pre>{{ workflowJson }}</pre>
            <p class="canvas-preview__hint">
              Ajuste os nós visualmente e envie para a API utilizando os botões acima.
            </p>
            <p v-if="credentials.length === 0" class="canvas-preview__hint">
              Nenhuma credencial disponível. Crie no painel de Settings &gt; Integrações.
            </p>
            <p v-if="executionResult" class="canvas-preview__feedback">{{ executionResult }}</p>
            <p v-if="credentialsError" class="canvas-preview__feedback error">{{ credentialsError }}</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.builder {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #121212;
  color: #e5e7eb;
}

.builder__trial {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(17, 24, 39, 0.95);
  font-size: 0.75rem;
  color: #9ca3af;
}

.trial__info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.trial__icon {
  font-size: 1rem;
}

.trial__progress {
  width: 120px;
  height: 0.4rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.25);
  overflow: hidden;
}

.trial__progress-fill {
  width: 25%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6366f1, #22d3ee);
}

.trial__upgrade {
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  border-radius: 0.6rem;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
}

.builder__layout {
  flex: 1;
  display: flex;
  min-height: 0;
}

.builder__sidebar {
  width: 240px;
  background: #171717;
  border-right: 1px solid rgba(63, 63, 70, 0.6);
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.sidebar__brand {
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.sidebar__nav {
  display: grid;
  gap: 0.45rem;
  font-size: 0.85rem;
}

.sidebar__section {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(148, 163, 184, 0.65);
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.75rem;
  color: #9ca3af;
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar__item:hover {
  background: rgba(63, 63, 70, 0.45);
  color: #f3f4f6;
}

.sidebar__item--active {
  background: #252525;
  color: white;
}

.sidebar__footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(63, 63, 70, 0.6);
}

.sidebar__profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar__avatar {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  font-weight: 600;
}

.builder__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1), transparent 55%),
    radial-gradient(circle at 70% 10%, rgba(244, 63, 94, 0.12), transparent 60%),
    #121212;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.75rem;
  border-bottom: 1px solid rgba(63, 63, 70, 0.6);
  flex-wrap: wrap;
  gap: 1rem;
}

.canvas-header__path {
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.75);
}

.canvas-header__title {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.canvas-header__input {
  font-size: 1.6rem;
  font-weight: 600;
  color: #f8fafc;
  background: transparent;
  border: none;
  border-bottom: 1px dashed rgba(99, 102, 241, 0.3);
  padding: 0 0 0.2rem;
  outline: none;
  max-width: 360px;
}

.canvas-header__input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

.canvas-header__input:focus {
  border-bottom-color: rgba(99, 102, 241, 0.8);
}

.canvas-header__actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.82rem;
  color: rgba(226, 232, 240, 0.75);
}

.canvas-header__btn {
  padding: 0.45rem 0.9rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: rgba(63, 63, 70, 0.25);
  color: #f3f4f6;
}

.canvas-header__btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.credential-select {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  background: rgba(17, 24, 39, 0.68);
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.6rem;
  padding: 0.55rem 0.8rem;
}

.credential-select span {
  font-size: 0.78rem;
  color: rgba(226, 232, 240, 0.75);
}

.credential-select select {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
  border-radius: 0.45rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}

.credential-manage-link {
  font-size: 0.75rem;
  color: #a5b4fc;
  text-decoration: underline;
}

.credential-manage-link:hover {
  color: #c7d2fe;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.toggle__track {
  width: 2.6rem;
  height: 1.2rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.35);
  display: inline-flex;
  align-items: center;
  padding: 0.15rem;
}

.toggle__thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: white;
  transition: transform 0.2s ease;
}

.workflow-canvas {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.08) 1px, transparent 0);
  background-size: 25px 25px;
}


.canvas-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(226, 232, 240, 0.7);
  font-size: 0.9rem;
}

.canvas-add-node {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: rgba(29, 31, 32, 0.9);
  font-size: 1.6rem;
  display: grid;
  place-items: center;
  color: #f3f4f6;
}

.canvas-preview {
  position: absolute;
  inset: 2rem;
  max-width: 520px;
  max-height: 360px;
  background: rgba(17, 24, 39, 0.92);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 1.2rem;
  padding: 1.2rem;
  overflow: auto;
  backdrop-filter: blur(10px);
}

.canvas-preview pre {
  margin: 0 0 1rem 0;
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  color: #e2e8f0;
}

.canvas-preview__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
  margin: 0 0 0.5rem 0;
}

.canvas-preview__feedback {
  font-size: 0.78rem;
  color: #a855f7;
  margin: 0;
}

.canvas-preview__feedback.error {
  color: #f87171;
}

@media (max-width: 1200px) {
  .builder__sidebar {
    display: none;
  }

  .canvas-header {
    justify-content: center;
    text-align: center;
  }
}
</style>




