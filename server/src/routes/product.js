const express = require('express')
const router = express.Router()
const db = require('../config/database')

// 获取热门商品
router.get('/list/hot', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE status = 1 AND is_hot = 1 ORDER BY sales DESC LIMIT 8'
    )
    
    const list = rows.map(row => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      stock: row.stock,
      sales: row.sales
    }))
    
    res.json({
      code: 200,
      data: list
    })
  } catch (error) {
    console.error('获取热门商品失败:', error)
    res.json({ code: 500, message: '获取热门商品失败' })
  }
})

// 获取新品
router.get('/list/new', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE status = 1 AND is_new = 1 ORDER BY created_at DESC LIMIT 8'
    )
    
    const list = rows.map(row => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      stock: row.stock,
      sales: row.sales
    }))
    
    res.json({
      code: 200,
      data: list
    })
  } catch (error) {
    console.error('获取新品失败:', error)
    res.json({ code: 500, message: '获取新品失败' })
  }
})

// 获取推荐商品
router.get('/list/recommend', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE status = 1 ORDER BY RAND() LIMIT 12'
    )
    
    const list = rows.map(row => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      stock: row.stock,
      sales: row.sales
    }))
    
    res.json({
      code: 200,
      data: list
    })
  } catch (error) {
    console.error('获取推荐商品失败:', error)
    res.json({ code: 500, message: '获取推荐商品失败' })
  }
})

// 搜索商品
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query
    
    if (!keyword) {
      return res.json({ code: 400, message: '请输入搜索关键词' })
    }
    
    const [rows] = await db.query(
      'SELECT p.*, s.name as shop_name FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.status = 1 AND (p.name LIKE ? OR p.subtitle LIKE ? OR s.name LIKE ?) LIMIT 20',
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
    )
    
    const list = rows.map(row => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      stock: row.stock,
      sales: row.sales,
      shopName: row.shop_name
    }))
    
    res.json({
      code: 200,
      data: list
    })
  } catch (error) {
    console.error('搜索商品失败:', error)
    res.json({ code: 500, message: '搜索商品失败' })
  }
})

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    let { page = 1, pageSize = 12, category, keyword, sort, minPrice, maxPrice } = req.query
    
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    let sql = 'SELECT p.*, s.name as shop_name FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.status = 1'
    let countSql = 'SELECT COUNT(*) as total FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.status = 1'
    const params = []
    const countParams = []
    
    // 分类筛选
    if (category) {
      sql += ' AND category_id = ?'
      countSql += ' AND category_id = ?'
      params.push(parseInt(category))
      countParams.push(parseInt(category))
    }
    
    // 关键词搜索
    if (keyword) {
      sql += ' AND (p.name LIKE ? OR p.subtitle LIKE ? OR s.name LIKE ?)'
      countSql += ' AND (p.name LIKE ? OR p.subtitle LIKE ? OR s.name LIKE ?)'
      const kw = `%${keyword}%`
      params.push(kw, kw, kw)
      countParams.push(kw, kw, kw)
    }
    
    // 价格筛选
    if (minPrice) {
      sql += ' AND p.price >= ?'
      countSql += ' AND p.price >= ?'
      params.push(parseFloat(minPrice))
      countParams.push(parseFloat(minPrice))
    }
    if (maxPrice) {
      sql += ' AND p.price <= ?'
      countSql += ' AND p.price <= ?'
      params.push(parseFloat(maxPrice))
      countParams.push(parseFloat(maxPrice))
    }
    
    // 排序
    switch (sort) {
      case 'sales':
        sql += ' ORDER BY p.sales DESC'
        break
      case 'price_asc':
        sql += ' ORDER BY p.price ASC'
        break
      case 'price_desc':
        sql += ' ORDER BY p.price DESC'
        break
      case 'new':
        sql += ' ORDER BY p.created_at DESC'
        break
      default:
        sql += ' ORDER BY p.id DESC'
    }
    
    // 分页
    sql += ' LIMIT ? OFFSET ?'
    params.push(pageSize, (page - 1) * pageSize)
    
    const [rows] = await db.query(sql, params)
    const [countResult] = await db.query(countSql, countParams)
    const total = countResult[0].total
    
    // 处理数据格式
    const list = rows.map(row => ({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      categoryId: row.category_id,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      images: row.images ? JSON.parse(row.images) : (row.image ? [row.image] : []),
      stock: row.stock,
      sales: row.sales,
      rating: 95,
      isHot: row.is_hot === 1,
      isNew: row.is_new === 1,
      specs: row.specs ? JSON.parse(row.specs) : [],
      detail: row.detail,
      shopName: row.shop_name
    }))
    
    res.json({
      code: 200,
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取商品列表失败:', error)
    res.json({ code: 500, message: '获取商品列表失败' })
  }
})

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query(
      'SELECT p.*, s.name as shop_name, s.logo as shop_logo, s.phone as shop_phone FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE p.id = ? AND p.status = 1',
      [id]
    )
    
    if (rows.length === 0) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    const row = rows[0]
    const product = {
      id: row.id,
      name: row.name,
      subtitle: row.subtitle,
      description: row.description,
      categoryId: row.category_id,
      price: row.price,
      originalPrice: row.original_price,
      image: row.image,
      images: row.images ? JSON.parse(row.images) : (row.image ? [row.image] : []),
      stock: row.stock,
      sales: row.sales,
      rating: 95,
      isHot: row.is_hot === 1,
      isNew: row.is_new === 1,
      specs: row.specs ? JSON.parse(row.specs) : [],
      detail: row.detail,
      shop: row.shop_name ? {
        id: row.shop_id,
        name: row.shop_name,
        logo: row.shop_logo,
        phone: row.shop_phone
      } : null
    }
    
    res.json({
      code: 200,
      data: product
    })
  } catch (error) {
    console.error('获取商品详情失败:', error)
    res.json({ code: 500, message: '获取商品详情失败' })
  }
})

module.exports = router
