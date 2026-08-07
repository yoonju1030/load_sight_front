<template>
  <v-app>
    <router-view v-if="isAuthPage" />

    <div v-else class="app-shell">
      <aside class="sidebar" :aria-label="$t('app.mainMenu')">
        <router-link to="/" class="brand">
          <span class="brand-mark" aria-hidden="true">
            <i></i><i></i><i></i>
          </span>
          <span>LoadSight</span>
        </router-link>

        <nav class="navigation">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item) }"
          >
            {{ $t(item.titleKey) }}
          </router-link>
        </nav>

        <LocaleSwitcher class="sidebar-locale" dark />

        <div class="account-area">
          <div class="account-avatar" aria-hidden="true">{{ userInitial }}</div>
          <div class="account-info">
            <strong>{{ currentUser?.name || $t('app.user') }}</strong>
            <span>{{ currentUser?.email || '' }}</span>
          </div>
          <button
            type="button"
            class="logout-button"
            :aria-label="$t('app.logout')"
            :title="$t('app.logout')"
            @click="handleLogout"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
            </svg>
          </button>
        </div>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import LocaleSwitcher from './components/common/LocaleSwitcher.vue';

export default {
  name: 'App',
  components: {
    LocaleSwitcher
  },
  data() {
    return {
      navItems: [
        { titleKey: 'app.nav.dashboard', to: '/' },
        { titleKey: 'app.nav.testPlans', to: '/test-plans' },
        { titleKey: 'app.nav.runs', to: '/runs' },
        { titleKey: 'app.nav.compare', to: '/compare' }
      ]
    };
  },
  computed: {
    ...mapGetters('auth', ['currentUser']),
    isAuthPage() {
      return Boolean(this.$route.meta.authPage);
    },
    userInitial() {
      return (this.currentUser?.name || this.currentUser?.email || 'U')
        .trim()
        .charAt(0)
        .toUpperCase();
    }
  },
  created() {
    this.$store.dispatch('auth/restoreSession');
  },
  methods: {
    isActive(item) {
      if (item.to === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(item.to);
    },
    async handleLogout() {
      await this.$store.dispatch('auth/logout');
      await this.$router.replace({ name: 'Login' });
    }
  }
};
</script>

<style>
:root {
  --sidebar-width: 124px;
  --primary: #2f6bea;
  --primary-dark: #1d4ed8;
  --surface: #ffffff;
  --page-bg: #f4f7fb;
  --border: #dfe5ec;
  --text: #172033;
  --muted: #7b8799;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  min-width: 320px;
  min-height: 100%;
  margin: 0;
  font-family: Inter, Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  color: var(--text);
  background: #ffffff;
}

button,
a {
  font: inherit;
}

.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
  padding: 3px;
  background: #ffffff;
}

.sidebar {
  position: sticky;
  top: 3px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 6px);
  padding: 15px 10px;
  overflow-y: auto;
  color: #ffffff;
  background: #111827;
  border-radius: 14px 0 0 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 16px 1px;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  text-decoration: none;
  letter-spacing: -0.35px;
}

.brand-mark {
  display: none;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  width: 25px;
  height: 25px;
  padding: 6px;
  background: #2f6bea;
  border-radius: 7px;
}

.brand-mark i {
  width: 3px;
  height: 7px;
  background: #ffffff;
  border-radius: 3px;
}

.brand-mark i:nth-child(2) {
  height: 12px;
}

.brand-mark i:nth-child(3) {
  height: 9px;
}

.navigation {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-item {
  display: flex;
  align-items: center;
  min-height: 25px;
  padding: 6px 9px;
  color: #9aa5b5;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.3;
  text-decoration: none;
  border-radius: 6px;
  transition: color 160ms ease, background-color 160ms ease;
}

.nav-item:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.nav-item--active {
  color: #ffffff;
  background: var(--primary);
}

.nav-item--active:hover {
  background: var(--primary-dark);
}

.account-area {
  display: grid;
  grid-template-columns: 29px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 7px;
  padding: 10px 7px 0;
  margin-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-locale {
  align-self: center;
  margin-top: auto;
  margin-bottom: 10px;
}

.account-avatar {
  display: grid;
  width: 29px;
  height: 29px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  background: #2f6bea;
  border-radius: 8px;
  place-items: center;
}

.account-info {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.account-info strong,
.account-info span {
  overflow: hidden;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-info strong {
  color: #f4f7fb;
  font-size: 9px;
  font-weight: 700;
}

.account-info span {
  color: #8995a8;
  font-size: 7px;
}

.logout-button {
  display: grid;
  width: 28px;
  height: 28px;
  padding: 6px;
  color: #8995a8;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  place-items: center;
}

.logout-button:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.logout-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.main-content {
  min-width: 0;
  min-height: calc(100vh - 6px);
  overflow: hidden;
  background: var(--page-bg);
  border: 1px solid #e1e6ed;
  border-left: 0;
  border-radius: 0 14px 0 0;
}

@media (min-width: 1100px) {
  :root {
    --sidebar-width: 184px;
  }

  .sidebar {
    padding: 22px 16px;
  }

  .brand {
    margin-bottom: 24px;
    font-size: 19px;
  }

  .brand-mark {
    display: flex;
  }

  .nav-item {
    min-height: 38px;
    padding: 10px 13px;
    font-size: 13px;
  }

  .account-area {
    grid-template-columns: 34px minmax(0, 1fr) 30px;
    gap: 9px;
    padding: 14px 3px 0;
  }

  .sidebar-locale {
    margin-bottom: 14px;
  }

  .account-avatar {
    width: 34px;
    height: 34px;
    font-size: 12px;
  }

  .account-info strong {
    font-size: 10px;
  }

  .account-info span {
    font-size: 8px;
  }
}

@media (max-width: 640px) {
  .app-shell {
    display: block;
    padding: 0;
  }

  .sidebar {
    position: static;
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    min-height: 58px;
    padding: 10px 14px;
    border-radius: 0;
  }

  .brand {
    flex: 0 0 auto;
    margin: 0 18px 0 0;
    font-size: 15px;
  }

  .navigation {
    flex: 1;
    flex-direction: row;
    gap: 4px;
    overflow-x: auto;
  }

  .nav-item {
    flex: 0 0 auto;
    padding: 7px 10px;
    font-size: 11px;
  }

  .account-area {
    display: flex;
    flex: 0 0 auto;
    padding: 0 0 0 10px;
    margin-top: 0;
    border-top: 0;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sidebar-locale {
    flex: 0 0 auto;
    margin: 0 9px 0 0;
  }

  .account-avatar {
    width: 27px;
    height: 27px;
  }

  .account-info {
    display: none;
  }

  .main-content {
    min-height: calc(100vh - 58px);
    border: 0;
    border-radius: 0;
  }
}
</style>
