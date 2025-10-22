<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Logo e Header -->
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="url(#gradient1)"/>
            <circle cx="12" cy="12" r="6" fill="url(#gradient2)"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :stop-color="logoColors.teal500"/>
                <stop offset="100%" :stop-color="logoColors.teal700"/>
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :stop-color="logoColors.teal300"/>
                <stop offset="100%" :stop-color="logoColors.teal500"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span v-if="!collapsed" class="logo-text">FluxoLab</span>
      </div>
      <button class="sidebar__add-btn" @click="$emit('add')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <!-- Navegação Principal -->
    <nav class="sidebar__nav">
      <div class="nav-section">
        <NavItem
          v-for="item in mainNavItems"
          :key="item.id"
          :item="item"
          :active="item.id === activeItem"
          @click="$emit('navigate', item)"
        />
      </div>

      <!-- Seção de Projetos -->
      <div class="nav-section">
        <div class="nav-section__header">
          <span v-if="!collapsed" class="nav-section__title">Projects</span>
          <button v-if="!collapsed" class="nav-section__add" @click="$emit('add-project')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add project
          </button>
        </div>
      </div>

      <!-- Seção de Recursos -->
      <div class="nav-section">
        <NavItem
          v-for="item in resourceItems"
          :key="item.id"
          :item="item"
          :active="item.id === activeItem"
          @click="$emit('navigate', item)"
        />
      </div>

      <!-- Seção de Ajuda -->
      <div class="nav-section">
        <NavItem
          :item="helpItem"
          :active="helpItem.id === activeItem"
          :expanded="helpExpanded"
          @click="toggleHelp"
        />
        <div v-if="helpExpanded && !collapsed" class="nav-subsection">
          <NavItem
            v-for="item in helpSubItems"
            :key="item.id"
            :item="item"
            :active="item.id === activeItem"
            :sub-item="true"
            @click="$emit('navigate', item)"
          />
        </div>
      </div>

      <!-- Seção de Novidades -->
      <div class="nav-section">
        <NavItem
          :item="whatsNewItem"
          :active="whatsNewItem.id === activeItem"
          :expanded="whatsNewExpanded"
          @click="toggleWhatsNew"
        />
        <div v-if="whatsNewExpanded && !collapsed" class="nav-subsection">
          <NavItem
            v-for="item in whatsNewSubItems"
            :key="item.id"
            :item="item"
            :active="item.id === activeItem"
            :sub-item="true"
            @click="$emit('navigate', item)"
          />
        </div>
      </div>

      <!-- Notificação de Atualização -->
      <div v-if="!collapsed" class="update-notification">
        <div class="update-notification__content">
          <span class="update-notification__text">1 version behind</span>
          <button class="btn btn-success btn-sm">Update</button>
        </div>
      </div>
    </nav>

    <!-- Perfil do Usuário -->
    <div class="sidebar__footer">
      <div class="user-profile">
        <div class="user-avatar">
          <span>{{ userInitials }}</span>
        </div>
        <div v-if="!collapsed" class="user-info">
          <span class="user-name">{{ userName }}</span>
          <button class="user-menu-btn" @click="toggleUserMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu do Usuário -->
      <div v-if="userMenuOpen" class="user-menu">
        <button class="user-menu__item" @click="$emit('navigate', { id: 'settings' })">
          Settings
        </button>
        <button class="user-menu__item" @click="$emit('signout')">
          Sign out
        </button>
      </div>
    </div>

    <!-- Botão de Colapsar -->
    <button class="sidebar__collapse" @click="toggleCollapse">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15,18 9,12 15,6"></polyline>
      </svg>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import NavItem from './NavItem.vue';

interface NavItemType {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  subItems?: NavItemType[];
}

const props = defineProps<{
  activeItem?: string;
  collapsed?: boolean;
  userName?: string;
}>();

const emit = defineEmits<{
  navigate: [item: NavItemType];
  add: [];
  'add-project': [];
  signout: [];
}>();

const collapsed = ref(props.collapsed || false);
const helpExpanded = ref(false);
const whatsNewExpanded = ref(true);
const userMenuOpen = ref(false);

// Cores da logo - definidas como variáveis CSS (Teal/Cyan)
const logoColors = {
  teal500: '#00CED1',
  teal700: '#00B8B8',
  teal300: '#5eead4'
};

const userInitials = computed(() => {
  if (!props.userName) return 'U';
  return props.userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

const mainNavItems: NavItemType[] = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'personal', label: 'Personal', icon: 'user' },
  { id: 'shared', label: 'Shared with you', icon: 'share' },
];

const resourceItems: NavItemType[] = [
  { id: 'admin', label: 'Admin Panel', icon: 'cloud' },
  { id: 'templates', label: 'Templates', icon: 'puzzle' },
  { id: 'variables', label: 'Variables', icon: 'percent' },
  { id: 'insights', label: 'Insights', icon: 'bar-chart' },
];

const helpItem: NavItemType = {
  id: 'help',
  label: 'Help',
  icon: 'help-circle',
};

const helpSubItems: NavItemType[] = [
  { id: 'quickstart', label: 'Quickstart', icon: 'play' },
  { id: 'docs', label: 'Documentation', icon: 'file-text' },
  { id: 'forum', label: 'Forum', icon: 'users' },
  { id: 'course', label: 'Course', icon: 'graduation-cap' },
  { id: 'bug', label: 'Report a bug', icon: 'bug' },
  { id: 'about', label: 'About FluxoLab', icon: 'info' },
];

const whatsNewItem: NavItemType = {
  id: 'whats-new',
  label: 'What\'s New',
  icon: 'bell',
  badge: '3',
};

const whatsNewSubItems: NavItemType[] = [
  { id: 'data-tables', label: 'Data tables', icon: 'circle' },
  { id: 'python-tasks', label: 'Native Python task r...', icon: 'circle' },
  { id: 'changelog', label: 'Full changelog', icon: 'external-link' },
];

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  emit('navigate', { id: 'toggle-collapse', label: 'Toggle Collapse', icon: 'menu' });
}

function toggleHelp() {
  helpExpanded.value = !helpExpanded.value;
}

function toggleWhatsNew() {
  whatsNewExpanded.value = !whatsNewExpanded.value;
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--border-soft);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sidebar__add-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.sidebar__add-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.sidebar__nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0.5rem;
}

.nav-section__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.nav-section__add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.nav-section__add:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.nav-subsection {
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.update-notification {
  margin: 1rem;
  padding: 1rem;
  background: var(--surface-muted);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-soft);
}

.update-notification__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.update-notification__text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.sidebar__footer {
  padding: 1rem;
  border-top: 1px solid var(--border-soft);
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.user-menu-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.user-menu {
  position: absolute;
  bottom: 100%;
  right: 1rem;
  margin-bottom: 0.5rem;
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem 0;
  min-width: 120px;
}

.user-menu__item {
  width: 100%;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.user-menu__item:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.sidebar__collapse {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.sidebar__collapse:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.sidebar--collapsed .sidebar__collapse svg {
  transform: rotate(180deg);
}

/* Scrollbar personalizada */
.sidebar__nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar__nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar__nav::-webkit-scrollbar-thumb {
  background: var(--border-soft);
  border-radius: 2px;
}

.sidebar__nav::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}
</style>
