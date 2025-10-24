import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Variable } from '../types/api';
import {
  fetchVariables,
  createVariable,
  updateVariable,
  deleteVariable,
  fetchVariablesByEnvironment,
  searchVariables,
  type CreateVariablePayload,
  type UpdateVariablePayload,
} from '../services/variables.service';

export const useVariablesStore = defineStore('variables', () => {
  // State
  const variables = ref<Variable[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref({
    page: 1,
    limit: 20,
    environment: 'development' as 'development' | 'staging' | 'production',
    search: '',
  });
  const total = ref(0);
  const selectedVariable = ref<Variable | null>(null);

  // Getters
  const variablesByEnvironment = computed(() => {
    return variables.value.filter(v => v.environment === filters.value.environment);
  });

  const secretVariables = computed(() => {
    return variables.value.filter(v => v.isSecret);
  });

  const publicVariables = computed(() => {
    return variables.value.filter(v => !v.isSecret);
  });

  const variablesByEnvironmentMap = computed(() => {
    const map = new Map<string, Variable[]>();
    variables.value.forEach(variable => {
      if (!map.has(variable.environment)) {
        map.set(variable.environment, []);
      }
      map.get(variable.environment)!.push(variable);
    });
    return map;
  });

  const searchResults = computed(() => {
    if (!filters.value.search) return variables.value;
    return variables.value.filter(v =>
      v.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      v.description?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  });

  const hasMorePages = computed(() => {
    return variables.value.length < total.value;
  });

  // Actions
  async function fetchVariablesList(token: string, reset = false) {
    if (reset) {
      variables.value = [];
      filters.value.page = 1;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetchVariables(token, {
        page: filters.value.page,
        limit: filters.value.limit,
        environment: filters.value.environment,
        search: filters.value.search,
      });

      if (reset) {
        variables.value = response.variables;
      } else {
        variables.value.push(...response.variables);
      }

      total.value = response.total;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar variáveis';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreVariables(token: string) {
    if (loading.value || !hasMorePages.value) return;

    filters.value.page += 1;
    await fetchVariablesList(token, false);
  }

  async function refreshVariables(token: string) {
    await fetchVariablesList(token, true);
  }

  async function searchVariablesList(token: string, query: string) {
    filters.value.search = query;
    filters.value.page = 1;
    await fetchVariablesList(token, true);
  }

  async function filterByEnvironment(token: string, environment: 'development' | 'staging' | 'production') {
    filters.value.environment = environment;
    filters.value.page = 1;
    await fetchVariablesList(token, true);
  }

  async function createNewVariable(token: string, payload: CreateVariablePayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await createVariable(token, payload);
      variables.value.unshift(response.variable);
      total.value += 1;
      return response.variable;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar variável';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateExistingVariable(token: string, variableId: string, payload: UpdateVariablePayload) {
    loading.value = true;
    error.value = null;

    try {
      const response = await updateVariable(token, variableId, payload);
      const index = variables.value.findIndex(v => v.id === variableId);
      if (index !== -1) {
        variables.value[index] = response.variable;
      }
      return response.variable;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar variável';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExistingVariable(token: string, variableId: string) {
    loading.value = true;
    error.value = null;

    try {
      await deleteVariable(token, variableId);
      const index = variables.value.findIndex(v => v.id === variableId);
      if (index !== -1) {
        variables.value.splice(index, 1);
        total.value -= 1;
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar variável';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function loadVariablesByEnvironment(token: string, environment: 'development' | 'staging' | 'production') {
    loading.value = true;
    error.value = null;

    try {
      const envVariables = await fetchVariablesByEnvironment(token, environment);
      // Atualizar apenas as variáveis do ambiente específico
      variables.value = variables.value.filter(v => v.environment !== environment);
      variables.value.push(...envVariables);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar variáveis do ambiente';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function searchVariablesByName(token: string, query: string) {
    if (!query.trim()) return variables.value;

    try {
      return await searchVariables(token, query, filters.value.environment);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao buscar variáveis';
      throw err;
    }
  }

  function selectVariable(variable: Variable | null) {
    selectedVariable.value = variable;
  }

  function clearError() {
    error.value = null;
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      environment: 'development',
      search: '',
    };
  }

  function reset() {
    variables.value = [];
    loading.value = false;
    error.value = null;
    total.value = 0;
    selectedVariable.value = null;
    resetFilters();
  }

  return {
    // State
    variables,
    loading,
    error,
    filters,
    total,
    selectedVariable,

    // Getters
    variablesByEnvironment,
    secretVariables,
    publicVariables,
    variablesByEnvironmentMap,
    searchResults,
    hasMorePages,

    // Actions
    fetchVariablesList,
    loadMoreVariables,
    refreshVariables,
    searchVariablesList,
    filterByEnvironment,
    createNewVariable,
    updateExistingVariable,
    deleteExistingVariable,
    loadVariablesByEnvironment,
    searchVariablesByName,
    selectVariable,
    clearError,
    resetFilters,
    reset,
  };
});
