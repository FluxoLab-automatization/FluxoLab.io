export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const DEFAULT_BASE_URL = 'http://localhost:3000/api';

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim().replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

const baseUrl = resolveBaseUrl();

export const apiBaseUrl = baseUrl;

export interface ApiRequestOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers ?? {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const resultText = await response.text();
  let data: unknown = null;
  if (resultText) {
    try {
      data = JSON.parse(resultText);
    } catch (error) {
      throw new ApiError(
        response.status,
        'Resposta da API nao eh JSON valido.',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  if (!response.ok) {
    const message = (data as Record<string, unknown> | null)?.message ?? 'Erro ao processar requisicao.';
    throw new ApiError(response.status, message, data);
  }

  return data as TResponse;
}






