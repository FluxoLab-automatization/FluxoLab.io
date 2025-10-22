<template>
  <div class="trigger-selector">
    <div class="trigger-selector__header">
      <h1 class="trigger-title">What triggers this workflow?</h1>
      <p class="trigger-subtitle">A trigger is a step that starts your workflow</p>
    </div>

    <div class="search-container">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input 
          type="text" 
          placeholder="Search nodes..." 
          class="search-input"
          v-model="searchQuery"
        />
      </div>
    </div>

    <div class="triggers-list">
      <div
        v-for="trigger in filteredTriggers"
        :key="trigger.id"
        class="trigger-item"
        @click="selectTrigger(trigger)"
      >
        <div class="trigger-item__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <!-- Manual Trigger -->
            <path v-if="trigger.icon === 'manual'" d="M9 9h6v6H9z"></path>
            <path v-if="trigger.icon === 'manual'" d="M9 9l6 6"></path>
            <path v-if="trigger.icon === 'manual'" d="M15 9l-6 6"></path>
            
            <!-- App Event -->
            <path v-if="trigger.icon === 'app-event'" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            
            <!-- Schedule -->
            <circle v-if="trigger.icon === 'schedule'" cx="12" cy="12" r="10"></circle>
            <polyline v-if="trigger.icon === 'schedule'" points="12,6 12,12 16,14"></polyline>
            
            <!-- Webhook -->
            <path v-if="trigger.icon === 'webhook'" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path v-if="trigger.icon === 'webhook'" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            
            <!-- Form -->
            <path v-if="trigger.icon === 'form'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline v-if="trigger.icon === 'form'" points="14,2 14,8 20,8"></polyline>
            <line v-if="trigger.icon === 'form'" x1="16" y1="13" x2="8" y2="13"></line>
            <line v-if="trigger.icon === 'form'" x1="16" y1="17" x2="8" y2="17"></line>
            <polyline v-if="trigger.icon === 'form'" points="10,9 9,9 8,9"></polyline>
            
            <!-- Workflow -->
            <rect v-if="trigger.icon === 'workflow'" x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path v-if="trigger.icon === 'workflow'" d="M9 9h6v6H9z"></path>
            <path v-if="trigger.icon === 'workflow'" d="M9 9l6 6"></path>
            <path v-if="trigger.icon === 'workflow'" d="M15 9l-6 6"></path>
            
            <!-- Chat -->
            <path v-if="trigger.icon === 'chat'" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path v-if="trigger.icon === 'chat'" d="M8 9h8"></path>
            <path v-if="trigger.icon === 'chat'" d="M8 13h6"></path>
            
            <!-- Evaluation -->
            <path v-if="trigger.icon === 'evaluation'" d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
            <rect v-if="trigger.icon === 'evaluation'" x="9" y="3" width="6" height="8" rx="1"></rect>
            <path v-if="trigger.icon === 'evaluation'" d="M9 9h6"></path>
            <path v-if="trigger.icon === 'evaluation'" d="M9 13h6"></path>
            
            <!-- Other -->
            <path v-if="trigger.icon === 'other'" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline v-if="trigger.icon === 'other'" points="14,2 14,8 20,8"></polyline>
            <line v-if="trigger.icon === 'other'" x1="16" y1="13" x2="8" y2="13"></line>
            <line v-if="trigger.icon === 'other'" x1="16" y1="17" x2="8" y2="17"></line>
            <polyline v-if="trigger.icon === 'other'" points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <div class="trigger-item__content">
          <h3 class="trigger-item__title">{{ trigger.title }}</h3>
          <p class="trigger-item__description">{{ trigger.description }}</p>
        </div>
        <div v-if="trigger.hasSubmenu" class="trigger-item__arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Trigger {
  id: string;
  title: string;
  description: string;
  icon: string;
  hasSubmenu?: boolean;
}

const props = defineProps<{
  selectedTrigger?: string;
}>();

const emit = defineEmits<{
  select: [trigger: Trigger];
}>();

const searchQuery = ref('');

const triggers: Trigger[] = [
  {
    id: 'manual',
    title: 'Trigger manually',
    description: 'Runs the flow on clicking a button in FluxoLab. Good for getting started quickly',
    icon: 'manual',
  },
  {
    id: 'app-event',
    title: 'On app event',
    description: 'Runs the flow when something happens in an app like Telegram, Notion or Airtable',
    icon: 'app-event',
    hasSubmenu: true,
  },
  {
    id: 'schedule',
    title: 'On a schedule',
    description: 'Runs the flow every day, hour, or custom interval',
    icon: 'schedule',
  },
  {
    id: 'webhook',
    title: 'On webhook call',
    description: 'Runs the flow on receiving an HTTP request',
    icon: 'webhook',
  },
  {
    id: 'form',
    title: 'On form submission',
    description: 'Generate webforms in FluxoLab and pass their responses to the workflow',
    icon: 'form',
  },
  {
    id: 'workflow',
    title: 'When executed by another workflow',
    description: 'Runs the flow when called by the Execute Workflow node from a different workflow',
    icon: 'workflow',
  },
  {
    id: 'chat',
    title: 'On chat message',
    description: 'Runs the flow when a user sends a chat message. For use with AI nodes',
    icon: 'chat',
  },
  {
    id: 'evaluation',
    title: 'When running evaluation',
    description: 'Run a dataset through your workflow to test performance',
    icon: 'evaluation',
  },
  {
    id: 'other',
    title: 'Other ways...',
    description: 'Runs the flow on workflow errors, file changes, etc.',
    icon: 'other',
    hasSubmenu: true,
  },
];

const filteredTriggers = computed(() => {
  if (!searchQuery.value) return triggers;
  
  return triggers.filter(trigger =>
    trigger.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    trigger.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function selectTrigger(trigger: Trigger) {
  emit('select', trigger);
}
</script>

<style scoped>
.trigger-selector {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--surface-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.trigger-selector__header {
  text-align: center;
  margin-bottom: 2rem;
}

.trigger-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.trigger-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.search-container {
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.triggers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trigger-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  background: var(--surface-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.trigger-item:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.trigger-item__icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.trigger-item:hover .trigger-item__icon {
  background: var(--accent-soft);
  color: var(--accent);
}

.trigger-item__icon svg {
  width: 24px;
  height: 24px;
}

.trigger-item__content {
  flex: 1;
}

.trigger-item__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.trigger-item__description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.trigger-item__arrow {
  width: 24px;
  height: 24px;
  color: var(--text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trigger-item__arrow svg {
  width: 16px;
  height: 16px;
}

.trigger-item:hover .trigger-item__arrow {
  color: var(--accent);
}
</style>
