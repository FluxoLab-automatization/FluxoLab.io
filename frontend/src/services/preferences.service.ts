import { apiFetch } from './api';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    workflow: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'workflows' | 'executions';
    itemsPerPage: number;
  };
}

export interface PreferencesResponse {
  status: string;
  preferences: UserPreferences;
}

/**
 * Busca as preferências do usuário no backend
 */
export async function fetchUserPreferences(token: string): Promise<UserPreferences> {
  const response = await apiFetch<PreferencesResponse>('/users/preferences', {
    method: 'GET',
    token,
  });

  return response.preferences;
}

/**
 * Atualiza as preferências do usuário no backend
 */
export async function updateUserPreferences(
  token: string,
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> {
  const response = await apiFetch<PreferencesResponse>('/users/preferences', {
    method: 'PUT',
    token,
    body: JSON.stringify(preferences),
  });

  return response.preferences;
}

/**
 * Atualiza apenas a linguagem do usuário
 */
export async function updateUserLanguage(
  token: string,
  language: string,
): Promise<UserPreferences> {
  return updateUserPreferences(token, { language });
}
