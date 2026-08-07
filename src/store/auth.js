import { login, logout } from '../api/authApi';
import common from '../utils/common';

const state = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false
};

const mutations = {
  SET_SESSION(state, session) {
    state.isAuthenticated = true;
    state.user = session.user;
    state.token = session.token;
    common.setAuthToken(session.token);
  },
  CLEAR_SESSION(state) {
    state.isAuthenticated = false;
    state.user = null;
    state.token = null;
    common.setAuthToken(null);
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  }
};

const actions = {
  async login({ commit }, credentials) {
    commit('SET_LOADING', true);

    try {
      const session = await login(credentials);
      commit('SET_SESSION', session);
      return session;
    } finally {
      commit('SET_LOADING', false);
    }
  },
  async logout({ commit }) {
    commit('SET_LOADING', true);

    try {
      await logout();
    } finally {
      commit('CLEAR_SESSION');
      commit('SET_LOADING', false);
    }
  },
  restoreSession({ state }) {
    common.setAuthToken(state.token);
  }
};

const getters = {
  isAuthenticated: (state) => state.isAuthenticated,
  currentUser: (state) => state.user,
  isLoading: (state) => state.loading
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
};
