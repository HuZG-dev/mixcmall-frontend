import request from './request'

// 获取商品列表
export function getProducts(params) {
  return request.get('/products', { params })
}

// 获取商品详情
export function getProductById(id) {
  return request.get(`/products/${id}`)
}

// 获取商品分类
export function getCategories() {
  return request.get('/categories')
}

// 搜索商品
export function searchProducts(keyword) {
  return request.get('/products/search', { params: { keyword } })
}

// 获取热门商品
export function getHotProducts() {
  return request.get('/products/list/hot')
}

// 获取推荐商品
export function getRecommendProducts() {
  return request.get('/products/list/recommend')
}
