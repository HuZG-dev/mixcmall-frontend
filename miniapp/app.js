App({
  onLaunch: function() {
    // 小程序启动时执行
    console.log('小程序启动')
    // 检查登录状态
    this.checkLoginStatus()
  },
  checkLoginStatus: function() {
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token是否有效
      this.getUserInfo()
    }
  },
  getUserInfo: function() {
    const token = wx.getStorageSync('token')
    if (token) {
      wx.request({
        url: `${this.globalData.baseUrl}/user/info`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.globalData.userInfo = res.data.data
            this.globalData.isLogin = true
          } else {
            // token 无效，清除登录状态
            this.logout()
          }
        },
        fail: () => {
          this.logout()
        }
      })
    }
  },
  logout: function() {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    this.globalData.userInfo = null
    this.globalData.isLogin = false
  },
  globalData: {
    userInfo: null,
    isLogin: false,
    baseUrl: 'http://localhost:8080/api'
  }
})