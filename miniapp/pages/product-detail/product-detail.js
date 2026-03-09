// 商品详情页
import { getProductById } from '../../api/product'
import { addToCart } from '../../api/cart'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    product: {},
    loading: true
  },
  
  onLoad(options) {
    const productId = options.id
    this.loadProductDetail(productId)
  },
  
  // 加载商品详情
  async loadProductDetail(productId) {
    try {
      const res = await getProductById(productId)
      if (res.code === 200) {
        let product = res.data
        // 处理图片路径
        product.image = getImageUrl(product.image)
        if (product.images) {
          product.images = product.images.map(image => getImageUrl(image))
        }
        this.setData({ 
          product,
          loading: false
        })
      }
    } catch (error) {
      console.error('加载商品详情失败:', error)
      this.setData({ loading: false })
    }
  },
  
  // 加入购物车
  async addToCart() {
    const { product } = this.data
    
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
    
    try {
      const res = await addToCart({
        productId: product.id,
        quantity: 1
      })
      
      if (res.code === 200) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success'
        })
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '加入购物车失败',
        icon: 'none'
      })
    }
  },
  
  // 立即购买
  buyNow() {
    const { product } = this.data
    
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
    
    // 跳转到订单确认页
    wx.navigateTo({
      url: `/pages/order-confirm/order-confirm?productId=${product.id}&quantity=1`
    })
  }
})