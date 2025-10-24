import { apiFetch } from './api';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
  tags: string[];
  attachments: SupportAttachment[];
  messages: SupportMessage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
}

export interface SupportCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  type: 'user' | 'agent' | 'system';
  isInternal: boolean;
  attachments: SupportAttachment[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
}

export interface SupportAttachment {
  id: string;
  ticketId?: string;
  messageId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  uploadedBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  categoryId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  attachments?: string[]; // IDs dos anexos
  metadata?: Record<string, unknown>;
}

export interface UpdateTicketPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  tags?: string[];
  assignedToId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateMessagePayload {
  content: string;
  isInternal?: boolean;
  attachments?: string[]; // IDs dos anexos
  metadata?: Record<string, unknown>;
}

export interface TicketsListResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export interface TicketResponse {
  ticket: SupportTicket;
}

export interface CategoriesListResponse {
  categories: SupportCategory[];
  total: number;
}

export interface CategoryResponse {
  category: SupportCategory;
}

export interface MessagesListResponse {
  messages: SupportMessage[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageResponse {
  message: SupportMessage;
}

export interface AttachmentResponse {
  attachment: SupportAttachment;
}

// Listar tickets do usuário
export async function fetchTickets(
  token: string,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    categoryId?: string;
    assignedToId?: string;
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<TicketsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params.assignedToId) searchParams.set('assignedToId', params.assignedToId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/support/tickets${query ? `?${query}` : ''}`;

  return apiFetch<TicketsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar ticket por ID
export async function fetchTicket(
  token: string,
  ticketId: string
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/support/tickets/${ticketId}`, {
    method: 'GET',
    token,
  });
}

// Criar novo ticket
export async function createTicket(
  token: string,
  payload: CreateTicketPayload
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>('/support/tickets', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Atualizar ticket
export async function updateTicket(
  token: string,
  ticketId: string,
  payload: UpdateTicketPayload
): Promise<TicketResponse> {
  return apiFetch<TicketResponse>(`/support/tickets/${ticketId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Deletar ticket
export async function deleteTicket(
  token: string,
  ticketId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/support/tickets/${ticketId}`, {
    method: 'DELETE',
    token,
  });
}

// Listar categorias
export async function fetchCategories(
  token: string
): Promise<CategoriesListResponse> {
  return apiFetch<CategoriesListResponse>('/support/categories', {
    method: 'GET',
    token,
  });
}

// Buscar categoria por ID
export async function fetchCategory(
  token: string,
  categoryId: string
): Promise<CategoryResponse> {
  return apiFetch<CategoryResponse>(`/support/categories/${categoryId}`, {
    method: 'GET',
    token,
  });
}

// Listar mensagens de um ticket
export async function fetchMessages(
  token: string,
  ticketId: string,
  params: {
    page?: number;
    limit?: number;
    includeInternal?: boolean;
  } = {}
): Promise<MessagesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.includeInternal !== undefined) searchParams.set('includeInternal', String(params.includeInternal));

  const query = searchParams.toString();
  const url = `/support/tickets/${ticketId}/messages${query ? `?${query}` : ''}`;

  return apiFetch<MessagesListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Enviar mensagem
export async function sendMessage(
  token: string,
  ticketId: string,
  payload: CreateMessagePayload
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Buscar mensagem por ID
export async function fetchMessage(
  token: string,
  ticketId: string,
  messageId: string
): Promise<MessageResponse> {
  return apiFetch<MessageResponse>(`/support/tickets/${ticketId}/messages/${messageId}`, {
    method: 'GET',
    token,
  });
}

// Deletar mensagem
export async function deleteMessage(
  token: string,
  ticketId: string,
  messageId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/support/tickets/${ticketId}/messages/${messageId}`, {
    method: 'DELETE',
    token,
  });
}

// Upload de anexo
export async function uploadAttachment(
  token: string,
  file: File,
  ticketId?: string
): Promise<AttachmentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (ticketId) formData.append('ticketId', ticketId);

  return apiFetch<AttachmentResponse>('/support/attachments', {
    method: 'POST',
    token,
    body: formData,
  });
}

// Buscar anexo por ID
export async function fetchAttachment(
  token: string,
  attachmentId: string
): Promise<AttachmentResponse> {
  return apiFetch<AttachmentResponse>(`/support/attachments/${attachmentId}`, {
    method: 'GET',
    token,
  });
}

// Deletar anexo
export async function deleteAttachment(
  token: string,
  attachmentId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/support/attachments/${attachmentId}`, {
    method: 'DELETE',
    token,
  });
}

// Obter estatísticas de suporte
export async function fetchSupportStats(
  token: string
): Promise<{
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResponseTime: number; // em horas
  satisfactionScore: number; // 0-5
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
}> {
  return apiFetch<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    satisfactionScore: number;
    ticketsByStatus: Record<string, number>;
    ticketsByPriority: Record<string, number>;
    ticketsByCategory: Array<{
      categoryId: string;
      categoryName: string;
      count: number;
    }>;
  }>('/support/stats', {
    method: 'GET',
    token,
  });
}

// Buscar tickets por status
export async function fetchTicketsByStatus(
  token: string,
  status: string,
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<SupportTicket[]> {
  const response = await fetchTickets(token, { ...params, status });
  return response.tickets;
}

// Buscar tickets por prioridade
export async function fetchTicketsByPriority(
  token: string,
  priority: string,
  params: {
    page?: number;
    limit?: number;
  } = {}
): Promise<SupportTicket[]> {
  const response = await fetchTickets(token, { ...params, priority });
  return response.tickets;
}
