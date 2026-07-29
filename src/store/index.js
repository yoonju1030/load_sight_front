import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import testPlan from './testPlan';
import run from './run';
import testStore from './test';

export default createStore({
  modules: {
    testPlan,
    run,
    testStore
  },
  plugins: [createPersistedState({
    paths: ['testPlan.formPlan']
  })]
});