import { apiFetch } from './api';

export interface AiConversation {
  id: string;
  title: string;
  context: {
    type: 'workflow' | 'general' | 'support';
    entityId?: string;
    entityName?: string;
  };
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    suggestions?: string[];
    actions?: Array<{
      type: 'workflow_action' | 'navigate' | 'search' | 'help';
      label: string;
      data: Record<string, unknown>;
    }>;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'workflow' | 'variable';
    name: string;
    url?: string;
    data?: Record<string, unknown>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationPayload {
  title: string;
  context: {
    type: 'workflow' | 'general' | 'support';
    entityId?: string;
    entityName?: string;
  };
}

export interface SendMessagePayload {
  content: string;
  attachments?: Array<{
    type: 'image' | 'file' | 'workflow' | 'variable';
    name: string;
    url?: string;
    data?: Record<string, unknown>;
  }>;
  context?: {
    workflowId?: string;
    variables?: Record<string, unknown>;
    recentMessages?: number;
  };
}

export interface ConversationsListResponse {
  conversations: AiConversation[];
  total: number;
  page: number;
  limit: number;
}

export interface ConversationResponse {
  conversation: AiConversation;
}

export interface MessagesListResponse {
  messages: AiMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageResponse {
  message: AiMessage;
}

export interface AiCapabilities {
  models: Array<{
    id: string;
    name: string;
    description: string;
    maxTokens: number;
    capabilities: string[];
    isAvailable: boolean;
  }>;
  features: Array<{
    id: string;
    name: string;
    description: string;
    isEnabled: boolean;
  }>;
  limits: {
    maxMessagesPerConversation: number;
    maxConversationsPerUser: number;
    maxTokensPerRequest: number;
    rateLimitPerMinute: number;
  };
}

// Listar conversas do usuário
export async function fetchConversations(
  token: string,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    contextType?: string;
    search?: string;
    sortBy?: 'lastMessageAt' | 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<ConversationsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.contextType) searchParams.set('contextType', params.contextType);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/ai-chat/conversations${query ? `?${query}` : ''}`;

  return apiFetch<ConversationsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar conversa por ID
export async function fetchConversation(
  token: string,
  conversationId: string
): Promise<ConversationResponse> {
  return apiFetch<ConversationResponse>(`/ai-chat/conversations/${conversationId}`, {
    method: 'GET',
    token,
  });
}

// Criar nova conversa
export async function createConversation(
  token: string,
  payload: CreateConversationPayload
): Promise<ConversationResponse> {
  return apiFetch<ConversationResponse>('/ai-chat/conversations', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Atualizar conversa
export async function updateConversation(
  token: string,
  conversationId: string,
  payload: {
    title?: string;
    status?: 'active' | 'archived' | 'deleted';
  }
): Promise<ConversationResponse> {
  return apiFetch<ConversationResponse>(`/ai-chat/conversations/${conversationId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Deletar conversa
export async function deleteConversation(
  token: string,
  conversationId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/ai-chat/conversations/${conversationId}`, {
    method: 'DELETE',
    token,
  });
}

// Listar mensagens de uma conversa
export async function fetchMessages(
  token: string,
  conversationId: string,
  params: {
    page?: number;
    limit?: number;
    before?: string; // ID da mensagem para paginação
    after?: string; // ID da mensagem para paginação
  } = {}
): Promise<MessagesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.before) searchParams.set('before', params.before);
  if (params.after) searchParams.set('after', params.after);

  const query = searchParams.toString();
  const url = `/ai-chat/conversations/${conversationId}/messages${query ? `?${query}` : ''}`;

  return apiFetch<MessagesListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Enviar mensagem
export async function sendMessage(
  token: string,
  conversationId: string,
  payload: SendMessagePayload
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/ai-chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Buscar mensagem por ID
export async function fetchMessage(
  token: string,
  conversationId: string,
  messageId: string
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/ai-chat/conversations/${conversationId}/messages/${messageId}`, {
    method: 'GET',
    token,
  });
}

// Deletar mensagem
export async function deleteMessage(
  token: string,
  conversationId: string,
  messageId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/ai-chat/conversations/${conversationId}/messages/${messageId}`, {
    method: 'DELETE',
    token,
  });
}

// Obter capacidades da IA
export async function fetchAiCapabilities(
  token: string
): Promise<AiCapabilities> {
  return apiFetch<AiCapabilities>('/ai-chat/capabilities', {
    method: 'GET',
    token,
  });
}

// Buscar conversas por contexto
export async function fetchConversationsByContext(
  token: string,
  contextType: string,
  entityId?: string
): Promise<AiConversation[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('contextType', contextType);
  if (entityId) searchParams.set('entityId', entityId);

  const response = await fetchConversations(token, {
    contextType,
    limit: 50,
    sortBy: 'lastMessageAt',
    sortOrder: 'desc'
  });

  return response.conversations;
}

// Obter sugestões de contexto
export async function fetchContextSuggestions(
  token: string,
  query: string,
  contextType?: string
): Promise<{
  suggestions: Array<{
    id: string;
    type: 'workflow' | 'variable' | 'connector' | 'template';
    name: string;
    description: string;
    relevance: number;
  }>;
}> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  if (contextType) searchParams.set('contextType', contextType);

  return apiFetch<{
    suggestions: Array<{
      id: string;
      type: 'workflow' | 'variable' | 'connector' | 'template';
      name: string;
      description: string;
      relevance: number;
    }>;
  }>(`/ai-chat/suggestions?${searchParams.toString()}`, {
    method: 'GET',
    token,
  });
}

// Exportar conversa
export async function exportConversation(
  token: string,
  conversationId: string,
  format: 'json' | 'markdown' | 'pdf' = 'json'
): Promise<{
  downloadUrl: string;
  expiresAt: string;
}> {
  return apiFetch<{
    downloadUrl: string;
    expiresAt: string;
  }>(`/ai-chat/conversations/${conversationId}/export?format=${format}`, {
    method: 'POST',
    token,
  });
}
