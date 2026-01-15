import request from './request'

export function getShops(params) {
  return request.get('/admin/shops', { params })
}

export function getAllShops() {
  return request.get('/admin/shops/all')
}

export function getMyShops() {
  return request.get('/admin/shops/my')
}

export function addShop(data) {
  return request.post('/admin/shops', data)
}

export function updateShop(id, data) {
  return request.put(`/admin/shops/${id}`, data)
}

export function deleteShop(id) {
  return request.delete(`/admin/shops/${id}`)
}

export function uploadShopImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  return request.post('/admin/shops/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
