<template>
  <div class="plan-upgrade">
    <div class="plan-upgrade__header">
      <h2>Upgrade do Plano</h2>
      <p>Escolha o plano que melhor atende às suas necessidades</p>
    </div>

    <div v-if="loading" class="plan-upgrade__loading">
      <div class="spinner"></div>
      <p>Carregando planos...</p>
    </div>

    <div v-else-if="error" class="plan-upgrade__error">
      <p>{{ error }}</p>
      <button @click="loadPlans" class="btn btn--secondary">Tentar novamente</button>
    </div>

    <div v-else class="plan-upgrade__content">
      <div class="plans-grid">
        <div
          v-for="plan in availablePlans"
          :key="plan.code"
          class="plan-card"
          :class="{
            'plan-card--current': plan.code === currentPlan.code,
            'plan-card--popular': plan.popular,
            'plan-card--selected': selectedPlan?.code === plan.code
          }"
          @click="selectPlan(plan)"
        >
          <div v-if="plan.popular" class="plan-card__badge">
            Mais Popular
          </div>

          <div v-if="plan.code === currentPlan.code" class="plan-card__badge plan-card__badge--current">
            Plano Atual
          </div>

          <div class="plan-card__header">
            <h3>{{ plan.name }}</h3>
            <div class="plan-card__price">
              <span class="price-amount">
                {{ formatCurrency(plan.priceAmount) }}
              </span>
              <span class="price-period">
                /{{ plan.billingInterval === 'month' ? 'mês' : 'ano' }}
              </span>
            </div>
          </div>

          <div class="plan-card__description">
            <p>{{ plan.description }}</p>
          </div>

          <div class="plan-card__features">
            <ul>
              <li v-for="feature in plan.features" :key="feature">
                <svg class="feature-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ feature }}
              </li>
            </ul>
          </div>

          <div class="plan-card__limits">
            <div class="limit-item">
              <span class="limit-label">Workspaces:</span>
              <span class="limit-value">{{ plan.limits.workspaces || 'Ilimitado' }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">Usuários:</span>
              <span class="limit-value">{{ plan.limits.users || 'Ilimitado' }}</span>
            </div>
            <div class="limit-item">
              <span class="limit-label">Webhooks/mês:</span>
              <span class="limit-value">{{ plan.limits.webhook || 'Ilimitado' }}</span>
            </div>
          </div>

          <div class="plan-card__actions">
            <button
              v-if="plan.code === currentPlan.code"
              class="btn btn--current"
              disabled
            >
              Plano Atual
            </button>
            <button
              v-else
              class="btn btn--primary"
              :disabled="upgrading"
              @click.stop="upgradeToPlan(plan)"
            >
              <span v-if="upgrading && selectedPlan?.code === plan.code">Upgradando...</span>
              <span v-else>Escolher Plano</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedPlan" class="upgrade-summary">
        <h3>Resumo da Mudança</h3>
        <div class="summary-content">
          <div class="summary-row">
            <span>Plano atual:</span>
            <span>{{ currentPlan.name }}</span>
          </div>
          <div class="summary-row">
            <span>Novo plano:</span>
            <span>{{ selectedPlan.name }}</span>
          </div>
          <div class="summary-row">
            <span>Valor mensal:</span>
            <span>{{ formatCurrency(selectedPlan.priceAmount) }}</span>
          </div>
          <div class="summary-row summary-row--total">
            <span>Total:</span>
            <span>{{ formatCurrency(selectedPlan.priceAmount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Upgrade</h3>
          <button @click="closeConfirmModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Você está prestes a fazer upgrade para o <strong>{{ selectedPlan?.name }}</strong>.</p>
          <p>Esta mudança será aplicada imediatamente e você será cobrado o valor proporcional.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="btn btn--secondary">Cancelar</button>
          <button @click="confirmUpgrade" class="btn btn--primary" :disabled="upgrading">
            <span v-if="upgrading">Processando...</span>
            <span v-else>Confirmar Upgrade</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchAvailablePlans, upgradePlan } from '../../services/settings.service';

interface Plan {
  code: string;
  name: string;
  description: string;
  priceAmount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  features: string[];
  limits: {
    workspaces: number | null;
    users: number | null;
    webhook: number | null;
  };
  popular?: boolean;
}

interface Props {
  currentPlan: Plan;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  upgradeSuccess: [plan: Plan];
  upgradeError: [error: string];
}>();

const loading = ref(false);
const error = ref<string | null>(null);
const availablePlans = ref<Plan[]>([]);
const selectedPlan = ref<Plan | null>(null);
const upgrading = ref(false);
const showConfirmModal = ref(false);

async function loadPlans() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchAvailablePlans();
    availablePlans.value = response.plans;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar planos';
  } finally {
    loading.value = false;
  }
}

function selectPlan(plan: Plan) {
  if (plan.code === props.currentPlan.code) return;
  selectedPlan.value = plan;
}

async function upgradeToPlan(plan: Plan) {
  selectedPlan.value = plan;
  showConfirmModal.value = true;
}

async function confirmUpgrade() {
  if (!selectedPlan.value) return;

  upgrading.value = true;

  try {
    const response = await upgradePlan({
      planCode: selectedPlan.value.code,
      billingInterval: selectedPlan.value.billingInterval,
      immediate: true,
    });

    emit('upgradeSuccess', selectedPlan.value);
    showConfirmModal.value = false;
    selectedPlan.value = null;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upgrade';
    emit('upgradeError', errorMessage);
  } finally {
    upgrading.value = false;
  }
}

function closeConfirmModal() {
  showConfirmModal.value = false;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

onMounted(() => {
  loadPlans();
});
</script>

<style scoped>
.plan-upgrade {
  max-width: 1200px;
  margin: 0 auto;
}

.plan-upgrade__header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-upgrade__header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.plan-upgrade__header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.plan-upgrade__loading,
.plan-upgrade__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.plan-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-card:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.plan-card--current {
  border-color: #10b981;
  background: #f0fdf4;
}

.plan-card--popular {
  border-color: #6366f1;
  background: #f8fafc;
}

.plan-card--selected {
  border-color: #6366f1;
  background: #f0f4ff;
}

.plan-card__badge {
  position: absolute;
  top: -10px;
  right: 1rem;
  background: #6366f1;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.plan-card__badge--current {
  background: #10b981;
}

.plan-card__header {
  margin-bottom: 1rem;
}

.plan-card__header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.plan-card__price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.price-period {
  color: #6b7280;
  font-size: 1rem;
}

.plan-card__description {
  margin-bottom: 1.5rem;
}

.plan-card__description p {
  color: #6b7280;
  line-height: 1.5;
}

.plan-card__features {
  margin-bottom: 1.5rem;
}

.plan-card__features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plan-card__features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
}

.feature-icon {
  width: 16px;
  height: 16px;
  color: #10b981;
  flex-shrink: 0;
}

.plan-card__limits {
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.limit-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.limit-label {
  color: #6b7280;
}

.limit-value {
  color: #1f2937;
  font-weight: 600;
}

.plan-card__actions {
  text-align: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  width: 100%;
}

.btn--primary {
  background: #6366f1;
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: #5856eb;
}

.btn--secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn--secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn--current {
  background: #10b981;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-summary {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.upgrade-summary h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #374151;
}

.summary-row--total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
  padding-top: 0.5rem;
  border-top: 1px solid #d1d5db;
}

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
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #374151;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.modal-footer .btn {
  width: auto;
}
</style>
