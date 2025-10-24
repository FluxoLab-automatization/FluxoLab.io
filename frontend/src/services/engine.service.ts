import { apiFetch } from './api';

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'queued' | 'running' | 'waiting_human' | 'waiting_retry' | 'succeeded' | 'failed' | 'canceled';
  triggerType: 'webhook' | 'schedule' | 'manual' | 'event';
  triggerData?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  duration?: number; // em milissegundos
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  steps: WorkflowStep[];
  evidence?: {
    packageId: string;
    signedAt: string;
    hash: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  runId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, unknown>;
}

export interface TriggerWorkflowPayload {
  workflowId: string;
  triggerType: 'manual' | 'webhook' | 'schedule' | 'event';
  triggerData?: Record<string, unknown>;
  idempotencyKey?: string;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, unknown>;
}

export interface WorkflowRunsListResponse {
  runs: WorkflowRun[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkflowRunResponse {
  run: WorkflowRun;
}

export interface EngineStats {
  totalRuns: number;
  activeRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageDuration: number;
  successRate: number;
  runsToday: number;
  runsThisWeek: number;
  runsThisMonth: number;
}

export interface EngineStatsResponse {
  stats: EngineStats;
  period: {
    start: string;
    end: string;
  };
}

// Disparar workflow
export async function triggerWorkflow(
  token: string,
  payload: TriggerWorkflowPayload
): Promise<WorkflowRunResponse> {
  return apiFetch<WorkflowRunResponse>('/engine/trigger', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Listar execuções de workflow
export async function fetchWorkflowRuns(
  token: string,
  params: {
    page?: number;
    limit?: number;
    workflowId?: string;
    status?: string;
    triggerType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'startedAt' | 'duration' | 'status';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<WorkflowRunsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.workflowId) searchParams.set('workflowId', params.workflowId);
  if (params.status) searchParams.set('status', params.status);
  if (params.triggerType) searchParams.set('triggerType', params.triggerType);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/engine/runs${query ? `?${query}` : ''}`;

  return apiFetch<WorkflowRunsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar execução por ID
export async function fetchWorkflowRun(
  token: string,
  runId: string
): Promise<WorkflowRunResponse> {
  return apiFetch<WorkflowRunResponse>(`/engine/runs/${runId}`, {
    method: 'GET',
    token,
  });
}

// Cancelar execução
export async function cancelWorkflowRun(
  token: string,
  runId: string
): Promise<WorkflowRunResponse> {
  return apiFetch<WorkflowRunResponse>(`/engine/runs/${runId}/cancel`, {
    method: 'POST',
    token,
  });
}

// Retry execução falhada
export async function retryWorkflowRun(
  token: string,
  runId: string,
  options?: {
    fromStep?: string;
    resetData?: boolean;
  }
): Promise<WorkflowRunResponse> {
  return apiFetch<WorkflowRunResponse>(`/engine/runs/${runId}/retry`, {
    method: 'POST',
    token,
    body: JSON.stringify(options || {}),
  });
}

// Obter estatísticas do engine
export async function fetchEngineStats(
  token: string,
  params: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<EngineStatsResponse> {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set('period', params.period);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);

  const query = searchParams.toString();
  const url = `/engine/stats${query ? `?${query}` : ''}`;

  return apiFetch<EngineStatsResponse>(url, {
    method: 'GET',
    token,
  });
}

// Obter logs de execução
export async function fetchRunLogs(
  token: string,
  runId: string,
  stepId?: string
): Promise<{
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    data?: Record<string, unknown>;
    stepId?: string;
  }>;
  total: number;
}> {
  const searchParams = new URLSearchParams();
  if (stepId) searchParams.set('stepId', stepId);

  const query = searchParams.toString();
  const url = `/engine/runs/${runId}/logs${query ? `?${query}` : ''}`;

  return apiFetch<{
    logs: Array<{
      id: string;
      timestamp: string;
      level: 'debug' | 'info' | 'warn' | 'error';
      message: string;
      data?: Record<string, unknown>;
      stepId?: string;
    }>;
    total: number;
  }>(url, {
    method: 'GET',
    token,
  });
}

// Obter execuções em tempo real (WebSocket ou polling)
export async function subscribeToRuns(
  token: string,
  callback: (run: WorkflowRun) => void,
  filters?: {
    workflowId?: string;
    status?: string;
  }
): Promise<() => void> {
  // Implementação de WebSocket ou polling
  // Por enquanto, retorna uma função de cleanup vazia
  return () => {};
}
