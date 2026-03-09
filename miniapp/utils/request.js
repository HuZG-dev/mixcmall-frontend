// 网络请求工具类
const app = getApp()

/**
 * 网络请求
 * @param {string} url - 请求地址
 * @param {object} options - 请求选项
 */
function request(url, options = {}) {
  // 动态获取基础URL
  const baseUrl = app.globalData.baseUrl
  // 拼接完整URL
  const fullUrl = baseUrl + url
  
  // 默认选项
  const defaultOptions = {
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    timeout: 10000
  }
  
  // 合并选项
  const opts = {
    ...defaultOptions,
    ...options
  }
  
  // 添加token
  const token = wx.getStorageSync('token')
  if (token) {
    opts.header.Authorization = `Bearer ${token}`
  }
  
  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      ...opts,
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data
          if (data.code === 200) {
            resolve(data)
          } else {
            // 错误处理
            if (data.code === 401) {
              // 登录过期
              app.logout()
              wx.navigateTo({ url: '/pages/login/login' })
            }
            reject(data)
          }
        } else {
          reject({ code: res.statusCode, message: '网络错误' })
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject({ code: 500, message: '网络请求失败' })
      }
    })
  })
}

// GET请求
export function get(url, params = {}) {
  return request(url, {
    method: 'GET',
    data: params
  })
}

// POST请求
export function post(url, data = {}) {
  return request(url, {
    method: 'POST',
    data
  })
}

// PUT请求
export function put(url, data = {}) {
  return request(url, {
    method: 'PUT',
    data
  })
}

// DELETE请求
export function del(url) {
  return request(url, {
    method: 'DELETE'
  })
}

// 上传文件
export function uploadFile(url, filePath, name, formData = {}) {
  const token = wx.getStorageSync('token')
  const baseUrl = app.globalData.baseUrl
  
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: baseUrl + url,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data)
        } else {
          reject(data)
        }
      },
      fail: (err) => {
        reject({ code: 500, message: '上传失败' })
      }
    })
  })
}

export default {
  get,
  post,
  put,
  delete: del,
  uploadFile
}