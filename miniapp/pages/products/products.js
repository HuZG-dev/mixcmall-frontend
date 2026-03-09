// 商品列表页
import { getProducts, searchProducts, getCategories } from '../../api/product'
import { getImageUrl } from '../../utils/image'

Page({
  data: {
    products: [],
    categories: [],
    activeCategory: 0,
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    sortPrice: 'asc',
    sortSales: false,
    keyword: ''
  },
  
  onLoad(options) {
    console.log('========== 商品列表页加载 ==========')
    console.log('接收到的 URL 参数:', options)
    
    let categoryId = null
    let keyword = ''
    
    // 从 URL 参数获取搜索关键词
    if (options.keyword) {
      console.log('从 URL 获取搜索关键词:', options.keyword)
      keyword = options.keyword
    }
    
    // 方式 1: 从 URL 参数获取（如果是普通页面跳转）
    if (options.categoryId) {
      console.log('从 URL 获取分类 ID:', options.categoryId)
      categoryId = parseInt(options.categoryId)
    }
    
    // 处理全局参数
    this.handleGlobalParams(categoryId, keyword)
  },
  
  onShow() {
    console.log('========== 商品列表页显示 ==========')
    // 处理全局参数
    this.handleGlobalParams(null, '')
  },
  
  // 处理全局参数
  handleGlobalParams(categoryId, keyword) {
    // 方式 2: 从全局对象获取（如果是 switchTab 跳转）
    const app = getApp()
    
    // 确保全局对象存在
    if (app.globalData) {
      // 先处理搜索关键词，因为搜索优先级高于分类
      if (app.globalData.searchKeyword) {
        console.log('从全局对象获取搜索关键词:', app.globalData.searchKeyword)
        keyword = app.globalData.searchKeyword
        // 清除全局参数，避免重复使用
        delete app.globalData.searchKeyword
        // 搜索时显示全部分类
        categoryId = 0
      }
      
      // 处理分类 ID
      if (app.globalData.selectedCategoryId !== undefined) {
        console.log('从全局对象获取分类 ID:', app.globalData.selectedCategoryId)
        categoryId = parseInt(app.globalData.selectedCategoryId)
        // 清除全局参数，避免重复使用
        delete app.globalData.selectedCategoryId
      }
    }
    
    // 方式 3: 从本地存储获取（备选方案）
    if (categoryId === null) {
      const storedCategoryId = wx.getStorageSync('selectedCategoryId')
      if (storedCategoryId) {
        console.log('从本地存储获取分类 ID:', storedCategoryId)
        categoryId = parseInt(storedCategoryId)
        wx.removeStorageSync('selectedCategoryId')
      }
    }
    
    // 检查是否需要更新数据
    const shouldUpdate = categoryId !== null || keyword !== ''
    
    // 首次加载时，即使没有参数也需要加载商品
    const isInitialLoad = this.data.products.length === 0
    
    if (shouldUpdate || isInitialLoad) {
      // 先设置所有数据，然后再加载商品
      const newData = {
        page: 1,
        products: []
      }
      
      // 设置分类
      if (categoryId !== null) {
        console.log('设置 activeCategory:', categoryId)
        newData.activeCategory = categoryId
      } else {
        console.log('未指定分类，显示全部商品')
      }
      
      // 设置搜索关键词
      if (keyword) {
        console.log('设置搜索关键词:', keyword)
        newData.keyword = keyword
      }
      
      // 一次性设置所有数据
      this.setData(newData)
      
      console.log('当前 activeCategory:', this.data.activeCategory)
      console.log('当前 keyword:', this.data.keyword)
      
      // 加载分类数据
      this.loadCategories()
      // 加载商品数据
      this.loadProducts()
    }
  },
  
  // 加载分类
  async loadCategories() {
    try {
      const res = await getCategories()
      if (res.code === 200) {
        this.setData({ categories: res.data })
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  },
  
  // 加载商品
  async loadProducts(loadMore = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      const page = loadMore ? this.data.page + 1 : 1
      const params = {
        page,
        pageSize: this.data.pageSize
      }
      
      // 分类筛选
      if (this.data.activeCategory > 0) {
        params.category = this.data.activeCategory
      }
      
      // 搜索关键词
      if (this.data.keyword) {
        params.keyword = this.data.keyword
      }
      
      // 排序参数
      if (this.data.sortSales) {
        params.sort = 'sales'
      } else if (this.data.sortPrice === 'asc') {
        params.sort = 'price_asc'
      } else if (this.data.sortPrice === 'desc') {
        params.sort = 'price_desc'
      }
      
      console.log('loadProducts - 参数:', params)
      console.log('loadProducts - keyword:', this.data.keyword)
      console.log('loadProducts - activeCategory:', this.data.activeCategory)
      
      let res
      if (this.data.keyword) {
        // 搜索时也传递完整的参数，包括排序等
        console.log('调用 searchProducts:', this.data.keyword, params)
        res = await searchProducts(this.data.keyword, params)
      } else {
        console.log('调用 getProducts:', params)
        res = await getProducts(params)
      }
      
      if (res.code === 200) {
        // 处理搜索API和商品列表API返回的数据格式差异
        let productList
        let total = 0
        
        if (this.data.keyword) {
          // 搜索API返回的格式: res.data 直接是商品列表
          productList = res.data
          total = res.data.length
        } else {
          // 商品列表API返回的格式: res.data.list 是商品列表
          productList = res.data.list
          total = res.data.total
        }
        
        let products = loadMore ? [...this.data.products, ...productList] : productList
        // 处理图片路径
        products = products.map(product => ({
          ...product,
          image: getImageUrl(product.image)
        }))
        const hasMore = products.length < total
        
        this.setData({
          products,
          hasMore,
          page,
          loading: false
        })
      }
    } catch (error) {
      console.error('加载商品失败:', error)
      this.setData({ loading: false })
    }
  },
  
  // 切换分类
  switchCategory(e) {
    const categoryId = parseInt(e.currentTarget.dataset.id)
    this.setData({ 
      activeCategory: categoryId,
      keyword: '', // 清空搜索框
      page: 1,
      products: []
    })
    this.loadProducts()
  },
  
  // 默认排序
  sortByDefault() {
    this.setData({ 
      page: 1, 
      products: [],
      sortPrice: 'asc',
      sortSales: false
    })
    this.loadProducts()
  },
  
  // 价格排序
  sortByPrice() {
    const sortPrice = this.data.sortPrice === 'asc' ? 'desc' : 'asc'
    this.setData({ 
      sortPrice,
      sortSales: false,
      page: 1,
      products: []
    })
    this.loadProducts()
  },
  
  // 销量排序
  sortBySales() {
    this.setData({ 
      sortSales: !this.data.sortSales,
      sortPrice: 'asc',
      page: 1,
      products: []
    })
    this.loadProducts()
  },
  
  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts(true)
    }
  },
  
  // 跳转到商品详情
  goToProductDetail(e) {
    const productId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    })
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  
  // 搜索
  search() {
    const { keyword } = this.data
    this.setData({
      activeCategory: 0, // 搜索时显示全部分类
      page: 1,
      products: []
    })
    this.loadProducts()
  }
})