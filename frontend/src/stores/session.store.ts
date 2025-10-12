import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { ApiUser } from '../types/api';
import {
  fetchCurrentUser,
  login as loginRequest,
  register as registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from '../services/auth.service';
import { ApiError } from '../services/api';

const TOKEN_STORAGE_KEY = 'fluxolab.token';
const USER_STORAGE_KEY = 'fluxolab.user';

function readFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    console.warn(`Failed to parse storage key "${key}"`, err);
    return null;
  }
}

function writeToStorage<T>(key: string, value: T | null) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`Failed to persist storage key "${key}"`, err);
  }
}

export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(null);
  const user = ref<ApiUser | null>(null);
  const loading = ref(false);
  const initialized = ref(false);
  const error = ref<string | null>(null);

  function setSession(newToken: string, newUser: ApiUser) {
    token.value = newToken;
    user.value = newUser;
    writeToStorage(TOKEN_STORAGE_KEY, newToken);
    writeToStorage(USER_STORAGE_KEY, newUser);
  }

  function clearSession() {
    token.value = null;
    user.value = null;
    writeToStorage<string | null>(TOKEN_STORAGE_KEY, null);
    writeToStorage<ApiUser | null>(USER_STORAGE_KEY, null);
  }

  async function initialize() {
    if (initialized.value) {
      return;
    }

    const storedToken = readFromStorage<string>(TOKEN_STORAGE_KEY);
    const storedUser = readFromStorage<ApiUser>(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = storedUser;
      try {
        const refreshed = await fetchCurrentUser(storedToken);
        user.value = refreshed;
        writeToStorage(USER_STORAGE_KEY, refreshed);
      } catch (err) {
        console.warn('Falha ao validar sessão armazenada:', err);
        clearSession();
      }
    }

    initialized.value = true;
  }

  async function login(credentials: LoginPayload) {
    loading.value = true;
    error.value = null;
    try {
      const response = await loginRequest(credentials);
      setSession(response.token, response.user);
      return response.user;
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Nao foi possivel autenticar.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true;
    error.value = null;
    try {
      await registerRequest(payload);
      const response = await loginRequest({
        email: payload.email,
        password: payload.password,
      });
      setSession(response.token, response.user);
      return response.user;
    } catch (err) {
      if (err instanceof ApiError) {
        error.value = err.message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Nao foi possivel concluir o cadastro.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function refreshUser() {
    if (!token.value) {
      return null;
    }

    try {
      const refreshed = await fetchCurrentUser(token.value);
      user.value = refreshed;
      writeToStorage(USER_STORAGE_KEY, refreshed);
      return refreshed;
    } catch (err) {
      console.warn('Falha ao atualizar sessão:', err);
      clearSession();
      return null;
    }
  }

  const isAuthenticated = computed(
    () => Boolean(token.value) && Boolean(user.value),
  );

  return {
    token,
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    initialize,
    login,
    register,
    refreshUser,
    clearSession,
    setSession,
  };
});

