// 个人信息编辑页
const app = getApp()
import { getUserInfo, updateUserInfo, uploadAvatar } from '../../api/user'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    formData: {
      username: '',
      nickname: '',
      phone: '',
      email: '',
      avatar: '',
      gender: 'secret'
    },
    loading: false
  },
  
  onLoad() {
    // 加载用户信息
    this.loadUserInfo()
  },
  
  // 加载用户信息
  async loadUserInfo() {
    try {
      const res = await getUserInfo()
      if (res.code === 200) {
        const userInfo = res.data
        // 处理头像路径
        userInfo.avatar = userInfo.avatar ? getImageUrl(userInfo.avatar) : ''
        this.setData({
          formData: userInfo
        })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },
  
  // 上传头像
  uploadAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePaths = res.tempFilePaths
        
        try {
          const uploadRes = await uploadAvatar(tempFilePaths[0])
          if (uploadRes.code === 200) {
            // 处理头像路径
            const avatarUrl = getImageUrl(uploadRes.data.avatar)
            this.setData({
              'formData.avatar': avatarUrl
            })
            wx.showToast({
              title: '头像上传成功',
              icon: 'success'
            })
          }
        } catch (error) {
          console.error('上传头像失败:', error)
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        }
      }
    })
  },
  
  // 提交表单
  async submitForm(e) {
    const formData = e.detail.value
    
    // 合并数据
    const updateData = {
      ...formData,
      avatar: this.data.formData.avatar
    }
    
    this.setData({ loading: true })
    
    try {
      const res = await updateUserInfo(updateData)
      if (res.code === 200) {
        // 更新本地存储的用户信息
        const updatedUserInfo = res.data
        updatedUserInfo.avatar = getImageUrl(updatedUserInfo.avatar)
        wx.setStorageSync('userInfo', updatedUserInfo)
        
        // 更新全局数据
        app.globalData.userInfo = updatedUserInfo
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      }
    } catch (error) {
      console.error('保存失败:', error)
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})