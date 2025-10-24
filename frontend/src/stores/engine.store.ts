import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { WorkflowRun, WorkflowStep, EngineStats } from '../types/api';
import {
  triggerWorkflow,
  fetchWorkflowRuns,
  fetchWorkflowRun,
  cancelWorkflowRun,
  retryWorkflowRun,
  fetchEngineStats,
  fetchRunLogs,
  type TriggerWorkflowPayload,
} from '../services/engine.service';

export const useEngineStore = defineStore('engine', () => {
  // State
  const runs = ref<WorkflowRun[]>([]);
  const stats = ref<EngineStats | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    page: 1,
    limit: 20,
    workflowId: '',
    status: '',
    triggerType: '',
    startDate: '',
    endDate: '',
    sortBy: 'startedAt' as 'startedAt' | 'duration' | 'status',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const total = ref(0);
  const selectedRun = ref<WorkflowRun | null>(null);
  const runLogs = ref<Array<{
    id: string;
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    data?: Record<string, unknown>;
    stepId?: string;
  }>>([]);

  // Getters
  const runsByStatus = computed(() => {
    const statusMap = new Map<string, WorkflowRun[]>();
    runs.value.forEach(run => {
      if (!statusMap.has(run.status)) {
        statusMap.set(run.status, []);
      }
      statusMap.get(run.status)!.push(run);
    });
    return statusMap;
  });

  const activeRuns = computed(() => {
    return runs.value.filter(run =>
      run.status === 'running' || run.status === 'queued' || run.status === 'waiting_human'
    );
  });

  const failedRuns = computed(() => {
    return runs.value.filter(run => run.status === 'failed');
  });

  const successfulRuns = computed(() => {
    return runs.value.filter(run => run.status === 'succeeded');
  });

  const runsByWorkflow = computed(() => {
    const workflowMap = new Map<string, WorkflowRun[]>();
    runs.value.forEach(run => {
      if (!workflowMap.has(run.workflowId)) {
        workflowMap.set(run.workflowId, []);
      }
      workflowMap.get(run.workflowId)!.push(run);
    });
    return workflowMap;
  });

  const recentRuns = computed(() => {
    return [...runs.value].sort((a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    ).slice(0, 10);
  });

  const hasMorePages = computed(() => {
    return runs.value.length < total.value;
  });

  const runStats = computed(() => {
    if (!runs.value.length) return null;

    const totalRuns = runs.value.length;
    const successful = successfulRuns.value.length;
    const failed = failedRuns.value.length;
    const active = activeRuns.value.length;

    return {
      total: totalRuns,
      successful,
      failed,
      active,
      successRate: totalRuns > 0 ? (successful / totalRuns) * 100 : 0,
      failureRate: totalRuns > 0 ? (failed / totalRuns) * 100 : 0,
    };
  });

  // Actions
  async function fetchRunsList(token: string, reset = false) {
    if (reset) {
      runs.value = [];
      filters.value.page = 1;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetchWorkflowRuns(token, {
        page: filters.value.page,
        limit: filters.value.limit,
        workflowId: filters.value.workflowId || undefined,
        status: filters.value.status || undefined,
        triggerType: filters.value.triggerType || undefined,
        startDate: filters.value.startDate || undefined,
        endDate: filters.value.endDate || undefined,
        sortBy: filters.value.sortBy,
        sortOrder: filters.value.sortOrder,
      });

      if (reset) {
        runs.value = response.runs;
      } else {
        runs.value.push(...response.runs);
      }

      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar execuções';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreRuns(token: string) {
    if (loading.value || !hasMorePages.value) return;

    filters.value.page += 1;
    await fetchRunsList(token, false);
  }

  async function refreshRuns(token: string) {
    await fetchRunsList(token, true);
  }

  async function filterRuns(token: string, newFilters: Partial<typeof filters.value>) {
    Object.assign(filters.value, newFilters);
    filters.value.page = 1;
    await fetchRunsList(token, true);
  }

  async function triggerNewWorkflow(token: string, payload: TriggerWorkflowPayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await triggerWorkflow(token, payload);
      runs.value.unshift(response.run);
      total.value += 1;
      return response.run;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao disparar workflow';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRunDetails(token: string, runId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchWorkflowRun(token, runId);
      selectedRun.value = response.run;

      // Atualizar na lista se existir
      const index = runs.value.findIndex(r => r.id === runId);
      if (index !== -1) {
        runs.value[index] = response.run;
      }

      return response.run;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar execução';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function cancelRun(token: string, runId: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await cancelWorkflowRun(token, runId);

      // Atualizar na lista
      const index = runs.value.findIndex(r => r.id === runId);
      if (index !== -1) {
        runs.value[index] = response.run;
      }

      if (selectedRun.value?.id === runId) {
        selectedRun.value = response.run;
      }

      return response.run;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao cancelar execução';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function retryRun(token: string, runId: string, options?: {
    fromStep?: string;
    resetData?: boolean;
  }) {
    loading.value = true;
    error.value = null;

    try {
      const response = await retryWorkflowRun(token, runId, options);

      // Atualizar na lista
      const index = runs.value.findIndex(r => r.id === runId);
      if (index !== -1) {
        runs.value[index] = response.run;
      }

      if (selectedRun.value?.id === runId) {
        selectedRun.value = response.run;
      }

      return response.run;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao repetir execução';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadEngineStats(token: string, period?: 'day' | 'week' | 'month' | 'year') {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchEngineStats(token, { period });
      stats.value = response.stats;
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadRunLogs(token: string, runId: string, stepId?: string) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchRunLogs(token, runId, stepId);
      runLogs.value = response.logs;
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar logs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function selectRun(run: WorkflowRun | null) {
    selectedRun.value = run;
  }

  function getRunById(runId: string) {
    return runs.value.find(run => run.id === runId);
  }

  function getRunsByWorkflow(workflowId: string) {
    return runs.value.filter(run => run.workflowId === workflowId);
  }

  function getRunsByStatus(status: string) {
    return runs.value.filter(run => run.status === status);
  }

  function clearError() {
    error.value = null;
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      workflowId: '',
      status: '',
      triggerType: '',
      startDate: '',
      endDate: '',
      sortBy: 'startedAt',
      sortOrder: 'desc',
    };
  }

  function reset() {
    runs.value = [];
    stats.value = null;
    loading.value = false;
    error.value = null;
    total.value = 0;
    selectedRun.value = null;
    runLogs.value = [];
    resetFilters();
  }

  return {
    // State
    runs,
    stats,
    loading,
    error,
    filters,
    total,
    selectedRun,
    runLogs,

    // Getters
    runsByStatus,
    activeRuns,
    failedRuns,
    successfulRuns,
    runsByWorkflow,
    recentRuns,
    hasMorePages,
    runStats,

    // Actions
    fetchRunsList,
    loadMoreRuns,
    refreshRuns,
    filterRuns,
    triggerNewWorkflow,
    fetchRunDetails,
    cancelRun,
    retryRun,
    loadEngineStats,
    loadRunLogs,
    selectRun,
    getRunById,
    getRunsByWorkflow,
    getRunsByStatus,
    clearError,
    resetFilters,
    reset,
  };
});
