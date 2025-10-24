import { apiFetch } from './api';

export interface Variable {
  id: string;
  workspaceId: string;
  name: string;
  value: string;
  description?: string;
  isSecret: boolean;
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface CreateVariablePayload {
  name: string;
  value: string;
  description?: string;
  isSecret?: boolean;
  environment: 'development' | 'staging' | 'production';
}

export interface UpdateVariablePayload {
  name?: string;
  value?: string;
  description?: string;
  isSecret?: boolean;
  environment?: 'development' | 'staging' | 'production';
}

export interface VariablesListResponse {
  variables: Variable[];
  total: number;
  page: number;
  limit: number;
}

export interface VariableResponse {
  variable: Variable;
}

// Listar variáveis do workspace
export async function fetchVariables(
  token: string,
  params: {
    page?: number;
    limit?: number;
    environment?: string;
    search?: string;
  } = {}
): Promise<VariablesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.environment) searchParams.set('environment', params.environment);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = `/variables${query ? `?${query}` : ''}`;

  return apiFetch<VariablesListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar variável por ID
export async function fetchVariable(
  token: string,
  variableId: string
): Promise<VariableResponse> {
  return apiFetch<VariableResponse>(`/variables/${variableId}`, {
    method: 'GET',
    token,
  });
}

// Criar nova variável
export async function createVariable(
  token: string,
  payload: CreateVariablePayload
): Promise<VariableResponse> {
  return apiFetch<VariableResponse>('/variables', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Atualizar variável
export async function updateVariable(
  token: string,
  variableId: string,
  payload: UpdateVariablePayload
): Promise<VariableResponse> {
  return apiFetch<VariableResponse>(`/variables/${variableId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Deletar variável
export async function deleteVariable(
  token: string,
  variableId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/variables/${variableId}`, {
    method: 'DELETE',
    token,
  });
}

// Listar variáveis por ambiente
export async function fetchVariablesByEnvironment(
  token: string,
  environment: 'development' | 'staging' | 'production'
): Promise<Variable[]> {
  const response = await fetchVariables(token, { environment });
  return response.variables;
}

// Buscar variáveis por nome (para autocomplete)
export async function searchVariables(
  token: string,
  query: string,
  environment?: string
): Promise<Variable[]> {
  const response = await fetchVariables(token, {
    search: query,
    environment,
    limit: 20
  });
  return response.variables;
}
