import request from './request'

export function getAdmins(params) {
  return request.get('/admin/admins', { params })
}

export function addAdmin(data) {
  return request.post('/admin/admins', data)
}

export function updateAdmin(id, data) {
  return request.put(`/admin/admins/${id}`, data)
}

export function deleteAdmin(id) {
  return request.delete(`/admin/admins/${id}`)
}

export function resetAdminPassword(id, data) {
  return request.put(`/admin/admins/${id}/password`, data)
}
