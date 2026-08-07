<template>
  <div
    class="locale-switcher"
    :class="{ 'locale-switcher--dark': dark }"
    role="group"
    :aria-label="$t('language.selector')"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ active: currentLocale === option.value }"
      :aria-pressed="currentLocale === option.value"
      :title="$t(`language.${option.value}`)"
      @click="changeLocale(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES
} from '../../i18n';

export default {
  name: 'LocaleSwitcher',
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: [
        { value: 'ko', label: 'KO' },
        { value: 'en', label: 'EN' },
        { value: 'ja', label: 'JP' }
      ]
    };
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale;
    }
  },
  methods: {
    changeLocale(locale) {
      if (!SUPPORTED_LOCALES.includes(locale)) return;

      this.$i18n.locale = locale;
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      } catch {
        // The active locale still changes when browser storage is unavailable.
      }
      document.documentElement.lang = locale;
    }
  }
};
</script>

<style scoped>
.locale-switcher {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: #eef2f7;
  border: 1px solid #dde4ed;
  border-radius: 9px;
}

.locale-switcher button {
  min-width: 32px;
  height: 25px;
  padding: 0 7px;
  color: #7c899b;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  transition: color 150ms ease, background 150ms ease, box-shadow 150ms ease;
}

.locale-switcher button:hover {
  color: #2f6bea;
}

.locale-switcher button.active {
  color: #245ed3;
  background: #ffffff;
  box-shadow: 0 1px 5px rgba(37, 53, 78, 0.13);
}

.locale-switcher--dark {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.09);
}

.locale-switcher--dark button {
  min-width: 28px;
  color: #7f8a9b;
}

.locale-switcher--dark button:hover {
  color: #ffffff;
}

.locale-switcher--dark button.active {
  color: #ffffff;
  background: #2f6bea;
  box-shadow: none;
}
</style>
