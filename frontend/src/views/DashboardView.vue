<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../stores/session.store';
import FluxoLogo from '../assets/logo-empresa.png';
import type { Project, WorkspaceOverview } from '../types/api';
import { fetchWorkspaceOverview } from '../services/workspace.service';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const { token, user } = storeToRefs(session);

const overview = ref<WorkspaceOverview | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const sidebarOpen = ref(true);
const activeTab = ref<'workflows' | 'credentials' | 'executions'>('workflows');
const searchTerm = ref('');
const sortKey = ref<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
const sortDir = ref<'asc' | 'desc'>('desc');
const page = ref(1);
const perPage = ref(50);

const createMenuOpen = ref(false);
const sortMenuOpen = ref(false);
const pageSizeMenuOpen = ref(false);
const profileMenuOpen = ref(false);

const createMenuEl = ref<HTMLDivElement | null>(null);
const sortMenuEl = ref<HTMLDivElement | null>(null);
const pageSizeMenuEl = ref<HTMLDivElement | null>(null);
const profileMenuEl = ref<HTMLDivElement | null>(null);

const workflows = computed<Project[]>(() => overview.value?.projects ?? []);

const statsCards = computed(() => {
  const metrics = overview.value?.metrics;
  const totalProjects = metrics?.totalProjects ?? 0;
  const totalWebhooks = metrics?.totalWebhooks ?? 0;
  const totalEvents = metrics?.totalEvents ?? 0;
  const avgEvents = totalEvents ? Math.max(1, Math.round(totalEvents / 7)) : 0;

  return [
    { key: 'workflows', label: 'Workflows ativos', sub: 'Últimos 7 dias', value: String(totalProjects) },
    { key: 'webhooks', label: 'Webhooks conectados', sub: 'Total geral', value: String(totalWebhooks) },
    { key: 'events', label: 'Eventos recebidos', sub: 'Últimas 24h', value: String(totalEvents) },
    { key: 'avgEvents', label: 'Eventos/dia', sub: 'Estimativa', value: avgEvents ? String(avgEvents) : '--' },
    { key: 'uptime', label: 'Tempo ativo', sub: 'Infra monitorada', value: '99.9%' },
  ];
});

const sortLabel = computed(() => {
  switch (sortKey.value) {
    case 'title':
      return 'Nome';
    case 'createdAt':
      return 'Data de criação';
    default:
      return 'Última atualização';
  }
});

const filteredWorkflows = computed(() => {
  const term = searchTerm.value.trim().toLowerCase();
  const base = workflows.value;

  const filtered = term
    ? base.filter((project) => {
        const matchesTitle = project.title.toLowerCase().includes(term);
        const description = project.metadata && 'description' in project.metadata
          ? String((project.metadata as Record<string, unknown>).description)
          : '';
        const matchesDescription = description.toLowerCase().includes(term);
        return matchesTitle || matchesDescription;
      })
    : base;

  const sorted = filtered.slice().sort((a, b) => {
    let av: string | number;
    let bv: string | number;

    if (sortKey.value === 'title') {
      av = a.title.toLowerCase();
      bv = b.title.toLowerCase();
    } else {
      const aDate = new Date(a[sortKey.value]).getTime();
      const bDate = new Date(b[sortKey.value]).getTime();
      av = aDate;
      bv = bDate;
    }

    if (av < bv) return sortDir.value === 'asc' ? -1 : 1;
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
});

const totalItems = computed(() => filteredWorkflows.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / perPage.value)));

const paginatedWorkflows = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filteredWorkflows.value.slice(start, start + perPage.value);
});

watch([searchTerm, sortKey, sortDir, perPage], () => {
  page.value = 1;
});

watch(totalPages, (nextTotal) => {
  if (page.value > nextTotal) {
    page.value = nextTotal;
  }
});

const userInitials = computed(() => {
  const current = user.value;
  if (!current) return 'FL';

  const names = current.displayName?.split(' ').filter(Boolean) ?? [];
  if (names.length === 0) {
    return current.email.slice(0, 2).toUpperCase();
  }
  if (names.length === 1) {
    const first = names[0] ?? '';
    return first.slice(0, 2).toUpperCase() || 'FL';
  }

  const first = names[0] ?? '';
  const last = names[names.length - 1] ?? '';
  const firstInitial = first[0] ? first[0].toUpperCase() : '';
  const lastInitial = last[0] ? last[0].toUpperCase() : '';
  const result = firstInitial + lastInitial;
  return result || 'FL';
});

const userDisplayName = computed(() => {
  const current = user.value;
  if (!current) return 'FluxoLab';

  const names = current.displayName?.split(' ').filter(Boolean) ?? [];
  if (names.length === 0) {
    return current.email;
  }
  if (names.length === 1) {
    return names[0] ?? current.email;
  }

  const first = names[0] ?? '';
  const last = names[names.length - 1] ?? '';
  return `${first} ${last}`.trim();
});

async function loadOverview() {
  if (!token.value) {
    await router.push('/login');
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    overview.value = await fetchWorkspaceOverview(token.value);
  } catch (err) {
    const fallback =
      err instanceof Error ? err.message : 'Nao foi possivel carregar o painel.';
    error.value = fallback;
  } finally {
    loading.value = false;
  }
}
function handleLogout() {
  session.clearSession();
  router.push('/login');
}

function formatRelative(dateInput: string | Date) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return 'Data indisponível';
  }
  const diffDays = Math.round((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays <= 0) return 'Atualizado hoje';
  if (diffDays === 1) return 'Atualizado há 1 dia';
  return 'Atualizado há ' + diffDays + ' dias';
}

function formatCreated(dateInput: string | Date) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const formatted = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
  return 'Criado em ' + formatted;
}

function projectScope(project: Project) {
  const scope = project.metadata && typeof project.metadata.scope === 'string'
    ? project.metadata.scope
    : null;
  if (scope) return scope;
  if (project.status) return project.status;
  return 'Workspace';
}

function projectDescription(project: Project) {
  if (project.metadata && typeof project.metadata.description === 'string') {
    return project.metadata.description;
  }
  return null;
}

function projectTags(project: Project) {
  const raw = project.metadata && (project.metadata as Record<string, unknown>).tags;
  if (Array.isArray(raw)) {
    return raw.filter((tag): tag is string => typeof tag === 'string');
  }
  return [];
}

function toggleProfileMenu(event: MouseEvent) {
  event.stopPropagation();
  profileMenuOpen.value = !profileMenuOpen.value;
  if (profileMenuOpen.value) {
    createMenuOpen.value = false;
    sortMenuOpen.value = false;
    pageSizeMenuOpen.value = false;
  }
}

function toggleCreateMenu(event: MouseEvent) {
  event.stopPropagation();
  createMenuOpen.value = !createMenuOpen.value;
  if (createMenuOpen.value) {
    sortMenuOpen.value = false;
    pageSizeMenuOpen.value = false;
  }
}

function toggleSortMenu(event: MouseEvent) {
  event.stopPropagation();
  sortMenuOpen.value = !sortMenuOpen.value;
  if (sortMenuOpen.value) {
    createMenuOpen.value = false;
    pageSizeMenuOpen.value = false;
  }
}

function toggleSortDirection() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
}

function togglePageSizeMenu(event: MouseEvent) {
  event.stopPropagation();
  pageSizeMenuOpen.value = !pageSizeMenuOpen.value;
  if (pageSizeMenuOpen.value) {
    createMenuOpen.value = false;
    sortMenuOpen.value = false;
  }
}

function selectSort(key: 'updatedAt' | 'createdAt' | 'title') {
  sortKey.value = key;
  sortMenuOpen.value = false;
}

function setPerPage(size: number) {
  perPage.value = size;
  page.value = 1;
  pageSizeMenuOpen.value = false;
}

function goToPage(direction: 'prev' | 'next') {
  if (direction === 'prev') {
    page.value = Math.max(1, page.value - 1);
  } else {
    page.value = Math.min(totalPages.value, page.value + 1);
  }
}

function handleGlobalClick(event: MouseEvent) {
  const target = event.target as Node;
  if (createMenuOpen.value && createMenuEl.value && !createMenuEl.value.contains(target)) {
    createMenuOpen.value = false;
  }
  if (sortMenuOpen.value && sortMenuEl.value && !sortMenuEl.value.contains(target)) {
    sortMenuOpen.value = false;
  }
  if (pageSizeMenuOpen.value && pageSizeMenuEl.value && !pageSizeMenuEl.value.contains(target)) {
    pageSizeMenuOpen.value = false;
  }
  if (profileMenuOpen.value && profileMenuEl.value && !profileMenuEl.value.contains(target)) {
    profileMenuOpen.value = false;
  }
}

function logoutFromProfile() {
  profileMenuOpen.value = false;
  handleLogout();
}

function handleProfileAction(action: 'perfil' | 'config') {
  profileMenuOpen.value = false;
  if (action === 'perfil') {
    router.push({ name: 'settings', params: { section: 'personal' } });
  } else if (action === 'config') {
    router.push({ name: 'settings', params: { section: 'usage' } });
  }
}

onMounted(async () => {
  document.addEventListener('click', handleGlobalClick);

  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    sidebarOpen.value = false;
  }

  if (!session.initialized) {
    await session.initialize();
  }
  await loadOverview();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleGlobalClick);
});

watch(token, async (newToken) => {
  if (!newToken) {
    overview.value = null;
    await router.push('/login');
    return;
  }
  await loadOverview();
});
</script>

<template>
  <div class="dash-shell">
    <div class="dash-layout">
      <div
        v-if="sidebarOpen"
        class="dash-sidebar__backdrop md:hidden"
        @click="sidebarOpen = false"
      />

      <aside
        class="dash-sidebar"
        :class="{ 'dash-sidebar--hidden': !sidebarOpen }"
      >
        <div class="dash-sidebar__inner">
          <div class="dash-sidebar__top">
            <div class="dash-brand">
              <img class="dash-brand__logo" :src="FluxoLogo" alt="FluxoLab" />
              <span class="dash-brand__name">FluxoLab</span>
            </div>
            <button
              class="dash-sidebar__toggle"
              type="button"
              aria-label="Recolher menu"
              @click="sidebarOpen = false"
            >
              ‹
            </button>
          </div>

          <nav class="dash-nav">
            <RouterLink
              :to="{ name: 'dashboard' }"
              class="dash-nav__item"
              :class="{ 'dash-nav__item--active': route.name === 'dashboard' }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 22V12h6v10" /></svg>
              Overview
            </RouterLink>
            <a class="dash-nav__item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
              Templates
            </a>
            <a class="dash-nav__item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2a10 10 0 1 0 10 10H12V2z" /><path d="M12 12a10 10 0 0 0-7.07 2.93L12 22V12z" /></svg>
              Variáveis
            </a>
            <a class="dash-nav__item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              Insights
            </a>
          </nav>

          <div class="dash-sidebar__footer">
            <RouterLink
              :to="{ name: 'docs' }"
              class="dash-nav__item"
              :class="{ 'dash-nav__item--active': route.name === 'docs' }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><circle cx="12" cy="17" r=".5" /></svg>
              Help
              <svg class="dash-nav__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </RouterLink>
            <a class="dash-nav__item" href="#">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a2 2 0 0 0 3.4 0" /></svg>
              What's new
              <svg class="dash-nav__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </a>
            <div class="dash-profile" ref="profileMenuEl">
              <transition name="fade">
                <button
                  v-if="!profileMenuOpen"
                  type="button"
                  class="dash-profile__trigger"
                  @click="toggleProfileMenu"
                >
                  <span class="dash-profile__avatar">{{ userInitials }}</span>
                  <span class="dash-profile__name">{{ userDisplayName }}</span>
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">
                    <path d="M4 6l4 4 4-4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <div v-else class="dash-profile__menu">
                  <button type="button" @click="handleProfileAction('perfil')">Perfil</button>
                  <span aria-hidden="true">|</span>
                  <button type="button" @click="handleProfileAction('config')">Configuração</button>
                  <span aria-hidden="true">|</span>
                  <button type="button" class="dash-profile__menu--danger" @click="logoutFromProfile">
                    Sair
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </aside>

      <button
        v-if="!sidebarOpen"
        type="button"
        class="dash-sidebar__toggle-floating"
        aria-label="Expandir menu"
        @click="sidebarOpen = true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 7h16M4 12h16M4 17h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="dash-content">
        <header class="dash-header">
          <div :class="['dash-header__title', { 'dash-header__title--center': !sidebarOpen }]"><h1>Overview</h1><p v-if="sidebarOpen">Todos os fluxos, credenciais e execuções em um só lugar.</p></div>
          <div class="dash-create" ref="createMenuEl">
            <div class="dash-create__buttons">
              <button type="button" class="dash-create__primary" @click="$router.push({ name: 'workflow-builder' })">
                Criar workflow
              </button>
              <button type="button" class="dash-create__dropdown" @click="toggleCreateMenu">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>
            <transition name="fade">
              <div v-if="createMenuOpen" class="dash-dropdown">
                <button type="button">A partir de template</button>
                <button type="button">Importar arquivo</button>
              </div>
            </transition>
          </div>
        </header>

        <section class="dash-stats">
          <article
            v-for="card in statsCards"
            :key="card.key"
            class="dash-stat-card"
          >
            <p class="dash-stat-card__label">{{ card.label }}</p>
            <p class="dash-stat-card__sub">{{ card.sub }}</p>
            <p class="dash-stat-card__value">
              <span v-if="loading && !overview" class="dash-skeleton dash-skeleton--text" />
              <span v-else>{{ card.value }}</span>
            </p>
          </article>
        </section>

        <nav class="dash-tabs" aria-label="Visões">
          <button
            type="button"
            :class="['dash-tab', { 'dash-tab--active': activeTab === 'workflows' }]"
            @click="activeTab = 'workflows'"
          >
            Workflows
          </button>
          <button
            type="button"
            :class="['dash-tab', { 'dash-tab--active': activeTab === 'credentials' }]"
            @click="activeTab = 'credentials'"
          >
            Credenciais
          </button>
          <button
            type="button"
            :class="['dash-tab', { 'dash-tab--active': activeTab === 'executions' }]"
            @click="activeTab = 'executions'"
          >
            Execuções
          </button>
        </nav>

        <div class="dash-toolbar">
          <div class="dash-search">
            <span class="dash-search__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar workflows"
              aria-label="Buscar workflows"
            />
          </div>
          <div class="dash-toolbar__actions">
            <div class="dash-toolbar__group" ref="sortMenuEl">
            <button type="button" class="dash-toolbar__button" @click="toggleSortMenu">
              <span>Ordenar por {{ sortLabel }}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
              <transition name="fade">
                <div v-if="sortMenuOpen" class="dash-dropdown">
                  <button type="button" @click="selectSort('updatedAt')">Última atualização</button>
                  <button type="button" @click="selectSort('createdAt')">Data de criação</button>
                  <button type="button" @click="selectSort('title')">Nome</button>
                </div>
              </transition>
            </div>
            <button type="button" class="dash-toolbar__icon" :aria-label="sortDir === 'asc' ? 'Ordenar ascendente' : 'Ordenar descendente'" @click="toggleSortDirection">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14" stroke-width="2" stroke-linecap="round" />
                <path d="M8 9l4-4 4 4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button type="button" class="dash-toolbar__icon" aria-label="Filtros">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 5h18M6 12h12M10 19h4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <button type="button" class="dash-toolbar__icon" aria-label="Layout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="6" rx="1" /><rect x="3" y="14" width="10" height="6" rx="1" /><rect x="15" y="14" width="6" height="6" rx="1" /></svg>
            </button>
          </div>
        </div>

        <section class="dash-list">
          <div
            v-if="loading && !overview"
            v-for="index in 3"
            :key="'loading-' + index"
            class="dash-row dash-row--loading"
          >
            <span class="dash-skeleton dash-skeleton--title" />
            <span class="dash-skeleton dash-skeleton--text" />
          </div>

          <template v-else-if="activeTab === 'workflows'">
            <div v-if="paginatedWorkflows.length === 0" class="dash-empty">
              <p>Nenhum workflow encontrado.</p>
              <p v-if="searchTerm" class="dash-empty__hint">Tente ajustar a busca ou limpar os filtros.</p>
            </div>

            <article
              v-for="project in paginatedWorkflows"
              :key="project.id"
              class="dash-row"
            >
              <div class="dash-row__info">
                <h3>{{ project.title }}</h3>
                <p class="dash-row__meta">{{ formatRelative(project.updatedAt) }} · {{ formatCreated(project.createdAt) }}</p>
                <p v-if="projectDescription(project)" class="dash-row__description">
                  {{ projectDescription(project) }}
                </p>
                <div v-if="projectTags(project).length" class="dash-tags">
                  <span v-for="tag in projectTags(project)" :key="tag" class="dash-tag">{{ tag }}</span>
                </div>
              </div>
              <div class="dash-row__badges">
                <span class="dash-pill">{{ projectScope(project) }}</span>
                <span class="dash-pill dash-pill--status">{{ project.status || 'Rascunho' }}</span>
                <button type="button" class="dash-toolbar__icon dash-toolbar__icon--ghost" aria-label="Mais ações">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                </button>
              </div>
            </article>
          </template>

          <div v-else class="dash-empty">
            <p>Conteúdo disponível em breve para esta aba.</p>
          </div>
        </section>

        <footer class="dash-pagination" ref="pageSizeMenuEl">
          <span>Total {{ totalItems }}</span>
          <div class="dash-pagination__controls">
            <button type="button" :disabled="page === 1" @click="goToPage('prev')" aria-label="Página anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <span class="dash-pagination__current">{{ page }}</span>
            <button type="button" :disabled="page === totalPages" @click="goToPage('next')" aria-label="Próxima página">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
          <div class="dash-pagination__size">
            <button type="button" class="dash-toolbar__button" @click="togglePageSizeMenu">
              {{ perPage }}/página
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <transition name="fade">
              <div v-if="pageSizeMenuOpen" class="dash-dropdown dash-dropdown--right dash-dropdown--small">
                <button
                  v-for="size in [10, 25, 50, 100]"
                  :key="size"
                  type="button"
                  @click="setPerPage(size)"
                >
                  {{ size }}/página
                </button>
              </div>
            </transition>
          </div>
        </footer>

        <p v-if="error" class="dash-error">{{ error }}</p>

        <section class="dash-activity">
          <header>
            <h2>Atividades recentes</h2>
            <p>Integrações, execuções e eventos registrados pelo FluxoLab.</p>
          </header>
          <div v-if="overview?.activities?.length" class="dash-activity__list">
            <article
              v-for="activity in overview.activities"
              :key="activity.id"
              class="dash-activity__item"
            >
              <div>
                <p class="dash-activity__title">{{ activity.action }}</p>
                <p class="dash-activity__meta">{{ new Date(activity.createdAt).toLocaleString('pt-BR') }}</p>
              </div>
              <span class="dash-pill">{{ activity.entityType }}</span>
            </article>
          </div>
          <div v-else class="dash-empty dash-empty--compact">
            <p>Sem atividades recentes. Execute um fluxo para começar.</p>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-shell {
  min-height: 100vh;
  background: radial-gradient(120% 120% at 100% 0%, rgba(255, 77, 77, 0.08), transparent),
    linear-gradient(180deg, #1e1e1e 0%, #141414 100%);
  color: #e0e0e0;
}

.dash-layout {
  min-height: 100vh;
  display: flex;
  position: relative;
}

.dash-sidebar__backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 40;
}


.dash-sidebar {
  position: relative;
  width: 16rem;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: #171717;
  border-right: 1px solid rgba(63, 63, 70, 0.8);
  transition: width 0.25s ease;
  overflow: visible;
}

.dash-sidebar__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  transition: opacity 0.2s ease;
}

.dash-sidebar--hidden {
  width: 0;
  min-width: 0;
  border-right: none;
  pointer-events: none;
  overflow: hidden;
}

.dash-sidebar--hidden .dash-sidebar__inner {
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 767px) {
  .dash-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 15rem;
    z-index: 50;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
    transition: transform 0.25s ease;
  }

  .dash-sidebar--hidden {
    transform: translateX(-100%);
    width: 15rem;
  }

  .dash-sidebar--hidden .dash-sidebar__inner {
    opacity: 1;
  }
}

.dash-sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(63, 63, 70, 0.6);
}

.dash-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  font-size: 1.05rem;
  color: #fff;
}

.dash-brand__logo {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.6rem;
  object-fit: cover;
}

.dash-brand__name {
  letter-spacing: 0.02em;
}

.dash-sidebar__toggle {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  background: rgba(39, 39, 42, 0.6);
  border: 1px solid rgba(63, 63, 70, 0.6);
  color: #e5e5e5;
  font-size: 1rem;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dash-sidebar__toggle:hover {
  background: rgba(63, 63, 70, 0.6);
  color: #fff;
}

.dash-sidebar--hidden .dash-sidebar__toggle {
  display: none;
}

.dash-sidebar__toggle-floating {
  position: fixed;
  top: 1.2rem;
  left: 1rem;
  z-index: 55;
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: rgba(23, 23, 23, 0.92);
  color: #f4f4f5;
  box-shadow: 0 16px 28px -20px rgba(0, 0, 0, 0.7);
}

.dash-sidebar__toggle-floating:hover {
  background: rgba(63, 63, 70, 0.75);
}

.dash-sidebar__toggle-floating svg {
  width: 1.2rem;
  height: 1.2rem;
}

@media (max-width: 767px) {
  .dash-sidebar__toggle-floating {
    display: none;
  }
}

.dash-nav {
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.dash-nav__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.75rem;
  color: #9ca3af;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-size: 0.85rem;
}

.dash-nav__item svg {
  flex-shrink: 0;
}

.dash-nav__item svg {
  width: 18px;
  height: 18px;
}

.dash-nav__item:hover {
  background: rgba(63, 63, 70, 0.45);
  color: #f3f4f6;
}

.dash-nav__item--active {
  background: #252525;
  color: #ffffff;
}

.dash-sidebar__footer {
  border-top: 1px solid rgba(63, 63, 70, 0.6);
  padding: 0.75rem;
  display: grid;
  gap: 0.35rem;
}

.dash-nav__chevron {
  margin-left: auto;
  width: 16px;
  height: 16px;
}

.dash-profile {
  position: relative;
  display: inline-flex;
  width: 100%;
  justify-content: center;
}

.dash-profile__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: rgba(37, 37, 37, 0.85);
  color: #f4f4f5;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.dash-profile__name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #e4e4e7;
}

.dash-profile__trigger:hover {
  background: rgba(63, 63, 70, 0.55);
  border-color: rgba(82, 82, 91, 0.7);
}

.dash-profile__trigger svg {
  width: 0.85rem;
  height: 0.85rem;
}

.dash-profile__avatar {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #4338ca);
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 600;
}

.dash-profile__menu {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: rgba(37, 37, 37, 0.88);
  box-shadow: 0 16px 28px -20px rgba(0, 0, 0, 0.7);
  color: #f3f4f6;
  font-size: 0.85rem;
}

.dash-profile__menu button {
  border: none;
  background: transparent;
  color: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.dash-profile__menu button:hover {
  color: #cbd5f5;
}

.dash-profile__menu--danger {
  color: #fca5a5;
}

.dash-profile__menu--danger:hover {
  color: #f87171;
}

.dash-profile__menu span[aria-hidden] {
  color: rgba(148, 163, 184, 0.45);
  font-weight: 500;
}

.dash-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 3rem;
}


.dash-topbar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid rgba(63, 63, 70, 0.6);
  background: #1b1b1b;
}

.dash-topbar__title {
  font-weight: 600;
  color: #f3f4f6;
}

.dash-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid rgba(63, 63, 70, 0.6);
}

@media (min-width: 768px) {
  .dash-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.dash-header h1 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #ffffff;
}

.dash-header p {
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

.dash-header__title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.35rem;
  text-align: left;
}

.dash-header__title--center {
  align-items: center;
  text-align: center;
}

.dash-header__title--center h1 {
  font-size: 1.7rem;
}

.dash-create {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
}

.dash-create__buttons {
  display: inline-flex;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px -28px rgba(255, 77, 77, 0.6);
}

.dash-create__primary {
  background: linear-gradient(135deg, #ff4d4d, #e63939);
  padding: 0.65rem 1.15rem;
  color: #fff;
  font-weight: 600;
}

.dash-create__dropdown {
  background: linear-gradient(135deg, rgba(255, 77, 77, 0.85), rgba(230, 57, 57, 0.9));
  padding: 0.65rem 0.75rem;
  display: grid;
  place-items: center;
  color: #fff;
}

.dash-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 12rem;
  background: #1b1b1b;
  border: 1px solid rgba(63, 63, 70, 0.8);
  border-radius: 0.75rem;
  box-shadow: 0 32px 60px -35px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  z-index: 60;
}

.dash-dropdown button {
  display: block;
  width: 100%;
  padding: 0.7rem 1rem;
  text-align: left;
  color: #d4d4d8;
}

.dash-dropdown button:hover {
  background: rgba(63, 63, 70, 0.5);
}

.dash-dropdown--right {
  right: 0;
}

.dash-dropdown--small {
  min-width: 8rem;
}

.dash-stats {
  display: grid;
  gap: 1rem;
  padding: 1.25rem 1.75rem;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.dash-stat-card {
  background: #252525;
  border: 1px solid rgba(63, 63, 70, 0.7);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dash-stat-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(226, 232, 240, 0.7);
}

.dash-stat-card__sub {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  margin-top: 0.35rem;
}

.dash-stat-card__value {
  margin-top: 0.75rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
}

.dash-tabs {
  display: flex;
  gap: 1rem;
  padding: 0 1.75rem;
  border-bottom: 1px solid rgba(63, 63, 70, 0.6);
}

.dash-tab {
  padding: 0.9rem 0;
  font-weight: 600;
  font-size: 0.9rem;
  color: #9ca3af;
  border-bottom: 2px solid transparent;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.dash-tab--active {
  color: #ff4d4d;
  border-bottom-color: #ff4d4d;
}

.dash-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.75rem 0.75rem;
}

@media (min-width: 768px) {
  .dash-toolbar {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.dash-search {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 260px;
}

.dash-search__icon {
  position: absolute;
  left: 0.8rem;
  color: #6b7280;
  display: grid;
  place-items: center;
}

.dash-search input {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: #252525;
  color: #f3f4f6;
}

.dash-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.dash-toolbar__button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: #252525;
  color: #e5e7eb;
  padding: 0.4rem 0.65rem;
  font-size: 0.8rem;
}

.dash-toolbar__button svg {
  width: 0.9rem;
  height: 0.9rem;
}

.dash-toolbar__icon {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: #252525;
  display: grid;
  place-items: center;
  color: #d4d4d8;
}

.dash-toolbar__icon--ghost {
  border: 1px solid transparent;
  background: transparent;
}

.dash-toolbar__group {
  position: relative;
}

.dash-list {
  padding: 0.75rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dash-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-radius: 1rem;
  background: #252525;
  border: 1px solid rgba(63, 63, 70, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.dash-row__info {
  display: grid;
  gap: 0.55rem;
  flex: 1;
  min-width: 0;
}

.dash-row__info h3 {
  font-size: 0.98rem;
  font-weight: 600;
  color: #ffffff;
}

.dash-row__meta {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
}

.dash-row__description {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.75);
}

.dash-row__badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
}

@media (min-width: 768px) {
  .dash-row__badges {
    align-items: center;
    flex-direction: row;
  }
}

.dash-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.dash-tag {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(63, 63, 70, 0.65);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.dash-pill {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(63, 63, 70, 0.55);
  border: 1px solid rgba(82, 82, 91, 0.6);
  font-size: 0.75rem;
  color: #e5e5e5;
}

.dash-pill--status {
  background: rgba(255, 77, 77, 0.18);
  border-color: rgba(255, 77, 77, 0.4);
  color: #ff8888;
}

.dash-row--loading {
  align-items: center;
}

.dash-skeleton {
  display: block;
  width: 100%;
  background: linear-gradient(90deg, rgba(63, 63, 70, 0.4), rgba(82, 82, 91, 0.6), rgba(63, 63, 70, 0.4));
  background-size: 200% 100%;
  animation: dashPulse 1.6s ease-in-out infinite;
  border-radius: 0.5rem;
}

.dash-skeleton--text {
  height: 0.85rem;
}

.dash-skeleton--title {
  height: 1rem;
  width: 60%;
}

@keyframes dashPulse {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: -200% 50%;
  }
}

.dash-empty {
  text-align: center;
  padding: 1.8rem;
  border-radius: 1rem;
  border: 1px dashed rgba(63, 63, 70, 0.6);
  color: rgba(226, 232, 240, 0.75);
}

.dash-empty__hint {
  margin-top: 0.4rem;
  font-size: 0.8rem;
}

.dash-empty--compact {
  padding: 1.2rem;
}

.dash-pagination {
  padding: 0.75rem 1.75rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  color: rgba(226, 232, 240, 0.7);
}

.dash-pagination__controls {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.dash-pagination__controls button {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(63, 63, 70, 0.7);
  background: #252525;
  color: #d4d4d8;
}

.dash-pagination__controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dash-pagination__current {
  min-width: 2rem;
  text-align: center;
  padding: 0.35rem 0.6rem;
  border-radius: 0.65rem;
  background: rgba(63, 63, 70, 0.5);
  border: 1px solid rgba(90, 90, 100, 0.6);
  color: #f8fafc;
}

.dash-pagination__size {
  position: relative;
}

.dash-error {
  margin: 0 1.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(248, 113, 113, 0.4);
  background: rgba(254, 202, 202, 0.08);
  color: #fecaca;
}

.dash-activity {
  margin: 1.5rem 1.75rem 0;
  border-top: 1px solid rgba(63, 63, 70, 0.6);
  padding-top: 1.5rem;
  display: grid;
  gap: 1rem;
}

.dash-activity header h2 {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
}

.dash-activity header p {
  font-size: 0.85rem;
  color: rgba(226, 232, 240, 0.7);
  margin-top: 0.3rem;
}

.dash-activity__list {
  display: grid;
  gap: 0.75rem;
}

.dash-activity__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 1rem;
  border-radius: 0.85rem;
  background: #252525;
  border: 1px solid rgba(63, 63, 70, 0.6);
}

.dash-activity__title {
  font-size: 0.9rem;
  color: #f8fafc;
}

.dash-activity__meta {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
