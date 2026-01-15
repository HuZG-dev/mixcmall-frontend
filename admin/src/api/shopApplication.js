import request from '@/api/request'

export function getShopApplications(params) {
  return request({
    url: '/admin/shop-applications',
    method: 'get',
    params
  })
}

export function getMyShopApplications() {
  return request({
    url: '/admin/shop-applications/my',
    method: 'get'
  })
}

export function submitShopApplication(data) {
  return request({
    url: '/admin/shop-applications',
    method: 'post',
    data
  })
}

export function submitCloseShopApplication(data) {
  return request({
    url: '/admin/shop-applications/close-shop',
    method: 'post',
    data
  })
}

export function approveShopApplication(id) {
  return request({
    url: `/admin/shop-applications/${id}/approve`,
    method: 'put'
  })
}

export function approveCloseShopApplication(id) {
  return request({
    url: `/admin/shop-applications/${id}/approve-close`,
    method: 'put'
  })
}

export function rejectShopApplication(id, data) {
  return request({
    url: `/admin/shop-applications/${id}/reject`,
    method: 'put',
    data
  })
}

export function deleteShopApplication(id) {
  return request({
    url: `/admin/shop-applications/${id}`,
    method: 'delete'
  })
}
