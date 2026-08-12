import { getDashboardSummary, getRunHistory, getRunDetails, getRunComparison } from '../api/runApi';

const state = {
  dashboardSummary: null,
  runHistory: [],
  pagination: {
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  },
  currentRun: null,
  comparison: null,
  loading: false
};

const mutations = {
  SET_DASHBOARD_SUMMARY(state, summary) {
    state.dashboardSummary = summary;
  },
  SET_RUN_HISTORY(state, history) {
    state.runHistory = history;
  },
  SET_PAGINATION(state, pagination) {
    state.pagination = { ...state.pagination, ...pagination };
  },
  SET_CURRENT_RUN(state, run) {
    state.currentRun = run;
  },
  SET_COMPARISON(state, comparison) {
    state.comparison = comparison;
  },
  SET_LOADING(state, status) {
    state.loading = status;
  }
};

const actions = {
  async fetchDashboardSummary({ commit }) {
    try {
      const data = await getDashboardSummary();
      commit('SET_DASHBOARD_SUMMARY', data);
    } catch (e) {
      console.error(e);
    }
  },
  async fetchRunHistory({ commit }, params = {}) {
    commit('SET_LOADING', true);
    try {
      const data = await getRunHistory(params);
      const content = Array.isArray(data) ? data : data?.content || [];
      commit('SET_RUN_HISTORY', content);
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
  async fetchRunDetails({ commit }, runId) {
    commit('SET_LOADING', true);
    try {
      const data = await getRunDetails(runId);
      commit('SET_CURRENT_RUN', data);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async fetchComparison({ commit }, { baseRunId, compareRunId }) {
    commit('SET_LOADING', true);
    try {
      const data = await getRunComparison(baseRunId, compareRunId);
      commit('SET_COMPARISON', data);
    } finally {
      commit('SET_LOADING', false);
    }
  }
};

const getters = {
  dashboardSummary: (state) => state.dashboardSummary,
  runHistory: (state) => state.runHistory,
  pagination: (state) => state.pagination,
  currentRun: (state) => state.currentRun,
  comparison: (state) => state.comparison,
  isLoading: (state) => state.loading
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
