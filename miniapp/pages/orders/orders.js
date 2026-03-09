// 订单列表页
import { getOrders, cancelOrder, payOrder, confirmOrder } from '../../api/order'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    orders: [],
    activeStatus: 0,
    loading: false
  },
  
  onLoad() {
    this.loadOrders()
  },
  
  onShow() {
    this.loadOrders()
  },
  
  // 加载订单
  async loadOrders() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({ orders: [] })
      return
    }
    
    this.setData({ loading: true })
    
    try {
      const params = {}
      if (this.data.activeStatus > 0) {
        // 映射状态码
        const statusMap = {
          1: 'pending',
          2: 'paid',
          3: 'shipped',
          4: 'completed',
          5: 'cancelled'
        }
        params.status = statusMap[this.data.activeStatus]
      }
      
      const res = await getOrders(params)
      if (res.code === 200) {
        // 处理订单数据
        const orders = (res.data.list || []).map(order => ({
          ...order,
          // 处理商品图片路径
          items: (order.items || []).map(item => ({
            ...item,
            image: getImageUrl(item.image)
          }))
        }))
        this.setData({ orders })
      }
    } catch (error) {
      console.error('加载订单失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },
  
  // 切换订单状态
  switchStatus(e) {
    const status = parseInt(e.currentTarget.dataset.status)
    this.setData({ activeStatus: status })
    this.loadOrders()
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
  async payOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    try {
      const res = await payOrder(orderId, 'wechat')
      if (res.code === 200) {
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        this.loadOrders()
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    }
  },
  
  // 取消订单
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await cancelOrder(orderId)
            if (result.code === 200) {
              wx.showToast({
                title: '订单已取消',
                icon: 'success'
              })
              this.loadOrders()
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
  async confirmReceipt(e) {
    const orderId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认收货',
      content: '确定已经收到商品了吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await confirmOrder(orderId)
            if (result.code === 200) {
              wx.showToast({
                title: '收货成功',
                icon: 'success'
              })
              this.loadOrders()
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
  
  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order-detail/order-detail?id=${orderId}`
    })
  },
  
  // 去购物
  goToProducts() {
    wx.switchTab({
      url: '/pages/products/products'
    })
  }
})