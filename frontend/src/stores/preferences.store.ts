import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { i18n, DEFAULT_LOCALE } from '../i18n';

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

  function applyLocale(nextLocale: string) {
    i18n.global.locale.value = nextLocale;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', nextLocale);
    }
    persistLocale(nextLocale);
  }

  function initialize() {
    if (initialized.value) {
      return;
    }

    const stored = readStoredLocale();
    if (stored && isSupportedLocale(stored)) {
      locale.value = stored;
    }

    applyLocale(locale.value);
    initialized.value = true;
  }

  function setLocale(nextLocale: string) {
    if (!isSupportedLocale(nextLocale)) {
      console.warn(`Locale "${nextLocale}" não é suportado.`);
      return;
    }

    if (locale.value === nextLocale) {
      return;
    }

    locale.value = nextLocale;
    applyLocale(nextLocale);
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
    initialize,
    setLocale,
  };
});
