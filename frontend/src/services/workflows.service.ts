import { apiFetch } from './api';

export interface WorkflowNode {
  id: string;
  type: string;
  params?: Record<string, unknown>;
}

export interface WorkflowConnection {
  from: string;
  to: string;
  output?: string;
}

export interface WorkflowDefinitionPayload {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface CreateWorkflowPayload {
  name: string;
  definition: WorkflowDefinitionPayload;
  tags?: string[];
}

export interface WorkflowCredentialSummary {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface CreateCredentialPayload {
  name: string;
  type: string;
  secret: Record<string, unknown>;
}

export async function createWorkflow(token: string, payload: CreateWorkflowPayload) {
  return apiFetch<{ workflow: { id: string; version: number } }>('/workflows', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function executeWorkflow(
  token: string,
  workflowId: string,
  input: Record<string, unknown>,
) {
  return apiFetch<{ executionId: string }>(`/workflows/${workflowId}/test`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function listWorkflowCredentials(token: string) {
  return apiFetch<{ credentials: WorkflowCredentialSummary[] }>(
    '/workflows/credentials',
    {
      method: 'GET',
      token,
    },
  );
}

export async function createWorkflowCredential(
  token: string,
  payload: CreateCredentialPayload,
) {
  return apiFetch<{ credential: WorkflowCredentialSummary }>(
    '/workflows/credentials',
    {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    },
  );
}

export interface WorkflowSummary {
  id: string;
  name: string;
  status: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowDetails extends WorkflowSummary {
  definition: WorkflowDefinitionPayload;
  version: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export async function listWorkflows(
  token: string,
  params: { limit?: number; offset?: number } = {},
): Promise<{ workflows: WorkflowSummary[] }> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const url = `/workflows${query ? `?${query}` : ''}`;

  return apiFetch<{ workflows: WorkflowSummary[] }>(url, {
    method: 'GET',
    token,
  });
}

export async function getWorkflow(
  token: string,
  workflowId: string,
): Promise<{ workflow: WorkflowDetails }> {
  return apiFetch<{ workflow: WorkflowDetails }>(`/workflows/${workflowId}`, {
    method: 'GET',
    token,
  });
}

export async function updateWorkflow(
  token: string,
  workflowId: string,
  payload: Partial<CreateWorkflowPayload>,
): Promise<{ workflow: WorkflowSummary }> {
  return apiFetch<{ workflow: WorkflowSummary }>(`/workflows/${workflowId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteWorkflow(
  token: string,
  workflowId: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/workflows/${workflowId}`, {
    method: 'DELETE',
    token,
  });
}

export async function listWorkflowExecutions(
  token: string,
  workflowId: string,
  params: { limit?: number; offset?: number } = {},
): Promise<{ executions: WorkflowExecution[] }> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const url = `/workflows/${workflowId}/executions${query ? `?${query}` : ''}`;

  return apiFetch<{ executions: WorkflowExecution[] }>(url, {
    method: 'GET',
    token,
  });
}
