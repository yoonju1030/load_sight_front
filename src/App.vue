<template>
  <v-app>
    <div class="app-shell">
      <aside class="sidebar" aria-label="주요 메뉴">
        <router-link to="/" class="brand">LoadSight</router-link>

        <nav class="navigation">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-item"
            :class="{ 'nav-item--active': isActive(item) }"
          >
            {{ item.title }}
          </router-link>
        </nav>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      navItems: [
        { title: '대시보드', to: '/' },
        { title: '테스트 플랜', to: '/test-plans' },
        { title: '실행 이력', to: '/runs' },
        { title: '결과 비교', to: '/compare' }
      ]
    };
  },
  methods: {
    isActive(item) {
      if (item.to === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(item.to);
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
  height: calc(100vh - 6px);
  padding: 15px 10px;
  overflow-y: auto;
  color: #ffffff;
  background: #111827;
  border-radius: 14px 0 0 0;
}

.brand {
  display: inline-block;
  margin: 0 0 16px 1px;
  color: #f8fafc;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
  text-decoration: none;
  letter-spacing: -0.35px;
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
  font-size: 9px;
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

  .nav-item {
    min-height: 38px;
    padding: 10px 13px;
    font-size: 13px;
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

  .main-content {
    min-height: calc(100vh - 58px);
    border: 0;
    border-radius: 0;
  }
}
</style>
