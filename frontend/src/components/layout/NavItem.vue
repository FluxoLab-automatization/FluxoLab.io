<template>
  <button
    class="nav-item"
    :class="{
      'nav-item--active': active,
      'nav-item--sub': subItem,
      'nav-item--collapsed': collapsed
    }"
    @click="handleClick"
  >
    <div class="nav-item__icon">
      <svg v-if="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path v-if="icon === 'home'" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <path v-if="icon === 'user'" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle v-if="icon === 'user'" cx="12" cy="7" r="4"></circle>
        <path v-if="icon === 'share'" d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline v-if="icon === 'share'" points="16,6 12,2 8,6"></polyline>
        <line v-if="icon === 'share'" x1="12" y1="2" x2="12" y2="15"></line>
        <path v-if="icon === 'cloud'" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
        <path v-if="icon === 'puzzle'" d="M19.439 13.269l-1.472-1.473a1.75 1.75 0 0 1 0-2.474l1.472-1.473a1.75 1.75 0 0 1 2.474 0l1.472 1.473a1.75 1.75 0 0 1 0 2.474l-1.472 1.473a1.75 1.75 0 0 1-2.474 0z"></path>
        <path v-if="icon === 'percent'" d="M19 5L5 19"></path>
        <circle v-if="icon === 'percent'" cx="6.5" cy="6.5" r="2.5"></circle>
        <circle v-if="icon === 'percent'" cx="17.5" cy="17.5" r="2.5"></circle>
        <path v-if="icon === 'bar-chart'" d="M12 20V10"></path>
        <path v-if="icon === 'bar-chart'" d="M18 20V4"></path>
        <path v-if="icon === 'bar-chart'" d="M6 20v-4"></path>
        <path v-if="icon === 'help-circle'" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <circle v-if="icon === 'help-circle'" cx="12" cy="12" r="10"></circle>
        <path v-if="icon === 'play'" d="M5 3l14 9-14 9V3z"></path>
        <path v-if="icon === 'file-text'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline v-if="icon === 'file-text'" points="14,2 14,8 20,8"></polyline>
        <line v-if="icon === 'file-text'" x1="16" y1="13" x2="8" y2="13"></line>
        <line v-if="icon === 'file-text'" x1="16" y1="17" x2="8" y2="17"></line>
        <polyline v-if="icon === 'file-text'" points="10,9 9,9 8,9"></polyline>
        <path v-if="icon === 'users'" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle v-if="icon === 'users'" cx="9" cy="7" r="4"></circle>
        <path v-if="icon === 'users'" d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path v-if="icon === 'users'" d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        <path v-if="icon === 'graduation-cap'" d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path v-if="icon === 'graduation-cap'" d="M6 12v5c3 3 9 3 12 0v-5"></path>
        <path v-if="icon === 'bug'" d="M8 2v4"></path>
        <path v-if="icon === 'bug'" d="M16 2v4"></path>
        <path v-if="icon === 'bug'" d="M12 2v4"></path>
        <path v-if="icon === 'bug'" d="M8 10h8"></path>
        <path v-if="icon === 'bug'" d="M12 10v8"></path>
        <path v-if="icon === 'bug'" d="M8 14h8"></path>
        <path v-if="icon === 'bug'" d="M8 18h8"></path>
        <path v-if="icon === 'bug'" d="M12 22v-2"></path>
        <path v-if="icon === 'info'" d="M12 16h.01"></path>
        <circle v-if="icon === 'info'" cx="12" cy="12" r="10"></circle>
        <path v-if="icon === 'bell'" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path v-if="icon === 'bell'" d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        <path v-if="icon === 'external-link'" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline v-if="icon === 'external-link'" points="15,3 21,3 21,9"></polyline>
        <line v-if="icon === 'external-link'" x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </div>
    
    <span v-if="!collapsed" class="nav-item__label">{{ item.label }}</span>
    
    <div v-if="item.badge && !collapsed" class="nav-item__badge">
      {{ item.badge }}
    </div>
    
    <div v-if="item.subItems && !collapsed" class="nav-item__arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline v-if="!expanded" points="6,9 12,15 18,9"></polyline>
        <polyline v-else points="18,15 12,9 6,15"></polyline>
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
interface NavItemType {
  id: string;
  label: string;
  icon?: string;
  badge?: string;
  subItems?: NavItemType[];
}

const props = defineProps<{
  item: NavItemType;
  active?: boolean;
  expanded?: boolean;
  subItem?: boolean;
  collapsed?: boolean;
}>();

const emit = defineEmits<{
  click: [item: NavItemType];
}>();

function handleClick() {
  emit('click', props.item);
}
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  text-align: left;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.nav-item--active {
  background: var(--accent-soft);
  color: var(--accent);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
  border-radius: 0 2px 2px 0;
}

.nav-item--sub {
  padding-left: 2.5rem;
  font-size: 0.8125rem;
}

.nav-item--collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.nav-item__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item__icon svg {
  width: 100%;
  height: 100%;
}

.nav-item__label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item__badge {
  background: var(--danger);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item__arrow {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.nav-item__arrow svg {
  width: 100%;
  height: 100%;
}

.nav-item--collapsed .nav-item__label,
.nav-item--collapsed .nav-item__badge,
.nav-item--collapsed .nav-item__arrow {
  display: none;
}
</style>

