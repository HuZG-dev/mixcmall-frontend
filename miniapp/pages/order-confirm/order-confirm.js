// 订单确认页
import { getCart } from '../../api/cart'
import { createOrder } from '../../api/order'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    address: {},
    orderItems: [],
    subtotal: 0,
    shippingFee: 0,
    totalAmount: 0
  },
  
  onLoad(options) {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    
    if (options.productId) {
      // 从商品详情页过来
      this.loadProductDetail(options.productId, options.quantity)
    } else {
      // 从购物车过来
      this.loadCartItems()
    }
  },
  
  onShow() {
    // 重新加载地址（如果从地址选择页回来）
    this.loadDefaultAddress()
  },
  
  // 加载默认地址
  async loadDefaultAddress() {
    try {
      const { getAddressList } = require('../../api/address')
      const res = await getAddressList()
      if (res.code === 200 && res.data && res.data.length > 0) {
        // 找到默认地址
        const defaultAddress = res.data.find(addr => addr.isDefault) || res.data[0]
        this.setData({ 
          address: {
            id: defaultAddress.id,
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            address: `${defaultAddress.province}${defaultAddress.city}${defaultAddress.district}${defaultAddress.detail}`
          }
        })
      }
    } catch (error) {
      console.error('加载地址失败:', error)
    }
  },
  
  // 处理地址选择回调
  onAddressSelected(address) {
    this.setData({
      address: {
        id: address.id,
        name: address.name,
        phone: address.phone,
        address: `${address.province}${address.city}${address.district}${address.detail}`
      }
    })
  },
  
  // 加载商品详情
  async loadProductDetail(productId, quantity) {
    try {
      // 调用API获取商品详情
      const { getProductById } = require('../../api/product')
      const res = await getProductById(productId)
      if (res.code === 200) {
        let product = res.data
        // 处理图片路径
        product.image = getImageUrl(product.image)
        
        const orderItems = [{
          id: 1,
          product: product,
          quantity: parseInt(quantity) || 1
        }]
        
        this.setData({ orderItems })
        this.calculateAmount()
      }
    } catch (error) {
      console.error('加载商品详情失败:', error)
      wx.showToast({
        title: '加载商品详情失败',
        icon: 'none'
      })
    }
  },
  
  // 加载购物车商品
  async loadCartItems() {
    try {
      const res = await getCart()
      if (res.code === 200) {
        console.log('订单确认页 - 购物车原始数据:', res.data)
        
        // 统一数据格式为嵌套的 product 对象
        const orderItems = res.data.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            image: getImageUrl(item.product.image)
          } : {
            id: item.productId,
            name: item.name,
            image: getImageUrl(item.image),
            price: item.price,
            stock: item.stock
          },
          quantity: item.quantity || 1
        }))
        
        console.log('订单确认页 - 转换后的数据:', orderItems)
        this.setData({ orderItems })
        this.calculateAmount()
      }
    } catch (error) {
      console.error('加载购物车失败:', error)
      wx.showToast({
        title: '加载购物车失败',
        icon: 'none'
      })
    }
  },
  
  // 计算金额
  calculateAmount() {
    const { orderItems } = this.data
    const subtotal = orderItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
    const shippingFee = subtotal >= 99 ? 0 : 10
    const totalAmount = subtotal + shippingFee
    
    this.setData({ subtotal, shippingFee, totalAmount })
  },
  
  // 选择地址
  selectAddress() {
    wx.navigateTo({
      url: '/pages/address-manage/address-manage?from=order'
    })
  },
  
  // 提交订单
  async submitOrder() {
    const { orderItems, address, totalAmount } = this.data
    
    if (!address.name) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }
    
    if (orderItems.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    
    try {
      console.log('提交订单 - 商品信息:', orderItems)
      
      const res = await createOrder({
        items: orderItems.map(item => ({
          productId: item.product?.id || item.productId,
          quantity: item.quantity || 1
        })),
        addressId: address.id || 1,
        totalAmount
      })
      
      console.log('创建订单响应:', res)
      
      if (res.code === 200) {
        wx.showToast({
          title: '订单创建成功',
          icon: 'success'
        })
        
        // 清空购物车中已购买的商品
        this.clearCartItems(orderItems)
        
        // 跳转到订单详情页
        wx.navigateTo({
          url: `/pages/order-detail/order-detail?id=${res.data.id}`
        })
      } else {
        wx.showToast({
          title: res.message || '订单创建失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('提交订单失败:', error)
      wx.showToast({
        title: error.message || '订单创建失败',
        icon: 'none'
      })
    }
  },
  
  // 清空购物车中已购买的商品
  async clearCartItems(orderItems) {
    try {
      const { deleteCartItem } = require('../../api/cart')
      // 遍历订单商品，从购物车中移除
      for (const item of orderItems) {
        if (item.id) {
          await deleteCartItem(item.id)
        }
      }
    } catch (error) {
      console.error('清空购物车失败:', error)
    }
  }
})