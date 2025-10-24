﻿<template>
  <div class="workflow-builder">
    <!-- Sidebar -->
    <Sidebar
      :active-item="activeNavItem"
      :user-name="userName"
      @navigate="handleNavigation"
      @add="handleAdd"
      @add-project="handleAddProject"
      @signout="handleSignOut"
    />

    <!-- Main Content -->
    <main class="workflow-builder__main">
      <!-- Header -->
      <Header
        :show-trial-bar="true"
        :trial-days="5"
        :trial-executions="6"
        :trial-limit="1000"
        :breadcrumbs="['Personal', 'My workflow']"
        :show-add-tag="true"
        :is-active="isWorkflowActive"
        :show-tabs="true"
        :tabs="tabs"
        :active-tab="activeTab"
        :star-count="150406"
        @upgrade="handleUpgrade"
        @save="handleSave"
        @star="handleStar"
        @tab-change="handleTabChange"
      />

      <!-- Workflow Canvas -->
      <div class="workflow-canvas">
        <div class="canvas-container">
          <!-- Empty State -->
          <div v-if="!hasWorkflow" class="empty-state">
            <div class="empty-state__content">
              <div class="empty-state__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h3 class="empty-state__title">Add first step...</h3>
            </div>
          </div>

          <!-- Workflow Nodes -->
          <div v-else class="workflow-nodes">
            <div
              v-for="node in workflowNodes"
              :key="node.id"
              class="workflow-node"
              :class="{
                'workflow-node--active': activeNode?.id === node.id,
                'workflow-node--trigger': node.type === 'trigger'
              }"
              :style="{ left: node.x + 'px', top: node.y + 'px' }"
              @click="selectNode(node)"
            >
              <div class="workflow-node__header">
                <div class="workflow-node__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle v-if="node.type === 'trigger'" cx="12" cy="12" r="10"></circle>
                    <rect v-else x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span class="workflow-node__title">{{ node.title }}</span>
              </div>
              <div class="workflow-node__ports">
                <div class="port port--input" v-if="node.inputs > 0"></div>
                <div class="port port--output" v-if="node.outputs > 0"></div>
              </div>
            </div>

            <!-- Connections -->
            <svg class="connections-svg">
              <path
                v-for="connection in connections"
                :key="connection.id"
                :d="connection.path"
                class="connection-line"
              />
            </svg>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="workflow-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-section__title">What happens next?</h3>
            <div class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search nodes..." class="search-input">
            </div>
            <div class="node-categories">
              <div
                v-for="category in nodeCategories"
                :key="category.id"
                class="node-category"
                @click="selectCategory(category)"
              >
                <div class="node-category__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle v-if="category.icon === 'ai'" cx="12" cy="12" r="10"></circle>
                    <rect v-else-if="category.icon === 'action'" x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <path v-else-if="category.icon === 'data'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path v-else-if="category.icon === 'flow'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <path v-else-if="category.icon === 'core'" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    <g v-else-if="category.icon === 'human'">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </g>
                    <path v-else-if="category.icon === 'trigger'" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                  </svg>
                </div>
                <div class="node-category__content">
                  <h4 class="node-category__title">{{ category.title }}</h4>
                  <p class="node-category__description">{{ category.description }}</p>
                </div>
                <div class="node-category__arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="workflow-footer">
        <div class="footer-controls">
          <button class="control-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M9 9h6v6H9z"></path>
            </svg>
          </button>
          <button class="control-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <span>+</span>
          </button>
          <button class="control-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="M21 21l-4.35-4.35"></path>
            </svg>
            <span>-</span>
          </button>
          <button class="control-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 9h6v6H9z"></path>
            </svg>
          </button>
        </div>
        <div class="footer-info">
          <span class="footer-text">Logs</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSessionStore } from '@/stores/session.store';
import { listWorkflows, getWorkflow, createWorkflow, updateWorkflow, type WorkflowSummary, type WorkflowDetails } from '@/services/workflows.service';
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();

const activeNavItem = ref('personal');
const activeTab = ref('editor');
const isWorkflowActive = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);

// Dados do usuário
const userName = computed(() => {
  return sessionStore.user?.displayName || 'Usuário';
});

// Dados do workflow atual
const currentWorkflow = ref<WorkflowDetails | null>(null);
const workflowId = computed(() => route.params.id as string);
interface WorkflowNode {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  inputs: number;
  outputs: number;
}

const activeNode = ref<WorkflowNode | null>(null);

const tabs = [
  { id: 'editor', label: 'Editor' },
  { id: 'executions', label: 'Executions' },
  { id: 'evaluations', label: 'Evaluations' },
];

const workflowNodes = ref([
  {
    id: '1',
    type: 'trigger',
    title: 'When click',
    x: 100,
    y: 100,
    inputs: 0,
    outputs: 1,
  },
]);

interface Connection {
  id: string;
  path: string;
}

const connections = ref<Connection[]>([]);

const hasWorkflow = computed(() => workflowNodes.value.length > 0);

const nodeCategories = [
  {
    id: 'ai',
    title: 'AI',
    description: 'Build autonomous agents, summarize or search documents, etc.',
    icon: 'ai',
  },
  {
    id: 'action',
    title: 'Action in an app',
    description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
    icon: 'action',
  },
  {
    id: 'data',
    title: 'Data transformation',
    description: 'Manipulate, filter or convert data',
    icon: 'data',
  },
  {
    id: 'flow',
    title: 'Flow',
    description: 'Branch, merge or loop the flow, etc.',
    icon: 'flow',
  },
  {
    id: 'core',
    title: 'Core',
    description: 'Run code, make HTTP requests, set webhooks, etc.',
    icon: 'core',
  },
  {
    id: 'human',
    title: 'Human in the loop',
    description: 'Wait for approval or human input before continuing',
    icon: 'human',
  },
  {
    id: 'trigger',
    title: 'Add another trigger',
    description: 'Triggers start your workflow. Workflows can have multiple triggers.',
    icon: 'trigger',
  },
];

// Funções para carregar dados
async function loadWorkflow() {
  if (!sessionStore.token || !workflowId.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const data = await getWorkflow(sessionStore.token, workflowId.value);
    currentWorkflow.value = data.workflow;
    isWorkflowActive.value = data.workflow.status === 'active';
    
    // Converter dados do workflow para o formato do canvas
    if (data.workflow.definition) {
      workflowNodes.value = data.workflow.definition.nodes.map(node => ({
        id: node.id,
        type: node.type,
        title: node.type === 'trigger' ? 'Trigger' : 'Action',
        x: 100,
        y: 100,
        inputs: node.type === 'trigger' ? 0 : 1,
        outputs: 1,
      }));
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar workflow';
    console.error('Erro ao carregar workflow:', err);
  } finally {
    loading.value = false;
  }
}

async function saveWorkflow() {
  if (!sessionStore.token) return;
  
  try {
    const workflowData = {
      name: currentWorkflow.value?.name || 'Novo Workflow',
      definition: {
        nodes: workflowNodes.value.map(node => ({
          id: node.id,
          type: node.type,
          params: {}
        })),
        connections: connections.value.map(conn => ({
          from: conn.id.split('-')[0],
          to: conn.id.split('-')[1],
        }))
      }
    };

    if (workflowId.value) {
      await updateWorkflow(sessionStore.token, workflowId.value, workflowData);
    } else {
      const result = await createWorkflow(sessionStore.token, workflowData);
      router.replace(`/workflows/projects/${result.workflow.id}`);
    }
  } catch (err) {
    console.error('Erro ao salvar workflow:', err);
  }
}

// Funções de navegação
function handleNavigation(item: any) {
  activeNavItem.value = item.id;
  
  switch (item.id) {
    case 'overview':
      router.push('/dashboard');
      break;
    case 'workflows':
      router.push('/workflows/projects');
      break;
    case 'docs':
      router.push('/docs');
      break;
    case 'settings':
      router.push('/settings');
      break;
  }
}

function handleAdd() {
  router.push('/workflows/projects');
}

function handleAddProject() {
  router.push('/workflows/projects');
}

function handleSignOut() {
  sessionStore.logout();
  router.push('/login');
}

function handleUpgrade() {
  router.push('/settings?section=usage');
}

function handleSave() {
  saveWorkflow();
}

function handleStar() {
  console.log('Star clicked');
}

function handleTabChange(tabId: string) {
  activeTab.value = tabId;
}

function selectNode(node: WorkflowNode) {
  activeNode.value = node;
}

function selectCategory(category: { id: string; title: string; description: string; icon: string }) {
  console.log('Category selected:', category);
}

// Lifecycle
onMounted(() => {
  if (workflowId.value) {
    loadWorkflow();
  }
});
</script>

<style scoped>
.workflow-builder {
  display: flex;
  min-height: 100vh;
  background: var(--surface-secondary);
}

.workflow-builder__main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.workflow-canvas {
  flex: 1;
  display: flex;
  position: relative;
}

.canvas-container {
  flex: 1;
  position: relative;
  background:
    radial-gradient(circle, var(--border-soft) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  border: 2px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.empty-state__icon svg {
  width: 32px;
  height: 32px;
}

.empty-state__title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.workflow-nodes {
  position: relative;
  width: 100%;
  height: 100%;
}

.workflow-node {
  position: absolute;
  min-width: 200px;
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.workflow-node:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.workflow-node--active {
  border-color: var(--accent);
  box-shadow: var(--shadow-purple);
}

.workflow-node--trigger {
  border-color: var(--success);
}

.workflow-node__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.workflow-node__icon {
  width: 24px;
  height: 24px;
  color: var(--accent);
  flex-shrink: 0;
}

.workflow-node--trigger .workflow-node__icon {
  color: var(--success);
}

.workflow-node__icon svg {
  width: 100%;
  height: 100%;
}

.workflow-node__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.workflow-node__ports {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: -8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.port {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  background: var(--surface-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.port:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.port--input {
  border-color: var(--success);
}

.port--input:hover {
  border-color: var(--success);
  background: var(--success-soft);
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-line {
  fill: none;
  stroke: var(--border-strong);
  stroke-width: 2;
  stroke-linecap: round;
}

.workflow-sidebar {
  width: 320px;
  background: var(--surface-primary);
  border-left: 1px solid var(--border-soft);
  padding: 1.5rem;
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 2rem;
}

.sidebar-section__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.node-categories {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-category {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.node-category:hover {
  background: var(--surface-muted);
}

.node-category__icon {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.node-category__icon svg {
  width: 100%;
  height: 100%;
}

.node-category__content {
  flex: 1;
}

.node-category__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.node-category__description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.node-category__arrow {
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.node-category__arrow svg {
  width: 100%;
  height: 100%;
}

.workflow-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--surface-primary);
  border-top: 1px solid var(--border-soft);
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border-soft);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.control-btn:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.control-btn svg {
  width: 16px;
  height: 16px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
