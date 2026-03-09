// 地址管理页
import { getAddressList, deleteAddress } from '../../api/address'

const app = getApp()

Page({
  data: {
    addresses: [],
    isSelectionMode: false // 是否是选择模式（从订单确认页进入）
  },

  onLoad(options) {
    // 如果是从订单确认页过来，进入选择模式
    if (options.from === 'order') {
      this.setData({ isSelectionMode: true })
    }
  },

  onShow() {
    this.loadAddresses()
  },

  // 加载地址列表
  async loadAddresses() {
    try {
      const res = await getAddressList()
      if (res.code === 200) {
        this.setData({ addresses: res.data || [] })
      }
    } catch (error) {
      console.error('加载地址列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  // 选择地址
  selectAddress(e) {
    if (!this.data.isSelectionMode) return

    const address = e.currentTarget.dataset.item
    
    // 返回到订单确认页
    const pages = getCurrentPages()
    if (pages.length >= 2) {
      const prevPage = pages[pages.length - 2]
      if (prevPage.onAddressSelected) {
        prevPage.onAddressSelected(address)
      }
    }
    
    wx.navigateBack()
  },

  // 添加新地址
  addNewAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/address-edit'
    })
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/address-edit/address-edit?id=${id}`
    })
  },

  // 删除地址
  deleteAddress(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteAddress(id)
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadAddresses()
          } catch (error) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 阻止事件冒泡
  stopPropagation(e) {
    e.stopPropagation()
  }
})
