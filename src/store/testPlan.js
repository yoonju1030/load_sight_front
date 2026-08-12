import { getTestPlans, getTestPlanById, createTestPlan, updateTestPlan } from '../api/testPlanApi';

const state = {
  plans: [],
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  },
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
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
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
  async fetchPlans({ commit }, params = {}) {
    commit('SET_LOADING', true);
    try {
      const data = await getTestPlans(params);
      const content = Array.isArray(data) ? data : data?.content || [];
      commit('SET_PLANS', content);
      commit('SET_PAGINATION', {
        page: data?.page ?? params.page ?? 0,
        size: data?.size ?? params.size ?? 10,
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? (content.length ? 1 : 0)
      });
      return data;
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
  pagination: (state) => state.pagination,
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
