import request from './request'

// 获取地址列表
export function getAddressList() {
  return request.get('/addresses')
}

// 获取地址详情
export function getAddressById(id) {
  return request.get(`/addresses/${id}`)
}

// 创建地址
export function createAddress(data) {
  return request.post('/addresses', data)
}

// 更新地址
export function updateAddress(id, data) {
  return request.put(`/addresses/${id}`, data)
}

// 删除地址
export function deleteAddress(id) {
  return request.delete(`/addresses/${id}`)
}

// 设置默认地址
export function setDefaultAddress(id) {
  return request.put(`/addresses/${id}/default`)
}
