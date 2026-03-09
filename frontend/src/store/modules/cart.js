import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@/api/cart'

const state = {
  cartItems: [],
  cartTotal: 0
}

const mutations = {
  SET_CART(state, items) {
    state.cartItems = items
    state.cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
  CLEAR_CART(state) {
    state.cartItems = []
    state.cartTotal = 0
  }
}

const actions = {
  async getCart({ commit }) {
    const res = await getCart()
    if (res.code === 200) {
      commit('SET_CART', res.data)
    }
    return res
  },
  async addToCart({ dispatch }, { productId, quantity }) {
    const res = await addToCart(productId, quantity)
    if (res.code === 200) {
      await dispatch('getCart')
    }
    return res
  },
  async updateQuantity({ dispatch }, { cartItemId, quantity }) {
    const res = await updateCartItem(cartItemId, quantity)
    if (res.code === 200) {
      await dispatch('getCart')
    }
    return res
  },
  async removeItem({ dispatch }, cartItemId) {
    const res = await removeFromCart(cartItemId)
    if (res.code === 200) {
      await dispatch('getCart')
    }
    return res
  },
  async clearCart({ commit }) {
    const res = await clearCart()
    if (res.code === 200) {
      commit('CLEAR_CART')
    }
    return res
  }
}

const getters = {
  cartCount: state => state.cartItems.reduce((count, item) => count + item.quantity, 0),
  cartTotal: state => state.cartTotal.toFixed(2)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
