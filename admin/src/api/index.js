import request from './request'

// 商品列表
export function getProducts(params) {
  return request.get('/admin/products', { params })
}

// 添加商品
export function addProduct(data) {
  return request.post('/admin/products', data)
}

// 更新商品
export function updateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

// 删除商品
export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

// 订单列表
export function getOrders(params) {
  return request.get('/admin/orders', { params })
}

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request.put(`/admin/orders/${id}/status`, { status })
}

// 用户列表
export function getUsers(params) {
  return request.get('/admin/users', { params })
}

// 更新用户状态
export function updateUserStatus(id, status) {
  return request.put(`/admin/users/${id}/status`, { status })
}

// 分类列表
export function getCategories() {
  return request.get('/categories')
}

// 添加分类
export function addCategory(data) {
  return request.post('/categories', data)
}

// 更新分类
export function updateCategory(id, data) {
  return request.put(`/categories/${id}`, data)
}

// 删除分类
export function deleteCategory(id) {
  return request.delete(`/categories/${id}`)
}

// 统计数据
export function getDashboardStats() {
  return request.get('/admin/stats')
}

// 管理员登录
export function adminLogin(data) {
  return request.post('/admin/login', data)
}

// 上传图片
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
