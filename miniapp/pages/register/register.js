// 注册页面
import { register } from '../../api/user'

Page({
  data: {
    username: '',
    password: '',
    confirmPassword: '',
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
  
  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    })
  },
  
  // 注册
  async register() {
    const { username, password, confirmPassword } = this.data
    
    if (!username || !password || !confirmPassword) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }
    
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      const res = await register({ username, password })
      if (res.code === 200) {
        wx.showToast({
          title: '注册成功',
          icon: 'success'
        })
        
        // 跳转到登录页面
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '注册失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})