import { apiFetch } from './api';

export interface DashboardStats {
  prodExecutions: number;
  failedExecutions: number;
  failureRate: number;
  timeSaved: string;
  avgRunTime: string;
  period: string;
}

export interface DashboardWorkflow {
  id: string;
  name: string;
  owner: string;
  active: boolean;
  lastUpdated: string;
  created: string;
  status: 'active' | 'inactive' | 'error';
  tags: string[];
}

export interface DashboardData {
  stats: DashboardStats;
  workflows: DashboardWorkflow[];
  totalWorkflows: number;
  recentExecutions: number;
}

export async function fetchDashboardData(token: string): Promise<DashboardData> {
  return apiFetch<DashboardData>('/dashboard/overview', {
    method: 'GET',
    token,
  });
}

export async function fetchDashboardStats(token: string): Promise<DashboardStats> {
  return apiFetch<DashboardStats>('/dashboard/stats', {
    method: 'GET',
    token,
  });
}

export async function fetchRecentWorkflows(
  token: string,
  params: { limit?: number; offset?: number } = {},
): Promise<{ workflows: DashboardWorkflow[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const url = `/dashboard/workflows${query ? `?${query}` : ''}`;

  return apiFetch<{ workflows: DashboardWorkflow[]; total: number }>(url, {
    method: 'GET',
    token,
  });
}

export async function toggleWorkflowStatus(
  token: string,
  workflowId: string,
  active: boolean,
): Promise<{ workflow: DashboardWorkflow }> {
  return apiFetch<{ workflow: DashboardWorkflow }>(`/workflows/${workflowId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ active }),
  });
}

export async function searchWorkflows(
  token: string,
  query: string,
  params: { limit?: number; offset?: number } = {},
): Promise<{ workflows: DashboardWorkflow[]; total: number }> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const queryString = searchParams.toString();
  const url = `/dashboard/workflows/search${queryString ? `?${queryString}` : ''}`;

  return apiFetch<{ workflows: DashboardWorkflow[]; total: number }>(url, {
    method: 'GET',
    token,
  });
}




