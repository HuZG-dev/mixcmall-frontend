// 购物车相关API
import request from '../utils/request'

// 获取购物车
export function getCart() {
  return request.get('/cart')
}

// 添加到购物车
export function addToCart(data) {
  return request.post('/cart', data)
}

// 更新购物车
export function updateCart(id, data) {
  return request.put(`/cart/${id}`, data)
}

// 删除购物车商品
export function deleteCartItem(id) {
  return request.delete(`/cart/${id}`)
}

// 清空购物车
export function clearCart() {
  return request.delete('/cart')
}