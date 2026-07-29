import { getTestPlans, getTestPlanById, createTestPlan, updateTestPlan } from '../api/testPlanApi';

const state = {
  plans: [],
  currentPlan: null,
  formPlan: {
    name: '',
    description: '',
    method: 'POST',
    url: 'https://api.loadsight.com/v1/signup',
    tags: ['auth', 'signup'],
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    queryParams: [],
    body: '{\n  "username": "user123",\n  "email": "user@example.com"\n}',
    vusers: 200,
    targetRps: 1000,
    durationMinutes: 10,
    rampUpSeconds: 60,
    passSuccessRate: 95,
    passP95Latency: 800
  },
  loading: false
};

const mutations = {
  SET_PLANS(state, plans) {
    state.plans = plans;
  },
  SET_CURRENT_PLAN(state, plan) {
    state.currentPlan = plan;
  },
  UPDATE_FORM_PLAN(state, payload) {
    state.formPlan = { ...state.formPlan, ...payload };
  },
  SET_LOADING(state, status) {
    state.loading = status;
  }
};

const actions = {
  async fetchPlans({ commit }) {
    commit('SET_LOADING', true);
    try {
      const data = await getTestPlans();
      commit('SET_PLANS', data);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchPlanById({ commit }, id) {
    commit('SET_LOADING', true);
    try {
      const data = await getTestPlanById(id);
      commit('SET_CURRENT_PLAN', data);
      commit('UPDATE_FORM_PLAN', data);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async savePlan({ state, commit }, isEdit = false) {
    commit('SET_LOADING', true);
    try {
      if (isEdit && state.currentPlan?.id) {
        return await updateTestPlan(state.currentPlan.id, state.formPlan);
      } else {
        return await createTestPlan(state.formPlan);
      }
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const getters = {
  plans: (state) => state.plans,
  currentPlan: (state) => state.currentPlan,
  formPlan: (state) => state.formPlan,
  isLoading: (state) => state.loading
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
