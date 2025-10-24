import { apiFetch } from './api';

export interface Tag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface CreateTagPayload {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateTagPayload {
  name?: string;
  color?: string;
  description?: string;
}

export interface TagsListResponse {
  tags: Tag[];
  total: number;
  page: number;
  limit: number;
}

export interface TagResponse {
  tag: Tag;
}

// Listar tags do workspace
export async function fetchTags(
  token: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'name' | 'usageCount' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<TagsListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/tags${query ? `?${query}` : ''}`;

  return apiFetch<TagsListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar tag por ID
export async function fetchTag(
  token: string,
  tagId: string
): Promise<TagResponse> {
  return apiFetch<TagResponse>(`/tags/${tagId}`, {
    method: 'GET',
    token,
  });
}

// Criar nova tag
export async function createTag(
  token: string,
  payload: CreateTagPayload
): Promise<TagResponse> {
  return apiFetch<TagResponse>('/tags', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Atualizar tag
export async function updateTag(
  token: string,
  tagId: string,
  payload: UpdateTagPayload
): Promise<TagResponse> {
  return apiFetch<TagResponse>(`/tags/${tagId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Deletar tag
export async function deleteTag(
  token: string,
  tagId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/tags/${tagId}`, {
    method: 'DELETE',
    token,
  });
}

// Buscar tags por nome (para autocomplete)
export async function searchTags(
  token: string,
  query: string,
  limit: number = 10
): Promise<Tag[]> {
  const response = await fetchTags(token, {
    search: query,
    limit,
    sortBy: 'usageCount',
    sortOrder: 'desc'
  });
  return response.tags;
}

// Obter tags mais usadas
export async function fetchPopularTags(
  token: string,
  limit: number = 10
): Promise<Tag[]> {
  const response = await fetchTags(token, {
    limit,
    sortBy: 'usageCount',
    sortOrder: 'desc'
  });
  return response.tags;
}

// Validar se nome da tag está disponível
export async function validateTagName(
  token: string,
  name: string,
  excludeId?: string
): Promise<{ available: boolean; message?: string }> {
  const searchParams = new URLSearchParams();
  searchParams.set('name', name);
  if (excludeId) searchParams.set('excludeId', excludeId);

  return apiFetch<{ available: boolean; message?: string }>(
    `/tags/validate?${searchParams.toString()}`,
    {
      method: 'GET',
      token,
    }
  );
}
