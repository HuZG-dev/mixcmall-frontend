// 用户相关API
import request from '../utils/request'

// 登录
export function login(data) {
  return request.post('/user/login', data)
}

// 注册
export function register(data) {
  return request.post('/user/register', data)
}

// 获取用户信息
export function getUserInfo() {
  return request.get('/user/info')
}

// 退出登录
export function logout() {
  return request.post('/user/logout')
}

// 修改用户信息
export function updateUserInfo(data) {
  return request.put('/user/info', data)
}

// 修改密码
export function updatePassword(data) {
  return request.put('/user/password', data)
}

// 上传头像
export function uploadAvatar(filePath) {
  return request.uploadFile('/user/avatar', filePath, 'avatar')
}