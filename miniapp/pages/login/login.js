// 登录页面
const app = getApp()
import { login } from '../../api/user'

Page({
  data: {
    username: '',
    password: '',
    loading: false
  },
  
  // 用户名输入
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },
  
  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },
  
  // 登录
  async login() {
    const { username, password } = this.data
    
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      const res = await login({ username, password })
      if (res.code === 200) {
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.token)
        wx.setStorageSync('userInfo', res.data.user)
        
        // 更新全局数据
        app.globalData.userInfo = res.data.user
        app.globalData.isLogin = true
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
})