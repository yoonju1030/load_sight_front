import { createI18n } from 'vue-i18n';
import ko from './locales/ko';
import en from './locales/en';
import ja from './locales/ja';

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja'];
export const LOCALE_STORAGE_KEY = 'loadsight-locale';

function getInitialLocale() {
  let savedLocale = null;
  try {
    savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
  if (SUPPORTED_LOCALES.includes(savedLocale)) return savedLocale;

  const browserLocale = window.navigator.language?.toLowerCase() ?? '';
  if (browserLocale.startsWith('ja')) return 'ja';
  if (browserLocale.startsWith('en')) return 'en';
  return 'ko';
}

const locale = getInitialLocale();
document.documentElement.lang = locale;

export default createI18n({
  legacy: true,
  globalInjection: true,
  locale,
  fallbackLocale: 'ko',
  messages: { ko, en, ja }
});
