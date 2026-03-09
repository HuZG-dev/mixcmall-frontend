// 订单详情页
import { getOrderById } from '../../api/order'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    order: null,
    orderId: null
  },
  
  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id })
      this.loadOrderDetail()
    }
  },
  
  // 加载订单详情
  async loadOrderDetail() {
    try {
      const res = await getOrderById(this.data.orderId)
      if (res.code === 200) {
        // 处理商品图片路径
        const order = res.data
        if (order.items) {
          order.items = order.items.map(item => ({
            ...item,
            image: getImageUrl(item.image)
          }))
        }
        this.setData({ order })
      }
    } catch (error) {
      console.error('加载订单详情失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },
  
  // 获取订单状态文本
  getStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'paid': '待发货',
      'shipped': '待收货',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    return statusMap[status] || '未知状态'
  },
  
  // 支付订单
  async payOrder() {
    try {
      const { payOrder } = require('../../api/order')
      const res = await payOrder(this.data.orderId, 'wechat')
      if (res.code === 200) {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        this.loadOrderDetail()
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    }
  },
  
  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const { cancelOrder } = require('../../api/order')
            const result = await cancelOrder(this.data.orderId)
            if (result.code === 200) {
              wx.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              this.loadOrderDetail()
            }
          } catch (error) {
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },
  
  // 确认收货
  confirmReceipt() {
    wx.showModal({
      title: '确认收货',
      content: '确定已经收到商品了吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const { confirmOrder } = require('../../api/order')
            const result = await confirmOrder(this.data.orderId)
            if (result.code === 200) {
              wx.showToast({
                title: '收货成功',
                icon: 'success'
              })
              this.loadOrderDetail()
            }
          } catch (error) {
            wx.showToast({
              title: error.message || '确认失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },
  
  // 返回列表
  goBack() {
    wx.navigateBack()
  }
})
