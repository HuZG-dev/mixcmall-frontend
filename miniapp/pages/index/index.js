// 首页
import { getHotProducts, getRecommendProducts, getCategories } from '../../api/product'
import { getImageUrl } from '../../utils/image'
import { elementIconToEmoji } from '../../utils/iconMapper'

Page({
  data: {
    banners: [
      { id: 1, title: '新品上市', subtitle: '品质生活，从这里开始', image: 'http://localhost:8080/uploads/banners/hyzx.jpg' },
      { id: 2, title: '限时特惠', subtitle: '超值好物，不容错过', image: 'http://localhost:8080/uploads/banners/xpss.jpg' },
      { id: 3, title: '会员专享', subtitle: '专属优惠，尊享服务', image: 'http://localhost:8080/uploads/banners/xsth.jpg' }
    ],
    categories: [],
    hotProducts: [],
    recommendProducts: [],
    searchKeyword: ''
  },
  
  onLoad() {
    this.loadData()
  },
  
  // 加载数据
  async loadData() {
    try {
      // 并行请求数据
      const [hotRes, recommendRes, categoryRes] = await Promise.all([
        getHotProducts(),
        getRecommendProducts(),
        getCategories()
      ])
      
      // 处理轮播图图片路径
      const banners = this.data.banners.map(banner => ({
        ...banner,
        image: getImageUrl(banner.image)
      }))
      this.setData({ banners })
      
      if (hotRes.code === 200) {
        const hotProducts = hotRes.data.map(product => ({
          ...product,
          image: getImageUrl(product.image)
        }))
        this.setData({ hotProducts })
      }
      
      if (recommendRes.code === 200) {
        const recommendProducts = recommendRes.data.map(product => ({
          ...product,
          image: getImageUrl(product.image)
        }))
        this.setData({ recommendProducts })
      }
      
      if (categoryRes.code === 200) {
        console.log('分类数据:', categoryRes.data)
        // 处理分类图标：根据分类名称匹配SVG图标
        const categories = categoryRes.data.map(cat => {
          // 生成SVG图标路径
          const iconMap = {
            '手机数码': '/uploads/categories/phone.svg',
            '电脑用品': '/uploads/categories/computer.svg',
            '家用电器': '/uploads/categories/appliance.svg',
            '品牌鞋包': '/uploads/categories/bag.svg',
            '美妆护肤': '/uploads/categories/beauty.svg',
            '食品生鲜': '/uploads/categories/food.svg',
            '医药用品': '/uploads/categories/medicine.svg',
            '运动户外': '/uploads/categories/sports.svg'
          }
          
          let iconPath = iconMap[cat.name] || ''
          // 直接生成完整的图片URL
          if (iconPath) {
            iconPath = getImageUrl(iconPath)
          }
          console.log('分类:', cat.name, '图标路径:', iconPath)
          return {
            ...cat,
            icon: iconPath,
            _displayIcon: iconPath ? null : this.convertElementIcon(cat.icon)
          }
        })
        console.log('处理后的分类数据:', categories)
        this.setData({ categories })
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  },
  
  // Element UI 图标转 emoji
  convertElementIcon(iconName) {
    if (!iconName) return '📦'
    
    // 如果是 emoji（长度较短）
    if (iconName.length <= 4 && !iconName.startsWith('el-icon-')) {
      return iconName
    }
    
    // 如果是图片 URL
    if (iconName.startsWith('http')) {
      return null // WXML 中会直接用 image 显示
    }
    
    // Element UI 图标转 emoji
    return elementIconToEmoji[iconName] || '📦'
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },
  
  // 搜索
  search() {
    const { searchKeyword } = this.data
    if (searchKeyword) {
      // 确保全局对象存在
      const app = getApp()
      if (!app.globalData) {
        app.globalData = {}
      }
      // 清除之前的搜索关键词和分类ID
      delete app.globalData.searchKeyword
      delete app.globalData.selectedCategoryId
      // 设置新的搜索关键词
      app.globalData.searchKeyword = searchKeyword
      app.globalData.selectedCategoryId = 0 // 搜索时显示全部分类
      console.log('设置全局搜索关键词:', searchKeyword)
      console.log('设置全局分类 ID: 0')
      
      // 清除搜索框内容
      this.setData({ searchKeyword: '' })
      console.log('已清除首页搜索框内容')
      
      // 使用 switchTab 跳转到商品页
      wx.switchTab({
        url: '/pages/products/products',
        success: () => {
          console.log('跳转成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
        }
      })
    }
  },
  
  // 跳转到分类（商品列表页是 tabBar 页面，需要用 switchTab）
  goToCategory(e) {
    console.log('========== 分类点击 ==========')
    const categoryId = e.currentTarget.dataset.id
    console.log('获取到的分类 ID:', categoryId)
    
    if (!categoryId) {
      console.error('错误：分类 ID 为空!')
      wx.showToast({
        title: '分类数据异常',
        icon: 'none'
      })
      return
    }
    
    // 确保全局对象存在
    const app = getApp()
    if (!app.globalData) {
      app.globalData = {}
    }
    // 清除之前的搜索关键词和分类ID
    delete app.globalData.searchKeyword
    delete app.globalData.selectedCategoryId
    // 设置新的分类ID
    app.globalData.selectedCategoryId = categoryId
    console.log('已设置全局参数 selectedCategoryId:', categoryId)
    
    // 方法 2: 通过本地存储传递参数（备选）
    wx.setStorageSync('selectedCategoryId', categoryId)
    
    // 使用 switchTab 跳转到 tabBar 页面
    wx.switchTab({
      url: '/pages/products/products',
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        })
      }
    })
  },
  
  // 跳转到商品列表
  goToProducts() {
    wx.switchTab({
      url: '/pages/products/products'
    })
  },
  
  // 跳转到商品详情
  goToProductDetail(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    })
  },
  
  // 获取图片URL
  getImagePath(imagePath) {
    return getImageUrl(imagePath)
  }
})