import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import cart from './modules/cart'
import product from './modules/product'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading: false
  },
  mutations: {
    SET_LOADING(state, status) {
      state.loading = status
    }
  },
  actions: {
    setLoading({ commit }, status) {
      commit('SET_LOADING', status)
    }
  },
  modules: {
    user,
    cart,
    product
  }
})
