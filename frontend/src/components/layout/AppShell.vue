<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <header class="app-shell__brand">
        <slot name="logo">
          <div class="app-shell__logo-fallback">FL</div>
        </slot>
        <slot name="sidebar-action" />
      </header>

      <nav class="app-shell__nav">
        <template v-for="section in navigation" :key="section.id ?? section.label">
          <p
            v-if="section.label"
            class="app-shell__section-title"
          >
            {{ section.label }}
          </p>
          <ul class="app-shell__nav-group">
            <li
              v-for="item in section.items"
              :key="item.id"
            >
              <button
                class="app-shell__nav-item"
                :class="{ 'app-shell__nav-item--active': item.active }"
                type="button"
                @click="$emit('navigate', item)"
              >
                <span class="app-shell__nav-icon" aria-hidden="true">
                  <slot :name="`icon-${item.id}`">{{ item.icon }}</slot>
                </span>
                <span class="app-shell__nav-label">{{ item.label }}</span>
                <span
                  v-if="item.badge"
                  class="app-shell__nav-badge"
                >
                  {{ item.badge }}
                </span>
              </button>
              <ul
                v-if="item.children?.length"
                class="app-shell__nav-children"
              >
                <li
                  v-for="child in item.children"
                  :key="child.id"
                >
                  <button
                    class="app-shell__nav-child"
                    :class="{ 'app-shell__nav-child--active': child.active }"
                    type="button"
                    @click="$emit('navigate', child)"
                  >
                    {{ child.label }}
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </template>
      </nav>

      <footer class="app-shell__user">
        <slot name="user" />
      </footer>
    </aside>

    <div class="app-shell__wrapper">
      <header class="app-shell__header">
        <div class="app-shell__breadcrumbs">
          <slot name="breadcrumbs" />
        </div>
        <div class="app-shell__header-actions">
          <slot name="header-actions" />
        </div>
      </header>

      <main class="app-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  active?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  id?: string;
  label?: string;
  items: NavItem[];
}

defineProps<{
  navigation: NavSection[];
}>();

defineEmits<{
  (event: 'navigate', item: NavItem): void;
}>();
</script>

<style scoped>
.app-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: var(--surface-secondary);
}

.app-shell__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 1.5rem 1.2rem;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-shell__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.app-shell__logo-fallback {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-weight: 700;
  display: grid;
  place-items: center;
}

.app-shell__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
}

.app-shell__section-title {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 0.35rem 0.4rem;
}

.app-shell__nav-group {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.25rem;
}

.app-shell__nav-item {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  font-size: 0.92rem;
  color: var(--text-secondary);
  transition: all 0.18s ease;
}

.app-shell__nav-item:hover {
  background: rgba(148, 163, 184, 0.1);
  color: var(--text-primary);
}

.app-shell__nav-item--active {
  background: rgba(255, 114, 102, 0.12);
  color: var(--accent-strong);
  font-weight: 600;
}

.app-shell__nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  background: rgba(148, 163, 184, 0.12);
  color: inherit;
  font-size: 0.85rem;
}

.app-shell__nav-label {
  flex: 1;
  text-align: left;
}

.app-shell__nav-badge {
  font-size: 0.68rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: var(--text-muted);
}

.app-shell__nav-children {
  list-style: none;
  margin: 0.4rem 0 0 2.4rem;
  padding: 0;
  display: grid;
  gap: 0.2rem;
}

.app-shell__nav-child {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 0.84rem;
  color: var(--text-muted);
  padding: 0.35rem 0.2rem;
  border-radius: var(--radius-sm);
  transition: all 0.18s ease;
}

.app-shell__nav-child:hover,
.app-shell__nav-child--active {
  color: var(--accent-strong);
  background: rgba(255, 114, 102, 0.08);
}

.app-shell__user {
  margin-top: auto;
}

.app-shell__wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-shell__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem;
  background: var(--surface-primary);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border-soft);
}

.app-shell__breadcrumbs {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.app-shell__header-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.app-shell__main {
  flex: 1;
  padding: 1.75rem 2rem 2.5rem;
  background: var(--surface-secondary);
}

@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .app-shell__sidebar {
    position: relative;
    height: auto;
    flex-direction: column;
  }
}
</style>
