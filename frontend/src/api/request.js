import axios from 'axios'
import Vue from 'vue'
import router from '@/router'

const Message = Vue.prototype.$message

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    console.log('请求拦截器 - token:', token)
    console.log('请求URL:', config.url)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('请求拦截器 - Authorization:', config.headers.Authorization)
    } else {
      console.log('请求拦截器 - 没有token')
    }
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (!res) {
      Message.error('请求失败：返回数据为空')
      return Promise.reject(new Error('请求失败：返回数据为空'))
    }
    if (res.code !== 200) {
      Message.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应拦截器错误:', error)
    Message.error(error && error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
