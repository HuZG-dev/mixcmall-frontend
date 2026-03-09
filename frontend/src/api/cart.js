import request from './request'

// 获取购物车
export function getCart() {
  return request.get('/cart')
}

// 添加到购物车
export function addToCart(productId, quantity = 1) {
  return request.post('/cart', { productId, quantity })
}

// 更新购物车商品数量
export function updateCartItem(cartItemId, quantity) {
  return request.put(`/cart/${cartItemId}`, { quantity })
}

// 删除购物车商品
export function removeFromCart(cartItemId) {
  return request.delete(`/cart/${cartItemId}`)
}

// 清空购物车
export function clearCart() {
  return request.delete('/cart')
}

// 选中/取消选中购物车商品
export function toggleCartItem(cartItemId, selected) {
  return request.put(`/cart/${cartItemId}/select`, { selected })
}
