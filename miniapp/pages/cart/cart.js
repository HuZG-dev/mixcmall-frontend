// 购物车页面
import { getCart, updateCart, deleteCartItem } from '../../api/cart'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    cartItems: [],
    totalPrice: 0
  },
  
  onLoad() {
    this.loadCart()
  },
  
  onShow() {
    this.loadCart()
  },
  
  // 加载购物车
  async loadCart() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({ cartItems: [], totalPrice: 0 })
      return
    }
    
    try {
      const res = await getCart()
      if (res.code === 200) {
        // 后端返回的数据格式：[{id, productId, name, image, price, quantity, stock, selected}]
        const cartItems = res.data.map(item => ({
          ...item,
          // 兼容两种数据格式：如果有 product 对象就用 product，否则直接用 item
          product: item.product ? {
            ...item.product,
            image: getImageUrl(item.product.image)
          } : {
            id: item.productId,
            name: item.name,
            image: getImageUrl(item.image),
            price: item.price,
            stock: item.stock
          }
        }))
        console.log('购物车数据:', cartItems)
        this.setData({ cartItems })
        this.calculateTotal()
      }
    } catch (error) {
      console.error('加载购物车失败:', error)
    }
  },
  
  // 计算总价
  calculateTotal() {
    const { cartItems } = this.data
    const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
    this.setData({ totalPrice })
  },
  
  // 增加数量
  async increaseQuantity(e) {
    const itemId = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems
    const item = cartItems.find(item => item.id === itemId)
    
    if (item) {
      const newQuantity = item.quantity + 1
      await this.updateQuantity(itemId, newQuantity)
    }
  },
  
  // 减少数量
  async decreaseQuantity(e) {
    const itemId = e.currentTarget.dataset.id
    const cartItems = this.data.cartItems
    const item = cartItems.find(item => item.id === itemId)
    
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1
      await this.updateQuantity(itemId, newQuantity)
    }
  },
  
  // 修改数量
  onQuantityChange(e) {
    const itemId = e.currentTarget.dataset.id
    const newQuantity = parseInt(e.detail.value) || 1
    this.updateQuantity(itemId, newQuantity)
  },
  
  // 更新数量
  async updateQuantity(itemId, quantity) {
    try {
      await updateCart(itemId, { quantity })
      this.loadCart()
    } catch (error) {
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      })
    }
  },
  
  // 删除商品
  async deleteItem(e) {
    const itemId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '删除商品',
      content: '确定要删除这个商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteCartItem(itemId)
            this.loadCart()
            wx.showToast({
              title: '已删除',
              icon: 'success'
            })
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
  
  // 去购物
  goToProducts() {
    wx.switchTab({
      url: '/pages/products/products'
    })
  },
  
  // 结算
  checkout() {
    const { cartItems } = this.data
    
    if (cartItems.length === 0) {
      wx.showToast({
        title: '购物车是空的',
        icon: 'none'
      })
      return
    }
    
    // 跳转到订单确认页
    wx.navigateTo({
      url: '/pages/order-confirm/order-confirm'
    })
  }
})