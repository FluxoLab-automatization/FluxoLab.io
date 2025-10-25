import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { i18n, DEFAULT_LOCALE } from '../i18n';
import { fetchUserPreferences, updateUserLanguage, type UserPreferences } from '../services/preferences.service';
import { useSessionStore } from './session.store';

const LOCALE_STORAGE_KEY = 'fluxolab.locale';

const AVAILABLE_LOCALES = [
  { value: 'pt-BR', messageKey: 'ptBR' },
  { value: 'en-US', messageKey: 'enUS' },
] as const;

type AvailableLocale = (typeof AVAILABLE_LOCALES)[number]['value'];

function isSupportedLocale(value: string): value is AvailableLocale {
  return AVAILABLE_LOCALES.some((option) => option.value === value);
}

function readStoredLocale(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const persisted = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return persisted ? JSON.parse(persisted) : null;
  } catch (error) {
    console.warn('Falha ao ler idioma salvo:', error);
    return null;
  }
}

function persistLocale(value: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('Falha ao salvar idioma:', error);
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const locale = ref<AvailableLocale>(DEFAULT_LOCALE);
  const initialized = ref(false);
  const loading = ref(false);
  const backendPreferences = ref<UserPreferences | null>(null);

  const sessionStore = useSessionStore();

  function applyLocale(nextLocale: string, persist = true) {
    i18n.global.locale.value = nextLocale;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', nextLocale);
    }
    if (persist) {
      persistLocale(nextLocale);
    }
  }

  /**
   * Sincroniza o idioma com o backend
   */
  async function syncLanguageWithBackend(language: string): Promise<void> {
    if (!sessionStore.token || !sessionStore.initialized) {
      return;
    }

    try {
      await updateUserLanguage(sessionStore.token, language);
      console.log('Idioma sincronizado com o backend:', language);
    } catch (error) {
      console.error('Erro ao sincronizar idioma com o backend:', error);
      // Não interrompe o fluxo, apenas loga o erro
    }
  }

  /**
   * Busca as preferências do backend
   */
  async function loadBackendPreferences(): Promise<void> {
    if (!sessionStore.token || !sessionStore.initialized) {
      return;
    }

    try {
      const preferences = await fetchUserPreferences(sessionStore.token);
      backendPreferences.value = preferences;

      // Se o backend tem um idioma configurado, usa ele
      if (preferences.language && isSupportedLocale(preferences.language)) {
        locale.value = preferences.language;
        applyLocale(preferences.language, false); // Não persiste aqui pois já veio do backend
      }
    } catch (error) {
      console.error('Erro ao carregar preferências do backend:', error);
      // Continua com a lógica local em caso de erro
    }
  }

  async function initialize() {
    if (initialized.value) {
      return;
    }

    // Primeiro carrega do localStorage como fallback rápido
    const stored = readStoredLocale();
    if (stored && isSupportedLocale(stored)) {
      locale.value = stored;
      applyLocale(stored, false); // Já está no localStorage, não precisa persistir de novo
    } else {
      // Se não tem nada salvo, aplica o padrão
      applyLocale(locale.value, false);
    }

    // Depois tenta carregar do backend
    loading.value = true;
    try {
      await loadBackendPreferences();
    } finally {
      loading.value = false;
    }

    initialized.value = true;
  }

  async function setLocale(nextLocale: string) {
    if (!isSupportedLocale(nextLocale)) {
      console.warn(`Locale "${nextLocale}" não é suportado.`);
      return;
    }

    if (locale.value === nextLocale) {
      return;
    }

    locale.value = nextLocale;
    applyLocale(nextLocale, true); // Persiste no localStorage

    // Sincroniza com o backend
    await syncLanguageWithBackend(nextLocale);
  }

  const localeOptions = computed(() =>
    AVAILABLE_LOCALES.map((option) => ({
      value: option.value,
      label: i18n.global.t(`common.languages.${option.messageKey}`),
    })),
  );

  return {
    locale,
    localeOptions,
    loading,
    backendPreferences,
    initialized,
    initialize,
    setLocale,
    loadBackendPreferences,
  };
});
