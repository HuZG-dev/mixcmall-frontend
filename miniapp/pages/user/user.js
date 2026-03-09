// 我的页面
const app = getApp()
import { getUserInfo, logout } from '../../api/user'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    userInfo: null
  },
  
  onLoad() {
    this.checkLoginStatus()
  },
  
  onShow() {
    this.checkLoginStatus()
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 处理头像路径
      const processedUserInfo = {
        ...userInfo,
        avatar: userInfo.avatar ? getImageUrl(userInfo.avatar) : ''
      }
      this.setData({ userInfo: processedUserInfo })
    } else {
      this.setData({ userInfo: null })
    }
  },
  
  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },
  
  // 跳转到订单页面
  goToOrders() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  },
  
  // 跳转到地址管理
  goToAddress() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/address-manage/address-manage'
    })
  },
  
  // 跳转到修改个人信息页面
  goToEditProfile() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    })
  },
  
  // 跳转到收藏
  goToFavorites() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  
  // 跳转到设置
  goToSettings() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },
  
  // 退出登录
  async logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await logout()
          } catch (error) {
            console.error('退出登录失败:', error)
          } finally {
            // 清除本地存储
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            
            // 更新全局数据
            app.globalData.userInfo = null
            app.globalData.isLogin = false
            
            // 更新页面数据
            this.setData({ userInfo: null })
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          }
        }
      }
    })
  }
})