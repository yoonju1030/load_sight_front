import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import testPlan from './testPlan';
import run from './run';
import testStore from './test';
import auth from './auth';

export default createStore({
  modules: {
    auth,
    testPlan,
    run,
    testStore
  },
  plugins: [createPersistedState({
    paths: ['auth.isAuthenticated', 'auth.user', 'auth.token', 'testPlan.formPlan']
  })]
});
