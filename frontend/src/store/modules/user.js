import { login, register, getUserInfo, logout } from '@/api/user'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
}

const actions = {
  async login({ commit }, loginData) {
    const res = await login(loginData)
    if (res.code === 200) {
      commit('SET_TOKEN', res.data.token)
      commit('SET_USER_INFO', res.data.user)
    }
    return res
  },
  async register({ commit }, registerData) {
    const res = await register(registerData)
    return res
  },
  async getUserInfo({ commit }) {
    const res = await getUserInfo()
    if (res.code === 200) {
      commit('SET_USER_INFO', res.data)
    }
    return res
  },
  async logout({ commit }) {
    try {
      await logout()
    } catch (error) {
      // 即使 API 调用失败，也要清除本地状态
      console.error('退出登录 API 调用失败:', error)
    } finally {
      // 无论成功与否，都清除本地用户信息
      commit('CLEAR_USER')
    }
  }
}

const getters = {
  isLoggedIn: state => !!state.token,
  username: state => (state.userInfo.nickname && state.userInfo.nickname.trim()) ? state.userInfo.nickname : '用户'
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
