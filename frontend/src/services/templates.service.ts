import { apiFetch } from './api';

export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  vertical: 'health' | 'retail' | 'marketing' | 'agro' | 'accounting' | 'hr' | 'general';
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'coming_soon';
  isOfficial: boolean;
  isPremium: boolean;
  tags: string[];
  icon?: string;
  previewImage?: string;
  documentationUrl?: string;
  supportUrl?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  parameters: TemplateParameter[];
  workflow: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      position: { x: number; y: number };
      data: Record<string, unknown>;
    }>;
    connections: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
  };
  requirements: {
    connectors: string[];
    variables: string[];
    permissions: string[];
  };
  metrics: {
    installCount: number;
    rating: number;
    reviewCount: number;
    successRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{
    value: string;
    label: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

export interface TemplateInstallation {
  id: string;
  templateId: string;
  templateName: string;
  workflowId: string;
  workflowName: string;
  parameters: Record<string, unknown>;
  status: 'installing' | 'installed' | 'failed' | 'updating';
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  installedAt: string;
  updatedAt: string;
  installedBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplatesListResponse {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
}

export interface TemplateResponse {
  template: Template;
}

export interface TemplateInstallationResponse {
  installation: TemplateInstallation;
}

export interface TemplateReviewsResponse {
  reviews: TemplateReview[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}

// Listar templates disponíveis
export async function fetchTemplates(
  token: string,
  params: {
    page?: number;
    limit?: number;
    category?: string;
    vertical?: string;
    search?: string;
    status?: string;
    isOfficial?: boolean;
    isPremium?: boolean;
    sortBy?: 'popularity' | 'rating' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<TemplatesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.vertical) searchParams.set('vertical', params.vertical);
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.isOfficial !== undefined) searchParams.set('isOfficial', String(params.isOfficial));
  if (params.isPremium !== undefined) searchParams.set('isPremium', String(params.isPremium));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/templates${query ? `?${query}` : ''}`;

  return apiFetch<TemplatesListResponse>(url, {
    method: 'GET',
    token,
  });
}

// Buscar template por ID
export async function fetchTemplate(
  token: string,
  templateId: string
): Promise<TemplateResponse> {
  return apiFetch<TemplateResponse>(`/templates/${templateId}`, {
    method: 'GET',
    token,
  });
}

// Instalar template
export async function installTemplate(
  token: string,
  templateId: string,
  payload: {
    workflowName: string;
    parameters: Record<string, unknown>;
    overwrite?: boolean;
  }
): Promise<TemplateInstallationResponse> {
  return apiFetch<TemplateInstallationResponse>(`/templates/${templateId}/install`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Listar instalações do usuário
export async function fetchTemplateInstallations(
  token: string,
  params: {
    page?: number;
    limit?: number;
    templateId?: string;
    status?: string;
    search?: string;
  } = {}
): Promise<{
  installations: TemplateInstallation[];
  total: number;
  page: number;
  limit: number;
}> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.templateId) searchParams.set('templateId', params.templateId);
  if (params.status) searchParams.set('status', params.status);
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = `/templates/installations${query ? `?${query}` : ''}`;

  return apiFetch<{
    installations: TemplateInstallation[];
    total: number;
    page: number;
    limit: number;
  }>(url, {
    method: 'GET',
    token,
  });
}

// Atualizar instalação
export async function updateTemplateInstallation(
  token: string,
  installationId: string,
  payload: {
    parameters?: Record<string, unknown>;
    workflowName?: string;
  }
): Promise<TemplateInstallationResponse> {
  return apiFetch<TemplateInstallationResponse>(`/templates/installations/${installationId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}

// Desinstalar template
export async function uninstallTemplate(
  token: string,
  installationId: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/templates/installations/${installationId}`, {
    method: 'DELETE',
    token,
  });
}

// Obter reviews de template
export async function fetchTemplateReviews(
  token: string,
  templateId: string,
  params: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'helpful' | 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<TemplateReviewsResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.rating) searchParams.set('rating', String(params.rating));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/templates/${templateId}/reviews${query ? `?${query}` : ''}`;

  return apiFetch<TemplateReviewsResponse>(url, {
    method: 'GET',
    token,
  });
}

// Criar review
export async function createTemplateReview(
  token: string,
  templateId: string,
  payload: {
    rating: number;
    title: string;
    comment: string;
  }
): Promise<{
  review: TemplateReview;
}> {
  return apiFetch<{
    review: TemplateReview;
  }>(`/templates/${templateId}/reviews`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

// Marcar review como útil
export async function markReviewHelpful(
  token: string,
  reviewId: string
): Promise<{
  helpful: number;
}> {
  return apiFetch<{
    helpful: number;
  }>(`/templates/reviews/${reviewId}/helpful`, {
    method: 'POST',
    token,
  });
}

// Obter categorias de templates
export async function fetchTemplateCategories(
  token: string
): Promise<{
  categories: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
    templateCount: number;
  }>;
}> {
  return apiFetch<{
    categories: Array<{
      id: string;
      name: string;
      description: string;
      icon?: string;
      templateCount: number;
    }>;
  }>('/templates/categories', {
    method: 'GET',
    token,
  });
}

// Obter verticais de templates
export async function fetchTemplateVerticals(
  token: string
): Promise<{
  verticals: Array<{
    id: string;
    name: string;
    description: string;
    icon?: string;
    templateCount: number;
  }>;
}> {
  return apiFetch<{
    verticals: Array<{
      id: string;
      name: string;
      description: string;
      icon?: string;
      templateCount: number;
    }>;
  }>('/templates/verticals', {
    method: 'GET',
    token,
  });
}

// Buscar templates por vertical
export async function fetchTemplatesByVertical(
  token: string,
  verticalId: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<TemplatesListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = `/templates/verticals/${verticalId}${query ? `?${query}` : ''}`;

  return apiFetch<TemplatesListResponse>(url, {
    method: 'GET',
    token,
  });
}
