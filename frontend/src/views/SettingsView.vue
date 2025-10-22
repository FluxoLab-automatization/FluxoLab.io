
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session.store';
import { usePreferencesStore } from '../stores/preferences.store';
import {
  fetchSettingsSummary,
  fetchUsageAlerts,
  createApiKey,
  rotateApiKey,
  revokeApiKey,
} from '../services/settings.service';
import UsageChart from '../components/settings/UsageChart.vue';
import PlanUpgrade from '../components/settings/PlanUpgrade.vue';
import WorkflowCredentialsPanel from '../components/workflows/WorkflowCredentialsPanel.vue';
import type {
  SettingsSummary,
  FeatureGateInfo,
  WorkspaceApiKey,
  WorkspaceEnvironment,
  SecretProviderInfo,
  SsoProviderInfo,
  LdapInfo,
  LogDestinationInfo,
  CommunityConnectorInfo,
  UsageAlert,
} from '../types/api';

type SettingsSection =
  | 'usage'
  | 'personal'
  | 'api'
  | 'integrations'
  | 'features';

const router = useRouter();
const route = useRoute();
const sessionStore = useSessionStore();
const { user, token, initialized } = storeToRefs(sessionStore);
const preferencesStore = usePreferencesStore();
const { locale } = storeToRefs(preferencesStore);
const { t } = useI18n();

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => preferencesStore.setLocale(value),
});
const localeOptions = preferencesStore.localeOptions;

const sections: Array<{ id: SettingsSection; label: string; description: string }> = [
  { id: 'usage', label: 'Uso e plano', description: 'Limites, consumo e detalhes do plano atual.' },
  { id: 'personal', label: 'Perfil', description: 'Dados basicos e seguranca da conta.' },
  { id: 'api', label: 'API', description: 'Gerencie chaves programaticas e escopos.' },
  { id: 'integrations', label: 'Integracoes', description: 'Status de ambientes, SSO, LDAP e logs.' },
  { id: 'features', label: 'Recursos', description: 'Gates e beneficios liberados pelo plano.' },
];

const selectedSection = ref<SettingsSection>('usage');
const creatingApiKey = ref(false);
const revealedApiKey = ref<string | null>(null);
const loadingSummary = ref(false);
const summaryError = ref<string | null>(null);
const summary = ref<SettingsSummary | null>(null);
const apiKeys = ref<WorkspaceApiKey[]>([]);

// Usage and Plan Management
const showUpgradeModal = ref(false);
const showCancelModal = ref(false);
const showAlertModal = ref(false);
interface UsageAlertDisplay {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  channel: string;
  raw: UsageAlert;
}

const usageAlerts = ref<UsageAlertDisplay[]>([]);
const loadingAlerts = ref(false);
const apiKeyError = ref<string | null>(null);
const apiKeyMessage = ref<string | null>(null);

const DEFAULT_PLAN: SettingsSummary['plan'] = {
  planCode: 'free',
  name: 'Plano Free',
  priceAmount: 0,
  currency: 'BRL',
  billingInterval: 'month',
  trialDays: 30,
  limits: { workspaces: 1, users: 3, webhook: 2000 },
  features: {},
  subscriptionStatus: 'trialing',
  trialEndsAt: null,
  renewsAt: null,
};

const DEFAULT_USAGE = {
  workflowsActive: 0,
  usersActive: 0,
  webhookEvents: 0,
  collectedAt: new Date().toISOString(),
};

const DEFAULT_FEATURE_GATES: FeatureGateInfo[] = [
  {
    id: 'secrets',
    title: 'Segredos externos',
    requiredPlan: 'Full',
    status: 'requires_upgrade',
    copy: 'Integre cofres externos e rotacione credenciais automaticamente.',
  },
  {
    id: 'environments',
    title: 'Ambientes',
    requiredPlan: 'Intermediario',
    status: 'requires_upgrade',
    copy: 'Separe deploy por Sandbox, Staging e Producao com aprovacao.',
  },
  {
    id: 'sso',
    title: 'SSO',
    requiredPlan: 'Full',
    status: 'requires_upgrade',
    copy: 'Provisione acesso via SAML/OIDC com SCIM automatizado.',
  },
  {
    id: 'ldap',
    title: 'LDAP',
    requiredPlan: 'Full',
    status: 'requires_upgrade',
    copy: 'Sincronize diretorios legados e herancas de grupos.',
  },
  {
    id: 'logs',
    title: 'Log streaming',
    requiredPlan: 'Intermediario',
    status: 'requires_upgrade',
    copy: 'Encaminhe auditoria e execucoes para Splunk, Datadog ou S3.',
  },
  {
    id: 'community',
    title: 'Conectores comunitarios',
    requiredPlan: 'Basico',
    status: 'requires_upgrade',
    copy: 'Instale integrações criadas pela comunidade FluxoLab.',
  },
];

watch(
  () => route.params.section,
  (next) => {
    if (!next || typeof next !== 'string') {
      selectedSection.value = 'usage';
      return;
    }
    const found = sections.find((section) => section.id === next);
    selectedSection.value = found ? found.id : 'usage';
  },
  { immediate: true },
);

function selectSection(id: SettingsSection) {
  if (selectedSection.value === id) return;
  selectedSection.value = id;
  router.replace({ name: 'settings', params: { section: id } });
}

async function ensureSessionReady() {
  if (!initialized.value) {
    await sessionStore.initialize();
  }
}

async function loadSummary() {
  if (!token.value) {
    summary.value = null;
    apiKeys.value = [];
    return;
  }
  loadingSummary.value = true;
  summaryError.value = null;
  apiKeyError.value = null;
  apiKeyMessage.value = null;
  try {
    const result = await fetchSettingsSummary(token.value);
    summary.value = result;
    apiKeys.value = result.apiKeys ?? [];
    revealedApiKey.value = null;
  } catch (error) {
    summaryError.value = error instanceof Error ? error.message : 'Nao foi possivel carregar as configuracoes.';
  } finally {
    loadingSummary.value = false;
  }
}

watch(token, (newToken) => {
  if (newToken) {
    void loadSummary();
    void loadUsageAlerts();
  } else {
    summary.value = null;
    apiKeys.value = [];
    usageAlerts.value = [];
  }
});

async function loadUsageAlerts() {
  if (!token.value) {
    usageAlerts.value = [];
    return;
  }
  loadingAlerts.value = true;
  try {
    const response = await fetchUsageAlerts(token.value);
    usageAlerts.value = (response.alerts ?? []).map(presentUsageAlert);
  } catch (error) {
    console.error('Failed to load usage alerts:', error);
  } finally {
    loadingAlerts.value = false;
  }
}

function handleChartPeriodChange(period: string) {
  console.log('Chart period changed to:', period);
  // Handle period change for all charts
}

function handleUpgradeSuccess(plan: any) {
  showUpgradeModal.value = false;
  // Reload summary to get updated plan info
  loadSummary();
  // Show success message
}

function handleUpgradeError(error: string) {
  console.error('Upgrade failed:', error);
  // Show error message
}

function editAlert(alert: UsageAlertDisplay) {
  // Open alert editing modal
  console.log('Edit alert:', alert);
}

function deleteAlert(alertId: string) {
  // Delete alert
  console.log('Delete alert:', alertId);
}

async function cancelSubscription() {
  try {
    // Call cancel subscription API
    console.log('Cancelling subscription...');
    showCancelModal.value = false;
    // Show success message
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    // Show error message
  }
}

onMounted(async () => {
  await ensureSessionReady();
  if (token.value) {
    void loadSummary();
    void loadUsageAlerts();
  }
});

const currentPlan = computed(() => summary.value?.plan ?? DEFAULT_PLAN);
const usageSnapshot = computed(() => summary.value?.usage ?? DEFAULT_USAGE);

const usageIndicators = computed(() => {
  const plan = currentPlan.value;
  const usage = usageSnapshot.value;
  return [
    {
      label: 'Workflows ativos',
      value: usage.workflowsActive.toLocaleString('pt-BR'),
      hint: 'Monitorados durante o periodo',
    },
    {
      label: 'Usuarios ativos',
      value:
        usage.usersActive.toLocaleString('pt-BR') +
        (plan.limits.users !== null ? ' / ' + plan.limits.users : ''),
      hint:
        plan.limits.users !== null ? 'Limite inclui convites pendentes' : 'Plano atual sem limite de usuarios',
    },
    {
      label: 'Webhooks no mes',
      value: usage.webhookEvents.toLocaleString('pt-BR'),
      hint:
        plan.limits.webhook !== null
          ? 'Limite mensal: ' + plan.limits.webhook.toLocaleString('pt-BR')
          : 'Eventos ilimitados',
    },
  ];
});

const featureGates = computed<FeatureGateInfo[]>(() => {
  const base = new Map<string, FeatureGateInfo>();
  DEFAULT_FEATURE_GATES.forEach((gate) => base.set(gate.id, { ...gate }));
  (summary.value?.featureGates ?? []).forEach((gate) => base.set(gate.id, gate));
  return Array.from(base.values());
});

const featureGateById = computed<Record<string, FeatureGateInfo>>(() => {
  const map: Record<string, FeatureGateInfo> = {};
  featureGates.value.forEach((gate) => {
    map[gate.id] = gate;
  });
  return map;
});

const environments = computed<WorkspaceEnvironment[]>(
  () => summary.value?.environments ?? [],
);
const secretProviders = computed<SecretProviderInfo[]>(
  () => summary.value?.secretProviders ?? [],
);
const ssoProviders = computed<SsoProviderInfo[]>(
  () => summary.value?.ssoProviders ?? [],
);
const ldapInfo = computed<LdapInfo | null>(() => summary.value?.ldap ?? null);
const logDestinations = computed<LogDestinationInfo[]>(
  () => summary.value?.logDestinations ?? [],
);
const communityConnectors = computed<CommunityConnectorInfo[]>(
  () => summary.value?.communityConnectors ?? [],
);

function formatStatus(status: string): string {
  switch (status) {
    case 'configured':
    case 'active':
    case 'streaming':
      return 'Configurado';
    case 'requires_upgrade':
      return 'Requer upgrade';
    case 'available':
      return 'Disponivel';
    case 'draft':
      return 'Rascunho';
    case 'review':
      return 'Em homologacao';
    case 'error':
      return 'Com erros';
    case 'pending':
      return 'Pendente';
    case 'ready':
      return 'Pronto';
    case 'locked':
      return 'Bloqueado';
    default:
      return status;
  }
}

function metricLabel(metric: string): string {
  switch (metric) {
    case 'webhooks':
      return 'Eventos de Webhook';
    case 'users':
      return 'Usuários ativos';
    case 'workflows':
      return 'Workflows ativos';
    case 'all':
      return 'Consumo geral';
    default:
      return metric;
  }
}

function conditionLabel(condition: UsageAlert['condition']): string {
  switch (condition) {
    case 'greater_than':
      return 'Aciona quando exceder';
    case 'less_than':
      return 'Aciona quando ficar abaixo de';
    case 'equals':
      return 'Aciona quando igual a';
    default:
      return condition;
  }
}

function presentUsageAlert(alert: UsageAlert): UsageAlertDisplay {
  const title = metricLabel(alert.metric);
  const description = `${conditionLabel(alert.condition)} ${alert.threshold} (${alert.window}) via ${alert.channel}`;
  return {
    id: alert.id,
    title,
    description,
    enabled: alert.enabled,
    channel: alert.channel,
    raw: alert,
  };
}

function gateStatusLabel(gate: FeatureGateInfo | undefined): string {
  if (!gate) return 'Indisponivel';
  switch (gate.status) {
    case 'configured':
      return 'Configurado';
    case 'available':
      return 'Disponivel';
    case 'requires_upgrade':
      return 'Disponivel a partir do plano ' + gate.requiredPlan;
    case 'coming_soon':
      return 'Em breve';
    default:
      return gate.status;
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Nunca';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const personalDetails = computed(() => {
  const name = user.value?.displayName ?? '';
  const parts = name.split(' ').filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  return {
    firstName,
    lastName,
    email: user.value?.email ?? '',
    joinedAt: formatDate(user.value?.createdAt),
    lastLogin: formatDate(user.value?.lastLoginAt),
  };
});

async function handleCreateApiKey() {
  if (creatingApiKey.value || !token.value) {
    return;
  }
  creatingApiKey.value = true;
  revealedApiKey.value = null;
  apiKeyError.value = null;
  apiKeyMessage.value = null;
  try {
    const label = `API Key ${new Date().toLocaleString('pt-BR')}`;
    const response = await createApiKey(token.value, {
      label,
      scopes: ['workflows:read'],
    });
    await loadSummary();
    revealedApiKey.value = response.token;
    apiKeyMessage.value = 'Nova chave criada com sucesso. Guarde o valor exibido abaixo com segurança.';
  } catch (error) {
    apiKeyError.value =
      error instanceof Error ? error.message : 'Falha ao criar chave de API.';
  } finally {
    creatingApiKey.value = false;
  }
}

async function handleRotateKey(key: WorkspaceApiKey) {
  if (!token.value) return;
  apiKeyError.value = null;
  apiKeyMessage.value = null;
  try {
    const response = await rotateApiKey(token.value, key.id);
    const newToken = response?.token ?? null;
    await loadSummary();
    if (newToken) {
      revealedApiKey.value = newToken;
      apiKeyMessage.value = 'Chave rotacionada. Utilize o novo token exibido abaixo.';
    }
  } catch (error) {
    apiKeyError.value =
      error instanceof Error ? error.message : 'Nao foi possivel rotacionar a chave.';
  }
}

async function handleRevokeKey(key: WorkspaceApiKey) {
  if (!token.value) return;
  apiKeyError.value = null;
  apiKeyMessage.value = null;
  try {
    await revokeApiKey(token.value, key.id);
    apiKeyMessage.value = 'Chave revogada com sucesso.';
    await loadSummary();
  } catch (error) {
    apiKeyError.value =
      error instanceof Error ? error.message : 'Nao foi possivel revogar a chave.';
  }
}
</script>

<template>
  <div class="settings-shell">
    <aside class="settings-sidebar">
      <header class="settings-sidebar__header">
        <h1>Configuracoes</h1>
        <p>Personalize a experiencia do workspace FluxoLab.</p>
      </header>
      <nav class="settings-sidebar__nav">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          :class="['settings-nav__item', { 'settings-nav__item--active': section.id === selectedSection }]"
          @click="selectSection(section.id)"
        >
          <span class="settings-nav__label">{{ section.label }}</span>
          <small class="settings-nav__hint">{{ section.description }}</small>
        </button>
      </nav>
    </aside>

    <main class="settings-content">
      <div v-if="summaryError" class="settings-alert settings-alert--error">
        {{ summaryError }}
      </div>
      <div v-else-if="loadingSummary" class="settings-alert">
        Carregando configuracoes...
      </div>

      <section class="settings-section" id="usage">
        <header class="settings-section__header">
          <div>
            <h2>Uso e plano</h2>
            <p>Resumo de consumo e limites em vigor.</p>
          </div>
          <div class="settings-section__actions">
            <button @click="showUpgradeModal = true" class="btn btn--primary">
              Upgrade de Plano
            </button>
          </div>
        </header>

        <!-- Usage Statistics -->
        <div class="settings-grid settings-grid--stats">
          <article v-for="indicator in usageIndicators" :key="indicator.label" class="settings-stat">
            <h3>{{ indicator.label }}</h3>
            <p class="settings-stat__value">{{ indicator.value }}</p>
            <span class="settings-stat__meta">{{ indicator.hint }}</span>
          </article>
        </div>

        <!-- Usage Charts -->
        <div class="usage-charts">
          <UsageChart
            metric="webhooks"
            title="Eventos de Webhook"
            color="#6366f1"
            @period-change="handleChartPeriodChange"
          />
          <UsageChart
            metric="users"
            title="Usuários Ativos"
            color="#10b981"
            @period-change="handleChartPeriodChange"
          />
          <UsageChart
            metric="workflows"
            title="Workflows Ativos"
            color="#f59e0b"
            @period-change="handleChartPeriodChange"
          />
        </div>

        <!-- Current Plan Info -->
        <div class="settings-card settings-card--plan">
          <div>
            <h3>Plano atual: {{ currentPlan.name }}</h3>
            <p class="settings-muted">
              Valor base: {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currentPlan.currency }).format(currentPlan.priceAmount) }}
            </p>
            <ul class="settings-list">
              <li>Workspaces permitidos: {{ currentPlan.limits.workspaces ?? 'Ilimitado' }}</li>
              <li>Usuarios inclusos: {{ currentPlan.limits.users ?? 'Ilimitado' }}</li>
              <li>Eventos webhook/mês: {{ currentPlan.limits.webhook ?? 'Ilimitado' }}</li>
            </ul>
            <p v-if="currentPlan.trialEndsAt" class="settings-muted">
              Trial ativo ate {{ formatDate(currentPlan.trialEndsAt) }}
            </p>
            <div class="plan-actions">
              <button @click="showUpgradeModal = true" class="btn btn--primary btn--sm">
                Fazer Upgrade
              </button>
              <button @click="showCancelModal = true" class="btn btn--secondary btn--sm">
                Cancelar Assinatura
              </button>
            </div>
          </div>
        </div>

        <!-- Usage Alerts -->
        <div class="usage-alerts">
          <h3>Alertas de Uso</h3>
          <div v-if="usageAlerts.length === 0" class="no-alerts">
            <p>Nenhum alerta configurado.</p>
            <button @click="showAlertModal = true" class="btn btn--secondary btn--sm">
              Configurar Alertas
            </button>
          </div>
          <div v-else class="alerts-list">
            <div v-for="alert in usageAlerts" :key="alert.id" class="alert-item">
              <div class="alert-info">
                <h4>{{ alert.title }}</h4>
                <p>{{ alert.description }}</p>
                <span class="alert-channel">Canal: {{ alert.channel }}</span>
              </div>
              <div class="alert-actions">
                <button
                  @click="editAlert(alert)"
                  class="settings-button settings-button--secondary settings-button--compact"
                >
                  Editar
                </button>
                <button
                  @click="deleteAlert(alert.id)"
                  class="settings-button settings-button--danger settings-button--compact"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section" id="personal">
        <header class="settings-section__header">
          <div>
            <h2>Perfil pessoal</h2>
            <p>Informacoes basicas da conta autenticada.</p>
          </div>
        </header>
        <div class="settings-grid settings-grid--two">
          <article class="settings-card">
            <h3>Dados basicos</h3>
            <div class="settings-form">
              <label>
                <span>Primeiro nome</span>
                <input type="text" :value="personalDetails.firstName" readonly />
              </label>
              <label>
                <span>Sobrenome</span>
                <input type="text" :value="personalDetails.lastName" readonly />
              </label>
              <label>
                <span>Email</span>
                <input type="text" :value="personalDetails.email" readonly />
              </label>
            </div>
          </article>
          <article class="settings-card">
            <h3>Seguranca</h3>
            <p class="settings-muted">Ative 2FA para proteger acessos sensiveis.</p>
            <div class="settings-security">
              <div>
                <strong>Two factor</strong>
                <span>Desativado</span>
              </div>
              <button type="button" class="settings-button settings-button--primary">Configurar 2FA</button>
            </div>
            <div class="settings-meta-grid">
              <div>
                <span class="settings-meta-label">Conta criada</span>
                <p>{{ personalDetails.joinedAt }}</p>
              </div>
              <div>
                <span class="settings-meta-label">Ultimo acesso</span>
                <p>{{ personalDetails.lastLogin }}</p>
              </div>
            </div>
          </article>
        </div>
        <article class="settings-card settings-card--language">
          <h3>{{ t('settings.sections.language.title') }}</h3>
          <p class="settings-muted">{{ t('settings.sections.language.description') }}</p>
          <div class="settings-form">
            <label>
              <span>{{ t('settings.sections.language.selectLabel') }}</span>
              <select v-model="selectedLocale">
                <option v-for="option in localeOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <p class="settings-helper">{{ t('settings.sections.language.helper') }}</p>
          </div>
        </article>
        <div class="workflow-credentials-wrapper">
          <WorkflowCredentialsPanel />
        </div>
      </section>

      <section class="settings-section" id="api">
        <header class="settings-section__header">
          <div>
            <h2>FluxoLab API</h2>
            <p>Gerencie chaves programaticas utilizadas por automacoes.</p>
          </div>
          <button
            type="button"
            class="settings-button settings-button--primary"
            :disabled="creatingApiKey || !token"
            @click="handleCreateApiKey"
          >
            {{ creatingApiKey ? 'Gerando chave...' : 'Criar chave API' }}
          </button>
        </header>
        <article class="settings-card settings-card--api">
          <p>Use as chaves para interagir com os endpoints REST de projetos, execucoes e auditoria. Registre o header <code>X-Idempotency-Key</code> em operacoes criticas.</p>
          <div v-if="revealedApiKey" class="settings-api-reveal">
            <strong>Copie sua nova chave:</strong>
            <code>{{ revealedApiKey }}</code>
          </div>
          <p v-if="apiKeyMessage" class="settings-feedback settings-feedback--success">{{ apiKeyMessage }}</p>
          <p v-if="apiKeyError" class="settings-feedback settings-feedback--error">{{ apiKeyError }}</p>
        </article>
        <div class="settings-card settings-card--table">
          <table>
            <thead>
              <tr>
                <th>Alias</th>
                <th>Criada em</th>
                <th>Ultimo uso</th>
                <th>Preview</th>
                <th>Escopos</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="apiKeys.length === 0">
                <td colspan="7" class="settings-empty">Nenhuma chave cadastrada.</td>
              </tr>
              <tr v-for="key in apiKeys" :key="key.id">
                <td>{{ key.label }}</td>
                <td>{{ formatDate(key.createdAt) }}</td>
                <td>{{ formatDate(key.lastUsedAt) }}</td>
                <td><code>{{ key.keyPreview }}</code></td>
                <td>{{ key.scopes.join(', ') }}</td>
                <td>{{ formatStatus(key.status) }}</td>
                <td class="api-key-actions">
                  <button
                    class="settings-button settings-button--secondary settings-button--compact"
                    type="button"
                    @click="handleRotateKey(key)"
                  >
                    Rotacionar
                  </button>
                  <button
                    class="settings-button settings-button--danger settings-button--compact"
                    type="button"
                    @click="handleRevokeKey(key)"
                  >
                    Revogar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="settings-section" id="integrations">
        <header class="settings-section__header">
          <div>
            <h2>Integracoes críticas</h2>
            <p>Visao consolidada de ambientes, SSO, LDAP, logs e conectores.</p>
          </div>
        </header>
        <div class="settings-grid settings-grid--integrations">
          <article class="settings-card">
            <h3>Ambientes</h3>
            <table class="settings-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Regiao</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="environments.length === 0">
                  <td colspan="3" class="settings-empty">Nenhum ambiente configurado.</td>
                </tr>
                <tr v-for="env in environments" :key="env.id">
                  <td>{{ env.name }}</td>
                  <td>{{ formatStatus(env.status) }}</td>
                  <td>{{ env.region ?? 'Auto' }}</td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="settings-card">
            <h3>SSO</h3>
            <table class="settings-table">
              <tbody>
                <tr v-if="ssoProviders.length === 0">
                  <td class="settings-empty">Nenhum provedor configurado.</td>
                </tr>
                <tr v-for="provider in ssoProviders" :key="provider.provider">
                  <td>
                    <strong>{{ provider.provider }}</strong>
                    <div class="settings-meta-label">Status: {{ formatStatus(provider.status) }}</div>
                    <div class="settings-meta-label">Ativado em: {{ formatDate(provider.enabledAt) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="settings-card">
            <h3>LDAP</h3>
            <p class="settings-muted">
              Status atual: {{ formatStatus(ldapInfo?.status ?? 'inactive') }}
            </p>
            <p><span class="settings-meta-label">Host</span> {{ ldapInfo?.host ?? '---' }}</p>
            <p><span class="settings-meta-label">Base DN</span> {{ ldapInfo?.baseDn ?? '---' }}</p>
            <p><span class="settings-meta-label">Ultima sincronizacao</span> {{ formatDate(ldapInfo?.lastSyncedAt) }}</p>
          </article>

          <article class="settings-card">
            <h3>Streaming de logs</h3>
            <table class="settings-table">
              <tbody>
                <tr v-if="logDestinations.length === 0">
                  <td class="settings-empty">Nenhum destino configurado.</td>
                </tr>
                <tr v-for="destination in logDestinations" :key="destination.destination">
                  <td>
                    <strong>{{ destination.destination }}</strong>
                    <div class="settings-meta-label">Status: {{ formatStatus(destination.status) }}</div>
                    <div class="settings-meta-label">Ultimo envio: {{ formatDate(destination.lastStreamedAt) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="settings-card">
            <h3>Conectores comunitarios</h3>
            <table class="settings-table">
              <tbody>
                <tr v-if="communityConnectors.length === 0">
                  <td class="settings-empty">Nenhum conector habilitado.</td>
                </tr>
                <tr v-for="connector in communityConnectors" :key="connector.name">
                  <td>
                    <strong>{{ connector.name }}</strong>
                    <div class="settings-meta-label">Autor: {{ connector.author ?? 'Comunidade' }}</div>
                    <div class="settings-meta-label">Status: {{ formatStatus(connector.status) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </article>

          <article class="settings-card">
            <h3>Segredos externos</h3>
            <table class="settings-table">
              <tbody>
                <tr v-if="secretProviders.length === 0">
                  <td class="settings-empty">Nenhum provedor cadastrado.</td>
                </tr>
                <tr v-for="provider in secretProviders" :key="provider.provider">
                  <td>
                    <strong>{{ provider.provider }}</strong>
                    <div class="settings-meta-label">Status: {{ formatStatus(provider.status) }}</div>
                    <div class="settings-meta-label">Ultima sincronizacao: {{ formatDate(provider.lastSyncedAt) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </article>
        </div>
      </section>

      <section class="settings-section" id="features">
        <header class="settings-section__header">
          <div>
            <h2>Recursos e gates</h2>
            <p>Verifique quais capacidades estao liberadas no seu plano.</p>
          </div>
        </header>
        <div class="settings-grid settings-grid--features">
          <article v-for="gate in featureGates" :key="gate.id" class="settings-card settings-card--upgrade">
            <span class="settings-plan-card__tag">Plano {{ gate.requiredPlan }}</span>
            <h3>{{ gate.title }}</h3>
            <p>{{ gate.copy }}</p>
            <span class="settings-pill" :class="{ 'settings-pill--locked': gate.status === 'requires_upgrade' }">
              {{ gateStatusLabel(gate) }}
            </span>
          </article>
        </div>
      </section>
    </main>

    <!-- Upgrade Plan Modal -->
    <div v-if="showUpgradeModal" class="modal-overlay" @click="showUpgradeModal = false">
      <div class="modal-content modal-content--large" @click.stop>
        <div class="modal-header">
          <h3>Upgrade de Plano</h3>
          <button @click="showUpgradeModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <PlanUpgrade
            :current-plan="currentPlan"
            @upgrade-success="handleUpgradeSuccess"
            @upgrade-error="handleUpgradeError"
          />
        </div>
      </div>
    </div>

    <!-- Cancel Subscription Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click="showCancelModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Cancelar Assinatura</h3>
          <button @click="showCancelModal = false" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja cancelar sua assinatura?</p>
          <p>Você continuará com acesso até o final do período atual.</p>
        </div>
        <div class="modal-footer">
          <button @click="showCancelModal = false" class="btn btn--secondary">Manter Assinatura</button>
          <button @click="cancelSubscription" class="btn btn--danger">Cancelar Assinatura</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  color-scheme: dark;
}

.settings-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
  background: radial-gradient(120% 120% at 100% 0%, rgba(99, 102, 241, 0.16), transparent),
    linear-gradient(180deg, #0f172a 0%, #0b1120 40%, #080d19 100%);
  color: #e2e8f0;
}

.settings-sidebar {
  position: sticky;
  top: 0;
  min-height: 100vh;
  padding: 2.4rem 1.4rem;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(10, 14, 25, 0.85);
  backdrop-filter: blur(8px);
}

.settings-sidebar__header h1 {
  font-size: 1.6rem;
  font-weight: 700;
}

.settings-sidebar__header p {
  margin-top: 0.3rem;
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.9rem;
}

.settings-sidebar__nav {
  margin-top: 2rem;
  display: grid;
  gap: 0.6rem;
}

.settings-nav__item {
  width: 100%;
  text-align: left;
  border-radius: 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.64);
  padding: 0.7rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: rgba(226, 232, 240, 0.86);
  transition: border 0.2s ease, background 0.2s ease;
}

.settings-nav__item:hover {
  border-color: rgba(99, 102, 241, 0.4);
  color: #f8fafc;
}

.settings-nav__item--active {
  background: rgba(79, 70, 229, 0.22);
  border-color: rgba(99, 102, 241, 0.6);
  color: #f8fafc;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
}

.settings-nav__label {
  font-weight: 600;
  font-size: 0.92rem;
}

.settings-nav__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.75);
}

.settings-content {
  padding: 2.5rem 2.2rem 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-alert {
  border-radius: 0.8rem;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(30, 41, 59, 0.55);
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.9rem;
}

.settings-alert--error {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(127, 29, 29, 0.28);
  color: #fecaca;
}

.settings-section {
  display: grid;
  gap: 1.5rem;
}

.settings-section__header h2 {
  font-size: 1.4rem;
  font-weight: 700;
}

.settings-section__header p {
  margin-top: 0.25rem;
  color: rgba(148, 163, 184, 0.85);
  font-size: 0.92rem;
}

.settings-grid {
  display: grid;
  gap: 1rem;
}

.settings-grid--stats {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.settings-grid--two {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.settings-grid--integrations {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.workflow-credentials-wrapper {
  margin-top: 1.5rem;
}

.settings-grid--features {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.settings-stat {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 1.1rem;
  background: rgba(15, 23, 42, 0.75);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.35);
}

.settings-stat h3 {
  font-size: 0.9rem;
  color: rgba(203, 213, 225, 0.92);
}

.settings-stat__value {
  font-size: 1.45rem;
  font-weight: 700;
  margin: 0.3rem 0;
  color: #f8fafc;
}

.settings-stat__meta {
  font-size: 0.76rem;
  color: rgba(148, 163, 184, 0.8);
}

.settings-card {
  border-radius: 0.9rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.78);
  padding: 1.4rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.36);
  display: grid;
  gap: 0.9rem;
}

.settings-card--plan {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.settings-card--api {
  font-size: 0.9rem;
  color: rgba(226, 232, 240, 0.88);
}

.settings-card--table {
  padding: 0;
  overflow: hidden;
}

.settings-table,
.settings-card--table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.settings-table th,
.settings-table td,
.settings-card--table th,
.settings-card--table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.settings-empty {
  text-align: center;
  padding: 0.9rem 0;
  color: rgba(148, 163, 184, 0.75);
}

.settings-form {
  display: grid;
  gap: 0.85rem;
}

.settings-form input {
  border-radius: 0.65rem;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(10, 18, 32, 0.92);
  padding: 0.5rem 0.75rem;
  color: #f8fafc;
}

.settings-form select {
  border-radius: 0.65rem;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(10, 18, 32, 0.92);
  padding: 0.55rem 0.75rem;
  color: #f8fafc;
}

.settings-form select:focus {
  outline: none;
  border-color: rgba(255, 114, 102, 0.65);
  box-shadow: 0 0 0 3px rgba(255, 114, 102, 0.18);
}

.settings-helper {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.78);
}

.settings-card--language {
  margin-top: 1.2rem;
}

.settings-security {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.settings-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
}

.settings-meta-label {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.78);
}

.settings-muted {
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.9rem;
}

.settings-list {
  list-style: disc;
  margin: 0;
  padding-left: 1.1rem;
  display: grid;
  gap: 0.4rem;
  color: rgba(226, 232, 240, 0.88);
  font-size: 0.9rem;
}

.settings-button {
  border: 1px solid transparent;
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.settings-button--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #f8fafc;
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.35);
}

.settings-button--primary:hover {
  transform: translateY(-1px);
}

.settings-button--secondary {
  background: rgba(79, 70, 229, 0.18);
  border-color: rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
}

.settings-button--danger {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.45);
  color: #fecaca;
}

.settings-button--compact {
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
}

.settings-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.settings-feedback {
  margin-top: 0.75rem;
  font-size: 0.85rem;
}

.settings-feedback--success {
  color: #34d399;
}

.settings-feedback--error {
  color: #fca5a5;
}

.settings-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  color: #bfdbfe;
  font-size: 0.78rem;
  font-weight: 600;
}

.settings-pill--locked {
  background: rgba(239, 68, 68, 0.18);
  color: #fecaca;
}

.settings-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

.settings-badge--success {
  background: rgba(34, 197, 94, 0.2);
  color: #bbf7d0;
}

.settings-badge--warning {
  background: rgba(251, 191, 36, 0.2);
  color: #fde68a;
}

.settings-badge--neutral {
  background: rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
}

.settings-api-reveal {
  margin-top: 0.8rem;
  padding: 0.8rem;
  border-radius: 0.75rem;
  background: rgba(59, 130, 246, 0.2);
  border: 1px dashed rgba(59, 130, 246, 0.4);
}

code {
  font-family: 'Fira Code', Consolas, 'SFMono-Regular', monospace;
  font-size: 0.86rem;
  color: #a5b4fc;
}

.settings-card--upgrade {
  background: rgba(42, 51, 74, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.24);
}

@media (max-width: 1080px) {
  .settings-shell {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    position: static;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
}

@media (max-width: 720px) {
  .settings-content {
    padding: 2rem 1.3rem 3rem;
  }

  .settings-section__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}

/* Additional styles for new components */
.settings-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.settings-section__actions {
  display: flex;
  gap: 0.5rem;
}

/* Usage Charts */
.usage-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Plan Actions */
.plan-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.btn {
  border: 1px solid transparent;
  border-radius: 0.7rem;
  padding: 0.5rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn--primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #f8fafc;
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.35);
}

.btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(99, 102, 241, 0.4);
}

.btn--secondary {
  background: rgba(79, 70, 229, 0.18);
  border-color: rgba(99, 102, 241, 0.4);
  color: #c7d2fe;
}

.btn--secondary:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.25);
}

.btn--danger {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fecaca;
}

.btn--danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}

.btn--sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Usage Alerts */
.usage-alerts {
  background: rgba(15, 23, 42, 0.78);
  border-radius: 0.9rem;
  padding: 1.5rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.36);
  margin-top: 1.5rem;
}

.usage-alerts h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
  margin-bottom: 1rem;
}

.no-alerts {
  text-align: center;
  padding: 2rem;
  color: rgba(148, 163, 184, 0.75);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(10, 18, 32, 0.92);
  border-radius: 0.6rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.alert-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0 0 0.25rem 0;
}

.alert-info p {
  color: rgba(148, 163, 184, 0.85);
  margin: 0;
  font-size: 0.875rem;
}

.alert-channel {
  display: inline-block;
  margin-top: 0.35rem;
  font-size: 0.78rem;
  color: rgba(148, 163, 184, 0.65);
}

.api-key-actions {
  display: flex;
  gap: 0.5rem;
}

.alert-actions {
  display: flex;
  gap: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: rgba(15, 23, 42, 0.95);
  border-radius: 0.8rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.modal-content--large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: rgba(148, 163, 184, 0.85);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #f8fafc;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  justify-content: flex-end;
}

.modal-footer .btn {
  width: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .usage-charts {
    grid-template-columns: 1fr;
  }

  .settings-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .settings-section__actions {
    width: 100%;
    justify-content: flex-end;
  }

  .plan-actions {
    flex-direction: column;
  }

  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .alert-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
