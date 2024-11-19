// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        isAuthenticated: !!localStorage.getItem('token'),
        loginError: null,
    },
    mutations: {
        setToken(state, token) {
            state.token = token;
            state.isAuthenticated = true;
            localStorage.setItem('token', token);
        },
        setUser(state, user) {
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user));
        },
        setLoginError(state, error) {
            state.loginError = error;
        },
        logout(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            state.loginError = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
    actions: {
        async login({ commit }, { email, password }) {
            try {
                const response = await axios.post('/api/auth/login', { email, password });
                const { token, ...user } = response.data;
                commit('setToken', token);
                commit('setUser', user);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                commit('setLoginError', null);
            } catch (error) {
                commit('setLoginError', '登入失敗，請檢查帳號或密碼');
            }
        },
        logout({ commit }) {
            commit('logout');
            delete axios.defaults.headers.common['Authorization'];
        },
    },
});
