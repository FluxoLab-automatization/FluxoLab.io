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
