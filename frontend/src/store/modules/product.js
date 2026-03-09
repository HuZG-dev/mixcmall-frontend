import { getProducts, getProductById, getCategories } from '@/api/product'

const state = {
  products: [],
  currentProduct: null,
  categories: [],
  total: 0,
  pageSize: 12,
  currentPage: 1
}

const mutations = {
  SET_PRODUCTS(state, { products, total }) {
    state.products = products
    state.total = total
  },
  SET_CURRENT_PRODUCT(state, product) {
    state.currentProduct = product
  },
  SET_CATEGORIES(state, categories) {
    state.categories = categories
  },
  SET_PAGE(state, page) {
    state.currentPage = page
  }
}

const actions = {
  async fetchProducts({ commit, state }, params = {}) {
    const res = await getProducts({
      page: state.currentPage,
      pageSize: state.pageSize,
      ...params
    })
    if (res.code === 200) {
      commit('SET_PRODUCTS', { products: res.data.list, total: res.data.total })
    }
    return res
  },
  async fetchProductDetail({ commit }, id) {
    const res = await getProductById(id)
    if (res.code === 200) {
      commit('SET_CURRENT_PRODUCT', res.data)
    }
    return res
  },
  async fetchCategories({ commit }) {
    const res = await getCategories()
    if (res.code === 200) {
      commit('SET_CATEGORIES', res.data)
    }
    return res
  },
  setPage({ commit }, page) {
    commit('SET_PAGE', page)
  }
}

const getters = {
  productList: state => state.products,
  productDetail: state => state.currentProduct
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
