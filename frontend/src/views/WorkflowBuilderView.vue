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
import WhatsappConnector from '@/components/WhatsappConnector.vue';
import whatsappIcon from '@/assets/workflow/whatsapp.png';
import botIcon from '@/assets/workflow/bot.png';
import googleIcon from '@/assets/workflow/google.png';
import mailIcon from '@/assets/workflow/mail.png';
import browserIcon from '@/assets/workflow/browser.png';
import databaseIcon from '@/assets/workflow/database.png';
import decisionIcon from '@/assets/workflow/decision.png';
import splitIcon from '@/assets/workflow/split.png';
import settingIcon from '@/assets/workflow/setting.png';

type NodeType =
  | 'whatsapp.trigger'
  | 'whatsapp.send'
  | 'http.trigger'
  | 'http.request'
  | 'email.trigger'
  | 'email.send'
  | 'db.trigger'
  | 'schedule.trigger'
  | 'bot.trigger'
  | 'ai.agent'
  | 'ai.chat-model'
  | 'memory.window-buffer'
  | 'logic.decision'
  | 'logic.split';

interface NodeField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  helper?: string;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
}

interface NodeTemplate {
  type: NodeType;
  label: string;
  subtitle?: string;
  icon: string;
  accent: string;
  defaults: Record<string, unknown>;
  fields: NodeField[];
}

interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  icon: string;
  accent: string;
  config: Record<string, unknown>;
}

interface WorkflowEdge {
  from: string;
  to: string;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'whatsapp.trigger',
    label: 'WhatsApp • entrada',
    subtitle: 'Recebe mensagens',
    icon: whatsappIcon,
    accent: '#22c55e',
    defaults: {
      channel: 'primary',
      events: ['message.received'],
    },
    fields: [
      { key: 'channel', label: 'Canal', type: 'text', placeholder: 'primary' },
      {
        key: 'events',
        label: 'Eventos',
        type: 'textarea',
        placeholder: 'message.received',
        helper: 'Separe múltiplos eventos com vírgula.',
      },
    ],
  },
  {
    type: 'whatsapp.send',
    label: 'WhatsApp • resposta',
    subtitle: 'Enviar mensagem',
    icon: whatsappIcon,
    accent: '#16a34a',
    defaults: {
      to: '{{ trigger.payload.from }}',
      message: 'Obrigado! Já recebemos sua mensagem.',
    },
    fields: [
      { key: 'to', label: 'Destino', type: 'text', placeholder: '{{ trigger.payload.from }}' },
      { key: 'message', label: 'Mensagem', type: 'textarea', placeholder: 'Conteúdo a enviar.' },
    ],
  },
  {
    type: 'http.trigger',
    label: 'Webhook HTTP',
    subtitle: 'Recebe requisições',
    icon: browserIcon,
    accent: '#3b82f6',
    defaults: {
      path: '/hooks/lead',
      method: 'POST',
      secret: '',
    },
    fields: [
      { key: 'path', label: 'Path', type: 'text', placeholder: '/hooks/lead' },
      { key: 'method', label: 'Método', type: 'text', placeholder: 'POST' },
      { key: 'secret', label: 'Token secreto', type: 'text', placeholder: 'Opcional' },
    ],
  },
  {
    type: 'http.request',
    label: 'Chamada HTTP',
    subtitle: 'Integra APIs externas',
    icon: browserIcon,
    accent: '#60a5fa',
    defaults: {
      method: 'POST',
      url: '',
      headers: '',
      body: '',
    },
    fields: [
      { key: 'method', label: 'Método', type: 'text', placeholder: 'POST' },
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api...' },
      { key: 'headers', label: 'Headers', type: 'textarea', placeholder: 'JSON com cabeçalhos.' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Payload em JSON.' },
    ],
  },
  {
    type: 'email.trigger',
    label: 'E-mail • entrada',
    subtitle: 'Nova mensagem',
    icon: mailIcon,
    accent: '#f97316',
    defaults: {
      provider: 'imap',
      folder: 'INBOX',
    },
    fields: [
      { key: 'provider', label: 'Provedor', type: 'text', placeholder: 'imap | gmail' },
      { key: 'folder', label: 'Pasta', type: 'text', placeholder: 'INBOX' },
    ],
  },
  {
    type: 'email.send',
    label: 'E-mail • resposta',
    subtitle: 'Enviar e-mail',
    icon: mailIcon,
    accent: '#fb923c',
    defaults: {
      to: '',
      subject: '',
      text: '',
    },
    fields: [
      { key: 'to', label: 'Destinatário', type: 'text', placeholder: 'cliente@dominio.com' },
      { key: 'subject', label: 'Assunto', type: 'text', placeholder: 'Obrigado pelo contato' },
      { key: 'text', label: 'Corpo', type: 'textarea', placeholder: 'Mensagem em texto simples.' },
    ],
  },
  {
    type: 'db.trigger',
    label: 'Postgres',
    subtitle: 'Mudança na tabela',
    icon: databaseIcon,
    accent: '#0ea5e9',
    defaults: {
      table: 'public.leads',
      mode: 'insert',
    },
    fields: [
      { key: 'table', label: 'Tabela', type: 'text', placeholder: 'public.leads' },
      {
        key: 'mode',
        label: 'Evento',
        type: 'select',
        options: [
          { label: 'Inserção', value: 'insert' },
          { label: 'Atualização', value: 'update' },
          { label: 'Remoção', value: 'delete' },
        ],
      },
    ],
  },
  {
    type: 'schedule.trigger',
    label: 'Agendamento',
    subtitle: 'Cron / intervalo',
    icon: settingIcon,
    accent: '#a855f7',
    defaults: {
      cron: '0 * * * *',
      timezone: 'America/Sao_Paulo',
    },
    fields: [
      { key: 'cron', label: 'Expressão cron', type: 'text', placeholder: '0 * * * *' },
      { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'America/Sao_Paulo' },
    ],
  },
  {
    type: 'bot.trigger',
    label: 'Assistente bot',
    subtitle: 'Sessão conversacional',
    icon: botIcon,
    accent: '#8b5cf6',
    defaults: {
      channel: 'whatsapp',
      sessionTtl: 900,
    },
    fields: [
      { key: 'channel', label: 'Canal', type: 'text', placeholder: 'whatsapp' },
      { key: 'sessionTtl', label: 'TTL sessão (s)', type: 'number', min: 60, max: 86400, placeholder: '900' },
    ],
  },
  {
    type: 'ai.agent',
    label: 'Agente IA',
    subtitle: 'Orquestra ferramentas',
    icon: botIcon,
    accent: '#6366f1',
    defaults: {
      chatModelNodeId: '',
      memoryNodeId: '',
      instructions: 'Responda sempre de forma clara e amigável.',
    },
    fields: [
      { key: 'chatModelNodeId', label: 'Nó do modelo', type: 'text', placeholder: 'ID do nó LLM' },
      { key: 'memoryNodeId', label: 'Nó de memória', type: 'text', placeholder: 'Opcional' },
      { key: 'instructions', label: 'Instruções', type: 'textarea', placeholder: 'Tom e objetivo do agente.' },
    ],
  },
  {
    type: 'ai.chat-model',
    label: 'Gemini chat',
    subtitle: 'Modelo conversacional',
    icon: googleIcon,
    accent: '#f97316',
    defaults: {
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      apiKeySecret: '{{ secrets.gemini }}',
    },
    fields: [
      { key: 'provider', label: 'Provedor', type: 'text', placeholder: 'gemini' },
      { key: 'model', label: 'Modelo', type: 'text', placeholder: 'gemini-1.5-flash' },
      { key: 'apiKeySecret', label: 'Segredo', type: 'text', placeholder: '{{ secrets.gemini }}' },
    ],
  },
  {
    type: 'memory.window-buffer',
    label: 'Memória curta',
    subtitle: 'Janela deslizante',
    icon: databaseIcon,
    accent: '#0ea5e9',
    defaults: {
      size: 4,
      strategy: 'sliding',
    },
    fields: [
      { key: 'size', label: 'Tamanho', type: 'number', min: 1, max: 12, placeholder: '4' },
      { key: 'strategy', label: 'Estratégia', type: 'text', placeholder: 'sliding' },
    ],
  },
  {
    type: 'logic.decision',
    label: 'Decisão',
    subtitle: 'Regras',
    icon: decisionIcon,
    accent: '#64748b',
    defaults: {
      expression: 'data.score > 0',
    },
    fields: [
      {
        key: 'expression',
        label: 'Expressão',
        type: 'textarea',
        placeholder: 'Ex.: data.score > 0',
        helper: 'Use JSONata ou JavaScript simples.',
      },
    ],
  },
  {
    type: 'logic.split',
    label: 'Dividir itens',
    subtitle: 'Iterar coleção',
    icon: splitIcon,
    accent: '#22d3ee',
    defaults: {
      collectionPath: 'data.items',
      concurrency: 2,
    },
    fields: [
      { key: 'collectionPath', label: 'Caminho', type: 'text', placeholder: 'data.items' },
      { key: 'concurrency', label: 'Concorrência', type: 'number', min: 1, max: 10, placeholder: '2' },
    ],
  },
];

const nodeTemplateMap = nodeTemplates.reduce<Record<NodeType, NodeTemplate>>((acc, template) => {
  acc[template.type] = template;
  return acc;
}, {} as Record<NodeType, NodeTemplate>);

const nodes = ref<WorkflowNode[]>([]);
const edges = ref<WorkflowEdge[]>([]);

const canvasRef = ref<HTMLElement | null>(null);
const nodeRefs = reactive<Record<string, HTMLElement | null>>({});
const edgePaths = ref<string[]>([]);
const projectName = ref('');
const route = useRoute();
const router = useRouter();
const sessionStore = useSessionStore();
const { token } = storeToRefs(sessionStore);

const workflowDefinition = ref<WorkflowDefinitionPayload>({
  nodes: [],
  connections: [],
});
const createdWorkflowId = ref<string | null>(null);
const saving = ref(false);
const executionResult = ref<string | null>(null);
const credentials = ref<WorkflowCredentialSummary[]>([]);
const credentialsLoading = ref(false);
const credentialsError = ref<string | null>(null);
const selectedCredentialId = ref<string>('');
const selectedNodeId = ref<string | null>(null);

const workflowJson = computed(() => JSON.stringify(workflowDefinition.value, null, 2));
const activeNode = computed(() =>
  nodes.value.find((node) => node.id === selectedNodeId.value) ?? null,
);
const activeTemplate = computed(() =>
  activeNode.value ? nodeTemplateMap[activeNode.value.type] ?? null : null,
);

function registerNodeRef(id: string, el: Element | null) {
  nodeRefs[id] = (el as HTMLElement | null);
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

  edges.value.forEach((edge) => {
    const fromRect = nodeRefs[edge.from]?.getBoundingClientRect();
    const toRect = nodeRefs[edge.to]?.getBoundingClientRect();
    const start = getAnchor(fromRect, 'right');
    const end = getAnchor(toRect, 'left');
    if (!start || !end) return;

    const delta = Math.max(80, (end.x - start.x) / 2);
    paths.push(`M ${start.x} ${start.y} C ${start.x + delta} ${start.y}, ${end.x - delta} ${end.y}, ${end.x} ${end.y}`);
  });

  edgePaths.value = paths;
}

function schedulePaths() {
  nextTick(() => computePaths());
}

onMounted(() => {
  schedulePaths();
  window.addEventListener('resize', computePaths);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', computePaths);
});

watchEffect(() => schedulePaths());

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

function generateNodeId(type: NodeType) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${type}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${type}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneDefaults<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function instantiateNode(type: NodeType, overrides: Partial<WorkflowNode> = {}): WorkflowNode {
  const template = nodeTemplateMap[type];
  if (!template) {
    throw new Error(`Template não encontrado para ${type}`);
  }

  const config = overrides.config
    ? { ...cloneDefaults(template.defaults), ...overrides.config }
    : cloneDefaults(template.defaults);

  return {
    id: overrides.id ?? generateNodeId(type),
    type,
    title: template.label,
    subtitle: template.subtitle,
    icon: template.icon,
    accent: template.accent,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    config,
  };
}

function addNodeFromTemplate(type: NodeType) {
  const node = instantiateNode(type, {
    x: 120 + nodes.value.length * 220,
    y: 160 + (nodes.value.length % 2) * 140,
  });
  nodes.value.push(node);
  selectedNodeId.value = node.id;
  syncWorkflowDefinition();
  schedulePaths();
}

function syncWorkflowDefinition() {
  workflowDefinition.value = {
    nodes: nodes.value.map((node) => ({
      id: node.id,
      type: node.type,
      params: { ...node.config },
    })),
    connections: edges.value.map((edge) => ({
      from: edge.from,
      to: edge.to,
    })),
  };
}

watch(
  nodes,
  () => {
    syncWorkflowDefinition();
    schedulePaths();
  },
  { deep: true },
);

watch(
  edges,
  () => {
    syncWorkflowDefinition();
    schedulePaths();
  },
  { deep: true },
);

function selectNode(id: string) {
  selectedNodeId.value = id;
}

function iconStyle(icon: string) {
  return {
    backgroundImage: `url(${icon})`,
  };
}

function nodeCardStyle(node: WorkflowNode) {
  return {
    borderColor: `${node.accent}33`,
    boxShadow: `0 12px 26px ${node.accent}22`,
  };
}

function applyDemoWorkflow() {
  const credentialId =
    selectedCredentialId.value || credentials.value[0]?.id || 'cred-whatsapp';

  const demoNodes: WorkflowNode[] = [
    instantiateNode('whatsapp.trigger', { id: 'whats-trigger', x: 80, y: 160 }),
    instantiateNode('ai.agent', {
      id: 'agent-ia',
      x: 320,
      y: 160,
      config: {
        chatModelNodeId: 'gemini-model',
        memoryNodeId: 'mem-janela',
      },
    }),
    instantiateNode('ai.chat-model', { id: 'gemini-model', x: 280, y: 320 }),
    instantiateNode('memory.window-buffer', { id: 'mem-janela', x: 440, y: 320 }),
    instantiateNode('whatsapp.send', {
      id: 'resposta',
      x: 580,
      y: 160,
      config: {
        credentialId,
        to: '{{ trigger.payload.from }}',
        message: 'Obrigado por falar com a FluxoLab!',
      },
    }),
    instantiateNode('http.request', {
      id: 'crm',
      x: 760,
      y: 160,
      config: {
        method: 'POST',
        url: 'https://api.exemplo-crm.com/leads',
        headers: '{"Content-Type":"application/json"}',
        body: '{"phone":"{{ trigger.payload.from }}","message":"{{ agent-ia.output.message }}"}',
      },
    }),
  ];

  const demoEdges: WorkflowEdge[] = [
    { from: 'whats-trigger', to: 'agent-ia' },
    { from: 'agent-ia', to: 'resposta' },
    { from: 'agent-ia', to: 'crm' },
    { from: 'gemini-model', to: 'agent-ia' },
    { from: 'mem-janela', to: 'agent-ia' },
  ];

  nodes.value.splice(0, nodes.value.length, ...demoNodes);
  edges.value.splice(0, edges.value.length, ...demoEdges);
  selectedNodeId.value = 'agent-ia';
  projectName.value = 'WhatsApp + Gemini (exemplo)';
  syncWorkflowDefinition();
  schedulePaths();
}

async function saveWorkflow() {
  if (!token.value) {
    executionResult.value = 'Faça login para salvar.';
    return;
  }
  if (nodes.value.length === 0) {
    executionResult.value = 'Adicione ao menos um bloco.';
    return;
  }
  saving.value = true;
  try {
    const response = await createWorkflow(token.value, {
      name: projectName.value || 'Workflow FluxoLab',
      definition: workflowDefinition.value,
      tags: ['fluxolab'],
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
    executionResult.value = 'Faça login antes de testar.';
    return;
  }
  if (!createdWorkflowId.value) {
    executionResult.value = 'Salve o workflow antes de executar.';
    return;
  }
  saving.value = true;
  try {
    const response = await executeWorkflow(token.value, createdWorkflowId.value, {
      phone: '+5531999999999',
      message: 'Execução de teste FluxoLab',
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
  <div class="page">
    <aside class="sidebar">
      <div class="sidebar__logo">FluxoLab</div>
      <nav class="sidebar__nav">
        <router-link :to="{ name: 'dashboard' }" class="sidebar__item" :class="{ 'sidebar__item--active': route.name === 'dashboard' }">
          Overview
        </router-link>
        <router-link :to="{ name: 'workflow-builder' }" class="sidebar__item" :class="{ 'sidebar__item--active': route.name === 'workflow-builder' }">
          Workflows
        </router-link>
        <router-link :to="{ name: 'docs' }" class="sidebar__item">
          Documentação
        </router-link>
        <router-link :to="{ name: 'settings' }" class="sidebar__item">
          Credenciais
        </router-link>
      </nav>
      <div class="sidebar__footer">
        <div class="workspace">
          <span class="workspace__avatar">FL</span>
          <div>
            <strong>Workspace padrão</strong>
            <small>{{ router.currentRoute.value.fullPath }}</small>
          </div>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="topbar__title">
          <h1>{{ projectName || 'Novo workflow' }}</h1>
          <p>Monte automações conectando blocos visuais.</p>
        </div>
        <div class="topbar__actions">
          <button type="button" class="btn" @click="applyDemoWorkflow">Carregar exemplo</button>
          <button type="button" class="btn" :disabled="saving" @click="saveWorkflow">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
          <button type="button" class="btn btn--accent" :disabled="saving || !createdWorkflowId" @click="executeWorkflowTest">
            Executar teste
          </button>
        </div>
      </header>

      <section class="status">
        <WhatsappConnector />
        <div class="status__card">
          <p class="status__label">Definição JSON</p>
          <pre>{{ workflowJson }}</pre>
        </div>
      </section>

      <section class="workspace-area">
        <div ref="canvasRef" class="canvas">
          <svg v-if="edgePaths.length" class="canvas__edges">
            <path v-for="(path, index) in edgePaths" :key="`edge-${index}`" :d="path" />
          </svg>

          <div
            v-for="node in nodes"
            :key="node.id"
            class="node"
            :class="{ 'node--active': node.id === selectedNodeId }"
            :style="[{ left: `${node.x}px`, top: `${node.y}px` }, nodeCardStyle(node)]"
            :ref="(el) => registerNodeRef(node.id, el)"
            @click="selectNode(node.id)"
          >
            <span class="node__connector node__connector--left" />
            <span class="node__connector node__connector--right" />
            <div class="node__icon" :style="iconStyle(node.icon)" aria-hidden="true" />
            <div class="node__content">
              <strong>{{ node.title }}</strong>
              <small v-if="node.subtitle">{{ node.subtitle }}</small>
            </div>
          </div>

          <div v-if="nodes.length === 0" class="canvas__empty">
            <button type="button" class="empty__button" @click="addNodeFromTemplate('whatsapp.trigger')">
              + Adicionar primeiro bloco
            </button>
            <p>Comece escolhendo um gatilho (WhatsApp, webhook, e-mail...).</p>
          </div>
        </div>

        <aside class="panel">
          <section class="panel__section">
            <header>
              <h2>Blocos disponíveis</h2>
              <p>Selecione um bloco para adicionar ao fluxo.</p>
            </header>
            <div class="palette">
              <button
                v-for="template in nodeTemplates"
                :key="template.type"
                type="button"
                class="palette__item"
                :style="{ borderColor: `${template.accent}33` }"
                @click="addNodeFromTemplate(template.type)"
              >
                <span class="palette__icon" :style="iconStyle(template.icon)" aria-hidden="true" />
                <div>
                  <strong>{{ template.label }}</strong>
                  <small v-if="template.subtitle">{{ template.subtitle }}</small>
                </div>
              </button>
            </div>
          </section>

          <section class="panel__section">
            <header>
              <h2>Detalhes do bloco</h2>
              <p v-if="activeNode">Ajuste os parâmetros do bloco selecionado.</p>
            </header>
            <div v-if="activeNode && activeTemplate" class="inspector">
              <div class="inspector__header">
                <span class="inspector__icon" :style="iconStyle(activeNode.icon)" aria-hidden="true" />
                <div>
                  <strong>{{ activeNode.title }}</strong>
                  <small v-if="activeNode.subtitle">{{ activeNode.subtitle }}</small>
                </div>
              </div>
              <div class="inspector__fields">
                <div
                  v-for="field in activeTemplate.fields"
                  :key="`${activeNode.id}-${field.key}`"
                  class="field"
                >
                  <label :for="`field-${activeNode.id}-${field.key}`">{{ field.label }}</label>
                  <input
                    v-if="field.type === 'text'"
                    :id="`field-${activeNode.id}-${field.key}`"
                    type="text"
                    v-model="(activeNode.config[field.key] as string)"
                    :placeholder="field.placeholder"
                  />
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    :id="`field-${activeNode.id}-${field.key}`"
                    rows="3"
                    v-model="(activeNode.config[field.key] as string)"
                    :placeholder="field.placeholder"
                  ></textarea>
                  <input
                    v-else-if="field.type === 'number'"
                    :id="`field-${activeNode.id}-${field.key}`"
                    type="number"
                    v-model.number="(activeNode.config[field.key] as number)"
                    :min="field.min"
                    :max="field.max"
                    :placeholder="field.placeholder"
                  />
                  <select
                    v-else-if="field.type === 'select'"
                    :id="`field-${activeNode.id}-${field.key}`"
                    v-model="(activeNode.config[field.key] as string)"
                  >
                    <option v-for="option in field.options || []" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <small v-if="field.helper" class="field__helper">{{ field.helper }}</small>
                </div>
              </div>
            </div>
            <div v-else class="inspector__empty">
              Selecione um bloco no canvas para editar os detalhes.
            </div>
          </section>

          <section class="panel__section panel__section--status">
            <h2>Status</h2>
            <p v-if="executionResult" class="status__feedback">{{ executionResult }}</p>
            <p v-if="credentialsError" class="status__feedback status__feedback--error">{{ credentialsError }}</p>
            <p v-if="credentialsLoading" class="status__hint">Carregando credenciais…</p>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<style scoped>
:root {
  color-scheme: dark;
  font-family: 'Inter', system-ui, sans-serif;
}

.page {
  display: flex;
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 42%),
    radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 48%),
    #0f172a;
  color: #e2e8f0;
}

.sidebar {
  width: 240px;
  background: rgba(11, 18, 34, 0.94);
  border-right: 1px solid rgba(59, 130, 246, 0.18);
  padding: 1.6rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar__logo {
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #60a5fa;
}

.sidebar__nav {
  display: grid;
  gap: 0.65rem;
}

.sidebar__item {
  padding: 0.6rem 0.8rem;
  border-radius: 0.9rem;
  color: rgba(226, 232, 240, 0.72);
  transition: background 0.2s ease, color 0.2s ease;
}

.sidebar__item:hover {
  background: rgba(59, 130, 246, 0.22);
  color: #f8fafc;
}

.sidebar__item--active {
  background: rgba(14, 197, 126, 0.26);
  color: #f8fafc;
}

.sidebar__footer {
  margin-top: auto;
}

.workspace {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 1rem;
  background: rgba(30, 41, 59, 0.72);
}

.workspace__avatar {
  width: 40px;
  height: 40px;
  border-radius: 1rem;
  background: rgba(59, 130, 246, 0.4);
  display: grid;
  place-items: center;
  font-weight: 600;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding: 1.8rem 2.2rem;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.topbar__title h1 {
  margin: 0;
  font-size: 1.45rem;
  color: #f8fafc;
}

.topbar__title p {
  margin: 0.35rem 0 0 0;
  color: rgba(148, 163, 184, 0.75);
}

.topbar__actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.55rem 1.1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(12, 20, 36, 0.75);
  color: #e2e8f0;
  font-weight: 600;
  transition: border 0.2s ease, background 0.2s ease;
}

.btn:hover {
  border-color: rgba(96, 165, 250, 0.55);
}

.btn--accent {
  background: linear-gradient(135deg, #2563eb, #8b5cf6);
  border: none;
}

.btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.status {
  display: flex;
  flex-wrap: wrap;
  gap: 1.4rem;
}

.status__card {
  flex: 1;
  min-width: 280px;
  background: rgba(12, 20, 36, 0.82);
  border-radius: 1.2rem;
  border: 1px solid rgba(59, 130, 246, 0.22);
  padding: 1rem 1.2rem;
}

.status__label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
}

.status__card pre {
  margin-top: 0.6rem;
  max-height: 150px;
  overflow: auto;
  padding: 0.75rem;
  background: rgba(10, 16, 30, 0.8);
  border-radius: 0.8rem;
  font-size: 0.75rem;
}

.workspace-area {
  display: flex;
  gap: 1.6rem;
  min-height: 520px;
}

.canvas {
  position: relative;
  flex: 1;
  border-radius: 1.4rem;
  padding: 2rem;
  background: radial-gradient(circle at 0 0, rgba(59, 130, 246, 0.18), transparent 42%),
    radial-gradient(circle at 100% 0, rgba(14, 197, 126, 0.18), transparent 45%),
    rgba(11, 18, 34, 0.88);
  border: 1px solid rgba(94, 234, 212, 0.1);
  overflow: hidden;
}

.canvas__edges {
  position: absolute;
  inset: 0;
  pointer-events: none;
  fill: none;
}

.canvas__edges path {
  stroke: rgba(148, 163, 184, 0.35);
  stroke-width: 2;
}

.canvas__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: rgba(226, 232, 240, 0.72);
}

.empty__button {
  padding: 0.6rem 1.4rem;
  border-radius: 0.95rem;
  border: 1px dashed rgba(148, 163, 184, 0.38);
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  font-weight: 600;
}

.node {
  position: absolute;
  min-width: 200px;
  border-radius: 1.1rem;
  border: 1px solid rgba(59, 130, 246, 0.22);
  background: rgba(17, 24, 39, 0.92);
  padding: 1rem 1.2rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.55);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.node:hover {
  transform: translateY(-3px);
  border-color: rgba(94, 234, 212, 0.35);
}

.node--active {
  border-color: rgba(168, 85, 247, 0.55);
  box-shadow: 0 16px 34px rgba(129, 140, 248, 0.32);
}

.node__icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background-size: 58%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.25);
  margin-bottom: 0.75rem;
}

.node__content strong {
  display: block;
  color: #f8fafc;
}

.node__content small {
  color: rgba(148, 163, 184, 0.72);
}

.node__connector {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.35);
  border: 2px solid #0f172a;
  top: 50%;
  transform: translateY(-50%);
}

.node__connector--left {
  left: -18px;
}

.node__connector--right {
  right: -18px;
}

.panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.panel__section {
  background: rgba(12, 20, 36, 0.9);
  border-radius: 1.1rem;
  border: 1px solid rgba(59, 130, 246, 0.18);
  padding: 1.1rem 1.2rem;
}

.panel__section header h2 {
  margin: 0;
  font-size: 0.95rem;
}

.panel__section header p {
  margin: 0.3rem 0 1rem 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.7);
}

.palette {
  display: grid;
  gap: 0.7rem;
}

.palette__item {
  display: flex;
  gap: 0.8rem;
  align-items: center;
  padding: 0.85rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(17, 24, 39, 0.88);
  color: #e2e8f0;
}

.palette__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-size: 58%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.inspector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.inspector__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.inspector__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-size: 60%;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.inspector__fields {
  display: grid;
  gap: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.8);
}

.field input,
.field textarea,
.field select {
  border-radius: 0.6rem;
  border: 1px solid rgba(71, 85, 105, 0.65);
  background: rgba(15, 23, 42, 0.85);
  color: #f8fafc;
  padding: 0.55rem 0.75rem;
  font-size: 0.86rem;
}

.field textarea {
  min-height: 80px;
}

.field__helper {
  font-size: 0.72rem;
  color: rgba(148, 163, 184, 0.7);
}

.inspector__empty {
  padding: 0.9rem;
  border-radius: 0.9rem;
  background: rgba(14, 20, 36, 0.85);
  color: rgba(148, 163, 184, 0.78);
  font-size: 0.85rem;
}

.panel__section--status h2 {
  margin-bottom: 0.6rem;
}

.status__feedback {
  margin: 0.35rem 0;
  color: #38bdf8;
  font-size: 0.82rem;
}

.status__feedback--error {
  color: #f87171;
}

.status__hint {
  margin: 0;
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.8rem;
}

@media (max-width: 1100px) {
  .page {
    flex-direction: column;
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(59, 130, 246, 0.18);
  }

  .sidebar__nav {
    flex: 1;
    grid-auto-flow: column;
    justify-content: center;
  }

  .main {
    padding: 1.4rem;
  }

  .workspace-area {
    flex-direction: column;
  }

  .panel {
    width: 100%;
  }
}
</style>
