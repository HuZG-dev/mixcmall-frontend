// 收货地址相关API
import request from '../utils/request'

// 获取地址列表
export function getAddressList() {
  return request.get('/addresses')
}

// 获取地址详情
export function getAddressDetail(id) {
  return request.get(`/addresses/${id}`)
}

// 添加地址
export function addAddress(data) {
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
