<template>
  <div class="dashboard">
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
    <main class="dashboard__main">
      <!-- Header -->
      <Header
        :show-trial-bar="true"
        :trial-days="5"
        :trial-executions="6"
        :trial-limit="1000"
        :breadcrumbs="['Personal', 'My workflow']"
        :show-add-tag="true"
        :is-active="false"
        :show-tabs="true"
        :tabs="tabs"
        :active-tab="activeTab"
        :star-count="150406"
        @upgrade="handleUpgrade"
        @save="handleSave"
        @star="handleStar"
        @tab-change="handleTabChange"
      />

        <!-- Dashboard Content -->
        <div class="dashboard__content">
          <div class="dashboard__header">
            <h1 class="dashboard__title">{{ t('dashboard.title') }}</h1>
            <p class="dashboard__subtitle">{{ t('dashboard.subtitle') }}</p>
          </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="loadDashboardData" class="btn btn-primary">{{ t('common.retry') }}</button>
        </div>

        <!-- Stats Cards -->
        <div v-else class="stats-grid">
          <div v-for="stat in formattedStats" :key="stat.id" class="stat-card">
            <div class="stat-card__content">
              <div class="stat-card__value">{{ stat.value }}</div>
              <div class="stat-card__label">{{ stat.label }}</div>
              <div class="stat-card__period">{{ stat.period }}</div>
            </div>
            <div v-if="stat.info" class="stat-card__info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar">
          <button class="btn btn-accent" @click="handleCreateWorkflow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {{ t('dashboard.actions.createWorkflow') }}
          </button>
        </div>

        <!-- Content Tabs -->
        <div class="content-tabs">
          <button
            v-for="tab in contentTabs"
            :key="tab.id"
            class="content-tab"
            :class="{ 'content-tab--active': tab.id === activeContentTab }"
            @click="activeContentTab = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.badge" class="content-tab__badge">{{ tab.badge }}</span>
          </button>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar__left">
            <div class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="M21 21l-4.35-4.35"></path>
              </svg>
              <input 
                v-model="searchQuery" 
                @input="handleSearch" 
                type="text" 
                :placeholder="t('dashboard.actions.searchPlaceholder')" 
                class="search-input"
              >
            </div>
            <select class="sort-select">
              <option>Sort by last updated</option>
              <option>Sort by name</option>
              <option>Sort by created</option>
            </select>
            <button class="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <button class="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
          </div>
        </div>

        <!-- Workflows List -->
        <div v-if="workflows.length === 0 && !loading" class="empty-state">
          <div class="empty-state__content">
            <div class="empty-state__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"></path>
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"></path>
              </svg>
            </div>
            <h3 class="empty-state__title">{{ t('dashboard.empty.title') }}</h3>
            <p class="empty-state__description">{{ t('dashboard.empty.description') }}</p>
            <button @click="handleCreateWorkflow" class="btn btn-primary">{{ t('dashboard.empty.action') }}</button>
          </div>
        </div>

        <div v-else class="workflows-list">
          <div v-for="workflow in workflows" :key="workflow.id" class="workflow-card">
            <div class="workflow-card__content">
              <div class="workflow-card__header">
                <h3 class="workflow-card__title">{{ workflow.name }}</h3>
                <div class="workflow-card__actions">
                  <span class="workflow-card__owner">{{ workflow.owner }}</span>
                  <div class="workflow-card__status">
                    <button 
                      class="status-toggle"
                      :class="{ 'status-toggle--active': workflow.active }"
                      @click="handleToggleWorkflowStatus(workflow)"
                    >
                      <div class="status-toggle__thumb"></div>
                    </button>
                  </div>
                  <button class="workflow-card__menu">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="12" cy="5" r="1"></circle>
                      <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="workflow-card__meta">
                <span class="workflow-card__date">Última atualização: {{ workflow.lastUpdated }}</span>
                <span class="workflow-card__separator">|</span>
                <span class="workflow-card__date">Criado: {{ workflow.created }}</span>
                <span v-if="workflow.tags.length > 0" class="workflow-card__separator">|</span>
                <div v-if="workflow.tags.length > 0" class="workflow-card__tags">
                  <span v-for="tag in workflow.tags" :key="tag" class="workflow-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="pagination__info">
            Total {{ totalWorkflows }}
          </div>
          <div class="pagination__controls">
            <button class="pagination__btn" :disabled="currentPage === 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <button class="pagination__btn pagination__btn--active">1</button>
            <button class="pagination__btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
          <div class="pagination__size">
            <select class="size-select">
              <option>50/page</option>
              <option>25/page</option>
              <option>100/page</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '@/stores/session.store';
import { fetchDashboardData, fetchRecentWorkflows, toggleWorkflowStatus, searchWorkflows, type DashboardStats, type DashboardWorkflow } from '@/services/dashboard.service';
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';

const router = useRouter();
const sessionStore = useSessionStore();
const { t } = useI18n();

const activeNavItem = ref('overview');
const activeTab = ref('editor');
const activeContentTab = ref('workflows');
const currentPage = ref(1);
const searchQuery = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

// Dados reais do backend
const stats = ref<DashboardStats>({
  prodExecutions: 0,
  failedExecutions: 0,
  failureRate: 0,
  timeSaved: '---',
  avgRunTime: '0s',
  period: 'Last 7 days'
});

const workflows = ref<DashboardWorkflow[]>([]);
const totalWorkflows = ref(0);

// Computed para dados do usuário
const userName = computed(() => {
  return sessionStore.user?.displayName || 'Usuário';
});

const tabs = [
  { id: 'editor', label: 'Editor' },
  { id: 'executions', label: 'Executions' },
  { id: 'evaluations', label: 'Evaluations' },
];

const contentTabs = computed(() => [
  { id: 'workflows', label: t('dashboard.tabs.workflows') },
  { id: 'credentials', label: t('dashboard.tabs.credentials') },
  { id: 'executions', label: t('dashboard.tabs.executions') },
  { id: 'data-tables', label: t('dashboard.tabs.dataTables'), badge: 'Beta' },
]);

// Computed para stats formatados
const formattedStats = computed(() => [
  { 
    id: 'prod-executions', 
    value: stats.value.prodExecutions.toString(), 
    label: 'Prod. executions', 
    period: stats.value.period 
  },
  { 
    id: 'failed-executions', 
    value: stats.value.failedExecutions.toString(), 
    label: 'Failed prod. executions', 
    period: stats.value.period 
  },
  { 
    id: 'failure-rate', 
    value: `${stats.value.failureRate}%`, 
    label: 'Failure rate', 
    period: stats.value.period 
  },
  { 
    id: 'time-saved', 
    value: stats.value.timeSaved, 
    label: 'Time saved', 
    period: stats.value.period, 
    info: true 
  },
  { 
    id: 'run-time', 
    value: stats.value.avgRunTime, 
    label: 'Run time (avg.)', 
    period: stats.value.period 
  },
]);

// Funções para carregar dados
async function loadDashboardData() {
  if (!sessionStore.token) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const data = await fetchDashboardData(sessionStore.token);
    stats.value = data.stats;
    workflows.value = data.workflows;
    totalWorkflows.value = data.totalWorkflows;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
    console.error('Erro ao carregar dashboard:', err);
  } finally {
    loading.value = false;
  }
}

async function loadWorkflows() {
  if (!sessionStore.token) return;
  
  try {
    const data = await fetchRecentWorkflows(sessionStore.token, { limit: 50 });
    workflows.value = data.workflows;
    totalWorkflows.value = data.total;
  } catch (err) {
    console.error('Erro ao carregar workflows:', err);
  }
}

async function handleSearch() {
  if (!sessionStore.token || !searchQuery.value.trim()) {
    await loadWorkflows();
    return;
  }
  
  try {
    const data = await searchWorkflows(sessionStore.token, searchQuery.value, { limit: 50 });
    workflows.value = data.workflows;
    totalWorkflows.value = data.total;
  } catch (err) {
    console.error('Erro ao buscar workflows:', err);
  }
}

async function handleToggleWorkflowStatus(workflow: DashboardWorkflow) {
  if (!sessionStore.token) return;
  
  try {
    const updatedWorkflow = await toggleWorkflowStatus(sessionStore.token, workflow.id, !workflow.active);
    const index = workflows.value.findIndex(w => w.id === workflow.id);
    if (index !== -1) {
      workflows.value[index] = updatedWorkflow.workflow;
    }
  } catch (err) {
    console.error('Erro ao alterar status do workflow:', err);
  }
}

// Funções de navegação
function handleNavigation(item: any) {
  activeNavItem.value = item.id;
  
  // Navegar para rotas específicas
  switch (item.id) {
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
  console.log('Save clicked');
}

function handleStar() {
  console.log('Star clicked');
}

function handleTabChange(tabId: string) {
  activeTab.value = tabId;
}

function handleCreateWorkflow() {
  router.push('/workflows/projects');
}

// Lifecycle
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--surface-secondary);
}

.dashboard__main {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
}

.dashboard__content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.dashboard__header {
  margin-bottom: 2rem;
}

.dashboard__title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.dashboard__subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
}

.stat-card__content {
  flex: 1;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-card__label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.stat-card__period {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-card__info {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  cursor: help;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.content-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 1.5rem;
}

.content-tab {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-tab:hover {
  color: var(--text-primary);
}

.content-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.content-tab__badge {
  background: var(--accent);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.toolbar__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.search-input {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.workflows-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.workflow-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.workflow-card:hover {
  box-shadow: var(--shadow-md);
}

.workflow-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.workflow-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.workflow-card__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.workflow-card__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.workflow-card__owner {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.workflow-card__status {
  display: flex;
  align-items: center;
}

.status-toggle {
  width: 44px;
  height: 24px;
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.status-toggle--active {
  background: var(--success);
  border-color: var(--success);
}

.status-toggle__thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 1px;
  left: 1px;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.status-toggle--active .status-toggle__thumb {
  transform: translateX(20px);
}

.workflow-card__menu {
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
}

.workflow-card__menu:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.workflow-card__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.workflow-card__separator {
  color: var(--border-strong);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--border-soft);
}

.pagination__info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.pagination__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination__btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.pagination__btn:hover:not(:disabled) {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__btn--active {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.pagination__size {
  display: flex;
  align-items: center;
}

.size-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-soft);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.empty-state__icon svg {
  width: 100%;
  height: 100%;
}

.empty-state__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.empty-state__description {
  color: var(--text-secondary);
  margin: 0;
}

/* Workflow Tags */
.workflow-card__tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.workflow-tag {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-primary:hover {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
}

.btn-accent {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.btn-accent:hover {
  background: var(--accent-dark);
  border-color: var(--accent-dark);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border-soft);
}

.btn-ghost:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}
</style>