import { apiBaseUrl, apiFetch } from './api';
import type {
  ApiUser,
  AuthErrorResponse,
  LoginResponse,
  MeResponse,
} from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterPayload = {
  email: string;
  password: string;
  displayName: string;
  avatarColor?: string;
  accessToken?: string;
};

export type OAuthProvider = 'google' | 'github';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(
  token: string,
): Promise<MeResponse['user']> {
  const { user } = await apiFetch<MeResponse>('/auth/me', {
    method: 'GET',
    token,
  });
  return user;
}

export async function register(
  payload: RegisterPayload,
): Promise<{ status: string; user: ApiUser }> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function isAuthError(error: unknown): error is AuthErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as Record<string, unknown>).status === 'error'
  );
}

export function buildOAuthUrl(
  provider: OAuthProvider,
  redirectPath?: string,
): string {
  const target = new URL(`${apiBaseUrl}/auth/oauth/${provider}`, window.location.origin);

  if (redirectPath) {
    target.searchParams.set('redirect', redirectPath);
  }

  return target.toString();
}

export function beginOAuthFlow(provider: OAuthProvider, redirectPath?: string) {
  if (typeof window === 'undefined') {
    throw new Error('OAuth flow requires a browser context.');
  }

  const url = buildOAuthUrl(provider, redirectPath);
  window.location.assign(url);
}
