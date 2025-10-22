import { createI18n } from 'vue-i18n';
import ptBR from './locales/pt-BR';
import enUS from './locales/en-US';

export const DEFAULT_LOCALE = 'pt-BR';
export const FALLBACK_LOCALE = 'en-US';

export const messages = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
});
