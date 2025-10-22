<template>
  <header class="header">
    <!-- Barra de Trial/Upgrade -->
    <div v-if="showTrialBar" class="trial-bar">
      <div class="trial-bar__content">
        <div class="trial-info">
          <span class="trial-text">{{ trialDays }} days left in your FluxoLab trial</span>
          <div class="trial-progress">
            <div class="trial-progress__bar">
              <div 
                class="trial-progress__fill" 
                :style="{ width: `${(trialExecutions / trialLimit) * 100}%` }"
              ></div>
            </div>
            <span class="trial-count">{{ trialExecutions }}/{{ trialLimit }} Executions</span>
          </div>
        </div>
        <button class="btn btn-success" @click="$emit('upgrade')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Upgrade now
        </button>
        <button class="trial-bar__close" @click="hideTrialBar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Header Principal -->
    <div class="header__main">
      <div class="header__left">
        <div class="breadcrumb">
          <span v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb__item">
            <span v-if="index > 0" class="breadcrumb__separator">/</span>
            <span class="breadcrumb__text">{{ crumb }}</span>
          </span>
        </div>
        <button v-if="showAddTag" class="btn btn-outline btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add tag
        </button>
      </div>

      <div class="header__center">
        <div class="workflow-status">
          <div class="status-toggle">
            <span class="status-label">Inactive</span>
            <button 
              class="toggle-switch"
              :class="{ 'toggle-switch--active': isActive }"
              @click="toggleStatus"
            >
              <div class="toggle-switch__thumb"></div>
            </button>
          </div>
        </div>
      </div>

      <div class="header__right">
        <button class="btn btn-outline">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Share
        </button>

        <button class="btn btn-accent" @click="$emit('save')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17,21 17,13 7,13 7,21"></polyline>
            <polyline points="7,3 7,8 15,8"></polyline>
          </svg>
          Save
        </button>

        <div class="header__menu">
          <button class="menu-trigger" @click="toggleMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>

          <div v-if="menuOpen" class="dropdown-menu">
            <button class="dropdown-menu__item" @click="$emit('duplicate')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>
            <button class="dropdown-menu__item" @click="$emit('download')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </button>
            <button class="dropdown-menu__item" @click="$emit('rename')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Rename
            </button>
            <div class="dropdown-menu__separator"></div>
            <button class="dropdown-menu__item" @click="$emit('settings')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              Settings
            </button>
          </div>
        </div>

        <button class="btn btn-ghost" @click="$emit('star')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
          </svg>
          {{ starCount }}
        </button>
      </div>
    </div>

    <!-- Tabs de Navegação -->
    <div v-if="showTabs" class="header__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ 'tab--active': tab.id === activeTab }"
        @click="$emit('tab-change', tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  id: string;
  label: string;
}

const props = defineProps<{
  showTrialBar?: boolean;
  trialDays?: number;
  trialExecutions?: number;
  trialLimit?: number;
  breadcrumbs?: string[];
  showAddTag?: boolean;
  isActive?: boolean;
  showTabs?: boolean;
  tabs?: Tab[];
  activeTab?: string;
  starCount?: number;
}>();

const emit = defineEmits<{
  upgrade: [];
  save: [];
  duplicate: [];
  download: [];
  rename: [];
  settings: [];
  star: [];
  'tab-change': [tabId: string];
}>();

const menuOpen = ref(false);
const showTrialBar = ref(props.showTrialBar ?? true);

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function toggleStatus() {
  // Emit status change
}

function hideTrialBar() {
  showTrialBar.value = false;
}
</script>

<style scoped>
.header {
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-soft);
  position: sticky;
  top: 0;
  z-index: 100;
}

.trial-bar {
  background: var(--gradient-primary);
  color: var(--text-inverse);
  padding: 0.75rem 1rem;
}

.trial-bar__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.trial-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trial-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.trial-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trial-progress__bar {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.trial-progress__fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
}

.trial-count {
  font-size: 0.75rem;
  font-weight: 500;
}

.trial-bar__close {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.trial-bar__close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header__main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  min-height: 64px;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb__separator {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.breadcrumb__text {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.header__center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.workflow-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.toggle-switch--active {
  background: var(--success);
  border-color: var(--success);
}

.toggle-switch__thumb {
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

.toggle-switch--active .toggle-switch__thumb {
  transform: translateX(20px);
}

.header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header__menu {
  position: relative;
}

.menu-trigger {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.menu-trigger:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 1000;
}

.dropdown-menu__item {
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
}

.dropdown-menu__item:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.dropdown-menu__item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.dropdown-menu__separator {
  height: 1px;
  background: var(--border-soft);
  margin: 0.5rem 0;
}

.header__tabs {
  display: flex;
  border-top: 1px solid var(--border-soft);
  padding: 0 1.5rem;
}

.tab {
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tab:hover {
  color: var(--text-primary);
  background: var(--surface-muted);
}

.tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
  background: var(--accent-soft);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}
</style>
