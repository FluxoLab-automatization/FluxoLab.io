<template>
  <div class="webhook-config">
    <div class="webhook-config__header">
      <div class="webhook-header">
        <h2 class="webhook-title">Webhook</h2>
        <button class="btn btn-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
            <rect x="9" y="3" width="6" height="8" rx="1"></rect>
          </svg>
          Listen for test event
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
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Parameters Tab -->
      <div v-if="activeTab === 'parameters'" class="parameters-content">
        <!-- Webhook URLs Section -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">Webhook URLs</h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
          
          <div class="url-tabs">
            <button 
              class="url-tab"
              :class="{ 'url-tab--active': urlTab === 'test' }"
              @click="urlTab = 'test'"
            >
              Test URL
            </button>
            <button 
              class="url-tab"
              :class="{ 'url-tab--active': urlTab === 'production' }"
              @click="urlTab = 'production'"
            >
              Production URL
            </button>
          </div>

          <div class="url-display">
            <div class="url-container">
              <button class="url-method">GET</button>
              <div class="url-text">{{ webhookUrl }}</div>
            </div>
          </div>
        </div>

        <!-- HTTP Method -->
        <div class="form-group">
          <label class="form-label">HTTP Method</label>
          <select class="form-select" v-model="httpMethod">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <!-- Path -->
        <div class="form-group">
          <label class="form-label">Path</label>
          <input 
            type="text" 
            class="form-input"
            v-model="webhookPath"
            placeholder="Enter webhook path"
          />
        </div>

        <!-- Authentication -->
        <div class="form-group">
          <label class="form-label">Authentication</label>
          <select class="form-select" v-model="authentication">
            <option value="none">None</option>
            <option value="basic">Basic Auth</option>
            <option value="bearer">Bearer Token</option>
            <option value="api-key">API Key</option>
          </select>
        </div>

        <!-- Respond -->
        <div class="form-group">
          <label class="form-label">Respond</label>
          <select class="form-select" v-model="respondMode">
            <option value="immediately">Immediately</option>
            <option value="when-workflow-completes">When workflow completes</option>
            <option value="never">Never</option>
          </select>
        </div>

        <!-- Warning Message -->
        <div class="warning-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <p>If you are sending back a response, add a "Content-Type" response header with the appropriate value to avoid unexpected behavior</p>
        </div>

        <!-- Options -->
        <div class="form-group">
          <label class="form-label">Options</label>
          <div class="options-section">
            <p class="options-text">No properties</p>
            <button class="btn btn-outline btn-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
              Add option
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

    <!-- Additional Content -->
    <div class="additional-content">
      <div class="pull-events">
        <h3 class="pull-events__title">Pull in events from Webhook</h3>
        <button class="btn btn-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"></path>
            <rect x="9" y="3" width="6" height="8" rx="1"></rect>
          </svg>
          Listen for test event
        </button>
        <p class="pull-events__description">
          Once you've finished building your workflow, run it without having to click this button by using the production webhook URL. 
          <a href="#" class="more-info-link">More info</a>
        </p>
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
import { ref, computed } from 'vue';

const activeTab = ref('parameters');
const urlTab = ref('test');
const httpMethod = ref('GET');
const webhookPath = ref('b5a2ff4e-fcd5-48e6-b98c-ca577b5d44c8');
const authentication = ref('none');
const respondMode = ref('immediately');

const tabs = [
  { id: 'parameters', label: 'Parameters' },
  { id: 'settings', label: 'Settings' },
  { id: 'docs', label: 'Docs' },
];

const webhookUrl = computed(() => {
  const baseUrl = 'https://unimedpatosdeminas.app.fluxolab.cloud/webhook-test';
  return `${baseUrl}/${webhookPath.value}`;
});
</script>

<style scoped>
.webhook-config {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--surface-secondary);
}

.webhook-config__header {
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-soft);
  padding: 1.5rem;
}

.webhook-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.webhook-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
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
  background: var(--surface-primary);
}

.section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.section-header svg {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  cursor: pointer;
}

.url-tabs {
  display: flex;
  margin-bottom: 1rem;
}

.url-tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.url-tab:hover {
  color: var(--text-primary);
}

.url-tab--active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.url-display {
  background: var(--surface-muted);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.url-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.url-method {
  padding: 0.5rem 1rem;
  background: var(--surface-primary);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.url-method:hover {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}

.url-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--surface-primary);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
  flex: 1;
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

.form-select,
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--surface-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.warning-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.warning-message svg {
  width: 20px;
  height: 20px;
  color: #f59e0b;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.warning-message p {
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
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

.additional-content {
  background: var(--surface-primary);
  border-top: 1px solid var(--border-soft);
  padding: 1.5rem;
}

.pull-events {
  text-align: center;
}

.pull-events__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.pull-events__description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 1rem 0 0 0;
}

.more-info-link {
  color: var(--accent);
  text-decoration: underline;
}

.output-panel {
  background: var(--surface-primary);
  border-top: 1px solid var(--border-soft);
  padding: 1.5rem;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 300;
  color: var(--text-muted);
  margin: 0;
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

.output-content {
  text-align: center;
}

.output-message {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin: 0;
}

.mock-data-link {
  color: var(--accent);
  text-decoration: underline;
  cursor: pointer;
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
