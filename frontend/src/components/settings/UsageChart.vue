<template>
  <div class="usage-chart">
    <div class="usage-chart__header">
      <h3>{{ title }}</h3>
      <div class="usage-chart__controls">
        <select v-model="selectedPeriod" @change="handlePeriodChange" class="usage-chart__select">
          <option value="1d">Último dia</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="usage-chart__loading">
      <div class="spinner"></div>
      <p>Carregando dados...</p>
    </div>

    <div v-else-if="error" class="usage-chart__error">
      <p>{{ error }}</p>
      <button @click="loadData" class="btn btn--secondary">Tentar novamente</button>
    </div>

    <div v-else-if="data.length === 0" class="usage-chart__empty">
      <p>Nenhum dado disponível para o período selecionado.</p>
    </div>

    <div v-else class="usage-chart__content">
      <div class="usage-chart__chart">
        <svg :width="chartWidth" :height="chartHeight" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :style="{ stopColor: color, stopOpacity: 0.8 }" />
              <stop offset="100%" :style="{ stopColor: color, stopOpacity: 0.2 }" />
            </linearGradient>
          </defs>

          <!-- Grid lines -->
          <g class="grid-lines">
            <line v-for="i in 4" :key="i"
                  :x1="padding"
                  :y1="padding + (i * (chartHeight - 2 * padding) / 4)"
                  :x2="chartWidth - padding"
                  :y2="padding + (i * (chartHeight - 2 * padding) / 4)"
                  stroke="#e5e7eb" stroke-width="1" />
          </g>

          <!-- Area chart -->
          <path :d="areaPath" fill="url(#gradient)" />

          <!-- Line chart -->
          <path :d="linePath" :stroke="color" stroke-width="2" fill="none" />

          <!-- Data points -->
          <circle v-for="(point, index) in dataPoints"
                  :key="index"
                  :cx="point.x"
                  :cy="point.y"
                  :r="3"
                  :fill="color"
                  class="data-point"
                  @mouseover="showTooltip(point, $event)"
                  @mouseout="hideTooltip" />
        </svg>
      </div>

      <div class="usage-chart__summary">
        <div class="summary-item">
          <span class="summary-label">Total:</span>
          <span class="summary-value">{{ formatNumber(summary.total) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Média:</span>
          <span class="summary-value">{{ formatNumber(summary.average) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Pico:</span>
          <span class="summary-value">{{ formatNumber(summary.peak) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Crescimento:</span>
          <span class="summary-value" :class="{ 'positive': summary.growth > 0, 'negative': summary.growth < 0 }">
            {{ formatGrowth(summary.growth) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <div v-if="tooltip.visible"
         class="usage-chart__tooltip"
         :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
      <div class="tooltip-content">
        <div class="tooltip-date">{{ formatDate(tooltip.date) }}</div>
        <div class="tooltip-value">{{ formatNumber(tooltip.value) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { fetchUsageHistory } from '../../services/settings.service';

interface Props {
  metric: 'webhooks' | 'users' | 'workflows' | 'all';
  title: string;
  color?: string;
}

interface UsageDataPoint {
  date: string;
  value: number;
  label: string;
}

interface UsageSummary {
  total: number;
  average: number;
  peak: number;
  growth: number;
}

interface UsageHistoryResponse {
  metric: string;
  period: string;
  data: UsageDataPoint[];
  summary: UsageSummary;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#6366f1',
});

const emit = defineEmits<{
  periodChange: [period: string];
}>();

const selectedPeriod = ref('30d');
const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<UsageDataPoint[]>([]);
const summary = ref<UsageSummary>({ total: 0, average: 0, peak: 0, growth: 0 });

const chartWidth = 400;
const chartHeight = 200;
const padding = 40;

const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  date: '',
  value: 0,
});

const dataPoints = computed(() => {
  if (data.value.length === 0) return [];

  const maxValue = Math.max(...data.value.map(d => d.value));
  const minValue = Math.min(...data.value.map(d => d.value));
  const range = maxValue - minValue || 1;

  const stepX = (chartWidth - 2 * padding) / (data.value.length - 1);

  return data.value.map((point, index) => ({
    x: padding + index * stepX,
    y: padding + ((maxValue - point.value) / range) * (chartHeight - 2 * padding),
    ...point,
  }));
});

const linePath = computed(() => {
  if (dataPoints.value.length === 0) return '';

  const path = dataPoints.value.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return path;
});

const areaPath = computed(() => {
  if (dataPoints.value.length === 0) return '';

  const path = dataPoints.value.map((point, index) =>
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const lastPoint = dataPoints.value[dataPoints.value.length - 1];
  const firstPoint = dataPoints.value[0];

  return `${path} L ${lastPoint.x} ${chartHeight - padding} L ${firstPoint.x} ${chartHeight - padding} Z`;
});

async function loadData() {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchUsageHistory({
      period: selectedPeriod.value as any,
      metric: props.metric,
    });

    data.value = response.data[0]?.data || [];
    summary.value = response.data[0]?.summary || { total: 0, average: 0, peak: 0, growth: 0 };
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro ao carregar dados';
  } finally {
    loading.value = false;
  }
}

function handlePeriodChange() {
  emit('periodChange', selectedPeriod.value);
  loadData();
}

function showTooltip(point: any, event: MouseEvent) {
  tooltip.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY - 10,
    date: point.date,
    value: point.value,
  };
}

function hideTooltip() {
  tooltip.value.visible = false;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatGrowth(growth: number): string {
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
}

onMounted(() => {
  loadData();
});

watch(() => props.metric, () => {
  loadData();
});
</script>

<style scoped>
.usage-chart {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.usage-chart__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.usage-chart__header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.usage-chart__select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
}

.usage-chart__loading,
.usage-chart__error,
.usage-chart__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.usage-chart__chart {
  margin-bottom: 1rem;
}

.grid-lines line {
  opacity: 0.3;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s ease;
}

.data-point:hover {
  r: 5;
}

.usage-chart__summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.summary-value.positive {
  color: #059669;
}

.summary-value.negative {
  color: #dc2626;
}

.usage-chart__tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.tooltip-content {
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tooltip-date {
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.tooltip-value {
  font-weight: 600;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn--secondary:hover {
  background: #e5e7eb;
}
</style>
