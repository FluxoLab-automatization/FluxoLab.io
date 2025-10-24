import { apiFetch } from './api';

export interface Connector {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'coming_soon';
  isOfficial: boolean;
  isPremium: boolean;
  tags: string[];
  documentationUrl?: string;
  supportUrl?: string;
  actions: ConnectorAction[];
  requirements: {
    authentication: 'none' | 'api_key' | 'oauth' | 'basic';
    scopes?: string[];
    webhooks?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorAction {
  id: string;
  connectorId: string;
  name: string;
  slug: string;
  description: string;
  type: 'trigger' | 'action' | 'condition';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  isAsync: boolean;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential';
    baseDelay: number;
  };
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface Connection {
  id: string;
  connectorId: string;
  connectorName: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'expired';
  credentials: {
    type: 'api_key' | 'oauth' | 'basic';
    fields: Record<string, string>;
  };
  lastTestedAt?: string;
  lastUsedAt?: string;
  expiresAt?: string;
  error?: {
    message: string;
    code: string;
    occurredAt: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface OAuthToken {
  id: string;
  connectionId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: string;
  scopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorsListResponse {
  connectors: Connector[];
  total: number;
  page: number;
  limit: number;
}

export interface ConnectorResponse {
  connector: Connector;
}

export interface ConnectionsListResponse {
  connections: Connection[];
  total: number;
  page: number;
  limit: number;
}

export interface ConnectionResponse {
  connection: Connection;
}

export interface TestConnectionPayload {
  connectorId: string;
  credentials: Record<string, string>;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Listar conectores disponíveis
export async function fetchConnectors(
  token: string,
  params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    isOfficial?: boolean;
    isPremium?: boolean;
  } = {}
): Promise<ConnectorsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.isOfficial !== undefined) searchParams.set('isOfficial', String(params.isOfficial));
  if (params.isPremium !== undefined) searchParams.set('isPremium', String(params.isPremium));

  const query = searchParams.toString();
  const url = `/connectors${query ? `?${query}` : ''}`;

  return apiFetch<ConnectorsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar conector por ID
export async function fetchConnector(
  token: string,
  connectorId: string
): Promise<ConnectorResponse> {
  return apiFetch<ConnectorResponse>(`/connectors/${connectorId}`, {
    method: 'GET',
    token,
  });
}

// Listar conexões do usuário
export async function fetchConnections(
  token: string,
  params: {
    page?: number;
    limit?: number;
    connectorId?: string;
    status?: string;
    search?: string;
  } = {}
): Promise<ConnectionsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.connectorId) searchParams.set('connectorId', params.connectorId);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = `/connections${query ? `?${query}` : ''}`;

  return apiFetch<ConnectionsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar conexão por ID
export async function fetchConnection(
  token: string,
  connectionId: string
): Promise<ConnectionResponse> {
  return apiFetch<ConnectionResponse>(`/connections/${connectionId}`, {
    method: 'GET',
    token,
  });
}

// Criar nova conexão
export async function createConnection(
  token: string,
  payload: {
    connectorId: string;
    name: string;
    description?: string;
    credentials: Record<string, string>;
  }
): Promise<ConnectionResponse> {
  return apiFetch<ConnectionResponse>('/connections', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Atualizar conexão
export async function updateConnection(
  token: string,
  connectionId: string,
  payload: {
    name?: string;
    description?: string;
    credentials?: Record<string, string>;
  }
): Promise<ConnectionResponse> {
  return apiFetch<ConnectionResponse>(`/connections/${connectionId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Deletar conexão
export async function deleteConnection(
  token: string,
  connectionId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/connections/${connectionId}`, {
    method: 'DELETE',
    token,
  });
}

// Testar conexão
export async function testConnection(
  token: string,
  payload: TestConnectionPayload
): Promise<TestConnectionResponse> {
  return apiFetch<TestConnectionResponse>('/connections/test', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Testar conexão existente
export async function testExistingConnection(
  token: string,
  connectionId: string
): Promise<TestConnectionResponse> {
  return apiFetch<TestConnectionResponse>(`/connections/${connectionId}/test`, {
    method: 'POST',
    token,
  });
}

// Iniciar fluxo OAuth
export async function initiateOAuthFlow(
  token: string,
  connectorId: string,
  redirectUrl?: string
): Promise<{
  authUrl: string;
  state: string;
}> {
  const searchParams = new URLSearchParams();
  if (redirectUrl) searchParams.set('redirectUrl', redirectUrl);

  const query = searchParams.toString();
  const url = `/connectors/${connectorId}/oauth/initiate${query ? `?${query}` : ''}`;

  return apiFetch<{
    authUrl: string;
    state: string;
  }>(url, {
    method: 'POST',
    token,
  });
}

// Completar fluxo OAuth
export async function completeOAuthFlow(
  token: string,
  connectorId: string,
  code: string,
  state: string
): Promise<ConnectionResponse> {
  return apiFetch<ConnectionResponse>(`/connectors/${connectorId}/oauth/complete`, {
    method: 'POST',
    token,
    body: JSON.stringify({ code, state }),
  });
}

// Obter categorias de conectores
export async function fetchConnectorCategories(
  token: string
): Promise<{
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
    connectorCount: number;
  }>;
}> {
  return apiFetch<{
    categories: Array<{
      id: string;
      name: string;
      description: string;
      icon?: string;
      connectorCount: number;
    }>;
  }>('/connectors/categories', {
    method: 'GET',
    token,
  });
}

// Buscar conectores por categoria
export async function fetchConnectorsByCategory(
  token: string,
  categoryId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<ConnectorsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = `/connectors/categories/${categoryId}${query ? `?${query}` : ''}`;

  return apiFetch<ConnectorsListResponse>(url, {
    method: 'GET',
    token,
  });
}
