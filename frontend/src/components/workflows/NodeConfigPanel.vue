<template>
  <div class="node-config-panel">
    <!-- Header -->
    <div class="config-header">
      <div class="config-header__left">
        <button class="back-btn" @click="$emit('back')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
          Back to canvas
        </button>
      </div>
      <div class="config-header__right">
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
        <button class="btn btn-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          Upgrade now
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="config-content">
      <!-- Input Panel -->
      <div class="input-panel">
        <h3 class="panel-title">INPUT</h3>
        <div class="input-content">
          <div class="input-message">
            <p>No input data yet</p>
          </div>
          <button class="btn btn-outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,11 12,14 22,4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Execute previous nodes
          </button>
          <p class="input-hint">(From the earliest node that needs it)</p>
        </div>
      </div>

      <!-- Node Configuration -->
      <div class="node-config">
        <div class="node-header">
          <div class="node-title">
            <div class="node-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              </svg>
            </div>
            <h2>{{ nodeTitle }}</h2>
          </div>
          <button class="btn btn-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"></polygon>
            </svg>
            Execute step
          </button>
        </div>

        <!-- Tabs -->
        <div class="config-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="config-tab"
            :class="{ 'config-tab--active': tab.id === activeTab }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Parameters Tab -->
          <div v-if="activeTab === 'parameters'" class="parameters-content">
            <!-- Tip Banner -->
            <div class="tip-banner">
              <div class="tip-banner__content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
                  <rect x="9" y="3" width="6" height="8" rx="1"></rect>
                </svg>
                <div class="tip-text">
                  <p>Get a feel for agents with our quick tutorial or see an example of how this node works</p>
                </div>
              </div>
              <button class="tip-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Parameters Form -->
            <div class="parameters-form">
              <div class="form-group">
                <label class="form-label">Source for Prompt (User Message)</label>
                <select class="form-select">
                  <option>Connected Chat Trigger Node</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Prompt (User Message)</label>
                <div class="form-textarea-container">
                  <button class="form-function-btn">fx</button>
                  <textarea 
                    class="form-textarea"
                    v-model="promptMessage"
                    placeholder="Enter your prompt here..."
                  ></textarea>
                  <button class="form-tag-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <div class="form-toggle">
                  <label class="toggle-label">
                    <input type="checkbox" class="toggle-input" v-model="requireOutputFormat">
                    <span class="toggle-slider"></span>
                    Require Specific Output Format
                  </label>
                </div>
              </div>

              <div class="form-group">
                <div class="form-toggle">
                  <label class="toggle-label">
                    <input type="checkbox" class="toggle-input" v-model="enableFallback">
                    <span class="toggle-slider"></span>
                    Enable Fallback Model
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Options</label>
                <div class="options-section">
                  <p class="options-text">No properties</p>
                  <button class="btn btn-outline btn-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                    Add Option
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom Sections -->
            <div class="bottom-sections">
              <div class="section-item">
                <h4 class="section-title">Chat Model *</h4>
                <button class="btn btn-outline btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              <div class="section-item">
                <h4 class="section-title">Memory</h4>
                <button class="btn btn-outline btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
              <div class="section-item">
                <h4 class="section-title">Tool</h4>
                <button class="btn btn-outline btn-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="settings-content">
            <p>Settings configuration will go here</p>
          </div>

          <!-- Docs Tab -->
          <div v-if="activeTab === 'docs'" class="docs-content">
            <p>Documentation will go here</p>
          </div>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="output-panel">
        <div class="output-header">
          <h3 class="panel-title">OUTPUT</h3>
          <button class="edit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
        <div class="output-content">
          <p class="output-message">
            Execute this node to view data or 
            <span class="mock-data-link">set mock data</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="config-footer">
      <div class="footer-left">
        <select class="footer-select">
          <option>When will this node trigger my flow?</option>
        </select>
      </div>
      <div class="footer-center">
        <div class="user-info">
          <div class="user-avatar">JN</div>
          <span class="user-name">Juliano Nicola</span>
        </div>
      </div>
      <div class="footer-right">
        <div class="footer-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
            <rect x="9" y="3" width="6" height="8" rx="1"></rect>
          </svg>
          <input type="text" placeholder="I wish this node would..." class="footer-input-field">
        </div>
        <button class="footer-star-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  nodeTitle?: string;
  trialDays?: number;
  trialExecutions?: number;
  trialLimit?: number;
}>();

const emit = defineEmits<{
  back: [];
}>();

const activeTab = ref('parameters');
const promptMessage = ref('{{ $json.chatInput }}');
const requireOutputFormat = ref(false);
const enableFallback = ref(false);

const tabs = [
  { id: 'parameters', label: 'Parameters' },
  { id: 'settings', label: 'Settings' },
  { id: 'docs', label: 'Docs' },
];
</script>

<style scoped>
.node-config-panel {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--surface-secondary);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-soft);
}

.config-header__left {
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  color: var(--text-primary);
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.config-header__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trial-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.trial-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.trial-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.trial-progress__bar {
  width: 120px;
  height: 4px;
  background: var(--surface-muted);
  border-radius: 2px;
  overflow: hidden;
}

.trial-progress__fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.trial-count {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.config-content {
  flex: 1;
  display: flex;
  min-height: 0;
}

.input-panel,
.output-panel {
  width: 200px;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-soft);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.output-panel {
  border-right: none;
  border-left: 1px solid var(--border-soft);
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--text-muted);
  margin-bottom: 2rem;
  text-align: center;
}

.input-content,
.output-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.input-message,
.output-message {
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.mock-data-link {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.edit-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.node-config {
  flex: 1;
  background: var(--surface-primary);
  display: flex;
  flex-direction: column;
}

.node-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-soft);
}

.node-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.node-icon {
  width: 32px;
  height: 32px;
  color: var(--accent);
}

.node-icon svg {
  width: 100%;
  height: 100%;
}

.node-title h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.config-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-soft);
}

.config-tab {
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

.config-tab:hover {
  color: var(--text-primary);
}

.config-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.tip-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.tip-banner__content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tip-banner svg {
  width: 20px;
  height: 20px;
  color: var(--accent);
  flex-shrink: 0;
}

.tip-text p {
  color: var(--text-primary);
  font-size: 0.875rem;
  margin: 0;
}

.tip-close {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tip-close:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.parameters-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-textarea-container {
  position: relative;
  display: flex;
  align-items: stretch;
}

.form-function-btn {
  position: absolute;
  left: 0.75rem;
  top: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.form-function-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.form-textarea {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-tag-btn {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--border-soft);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.form-tag-btn:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.form-tag-btn svg {
  width: 14px;
  height: 14px;
}

.form-toggle {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.toggle-input {
  display: none;
}

.toggle-slider {
  width: 44px;
  height: 24px;
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.toggle-input:checked + .toggle-slider {
  background: var(--accent);
  border-color: var(--accent);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.options-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--surface-muted);
  border-radius: var(--radius-md);
}

.options-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.bottom-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-soft);
}

.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.config-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: var(--surface-primary);
  border-top: 1px solid var(--border-soft);
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.footer-center {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-input {
  position: relative;
  display: flex;
  align-items: center;
}

.footer-input svg {
  position: absolute;
  left: 0.75rem;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
}

.footer-input-field {
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  width: 200px;
}

.footer-input-field:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.footer-star-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--accent);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-star-btn:hover {
  background: var(--accent-strong);
  transform: translateY(-1px);
}

.footer-star-btn svg {
  width: 16px;
  height: 16px;
}
</style>

