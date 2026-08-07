import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import store from "./store/index";
import i18n from './i18n';

loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(i18n)
  .use(vuetify)
  .mount('#app')
