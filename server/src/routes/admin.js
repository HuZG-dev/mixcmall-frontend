const express = require('express')
const router = express.Router()
const db = require('../config/database')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { authMiddleware } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/products')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'product-' + uniqueSuffix + ext)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('只支持图片格式'))
    }
  }
})

const shopAvatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/shop_avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'shop-' + req.admin.id + '-' + uniqueSuffix + ext)
  }
})

const shopAvatarUpload = multer({
  storage: shopAvatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('只支持图片格式'))
    }
  }
})

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ? AND status = 1', [username])
    
    if (rows.length === 0) {
      return res.json({ code: 401, message: '用户名或密码错误' })
    }
    
    const admin = rows[0]

    // 验证密码（支持明文和bcrypt加密两种格式，兼容现有数据）
    let isValidPassword = false
    
    // 判断密码格式：bcrypt加密的密码以 $2a$ 或 $2b$ 开头
    if (admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'))) {
      // bcrypt加密的密码
      try {
        isValidPassword = await bcrypt.compare(password, admin.password)
      } catch (error) {
        console.error('密码验证错误:', error)
        isValidPassword = false
      }
    } else {
      // 明文密码（临时兼容，建议尽快改为加密）
      isValidPassword = password === admin.password
    }
    
    if (!isValidPassword) {
      return res.json({ code: 401, message: '用户名或密码错误' })
    }
    
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role || 'admin' },
      process.env.JWT_SECRET || 'mixcmall_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.json({ 
      code: 200, 
      data: { 
        token,
        userInfo: {
          id: admin.id,
          username: admin.username,
          role: admin.role || 'admin'
        }
      } 
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '登录失败' })
  }
})

// 统计数据
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    let productCountSql = 'SELECT COUNT(*) as count FROM products'
    const productParams = []
    
    // 普通管理员只能统计自己店铺的商品
    if (req.admin.role !== 'super') {
      productCountSql += ' WHERE shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      productParams.push(req.admin.id)
    }
    
    const [productCount] = await db.query(productCountSql, productParams)
    
    // 订单统计 - 普通管理员只能统计自己店铺的订单
    let orderCountSql = 'SELECT COUNT(DISTINCT o.id) as count FROM orders o'
    const orderParams = []
    
    if (req.admin.role !== 'super') {
      orderCountSql += ' INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id WHERE p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      orderParams.push(req.admin.id)
    }
    
    const [orderCount] = await db.query(orderCountSql, orderParams)
    
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users')
    
    // 总销售额 - 普通管理员只能统计自己店铺的销售额
    let totalSalesSql = 'SELECT COALESCE(SUM(o.total_price), 0) as total FROM orders o'
    const salesParams = []
    
    if (req.admin.role !== 'super') {
      totalSalesSql += ' INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id WHERE o.status != "cancelled" AND p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      salesParams.push(req.admin.id)
    } else {
      totalSalesSql += ' WHERE o.status != "cancelled"'
    }
    
    const [totalSales] = await db.query(totalSalesSql, salesParams)
    
    // 最近订单 - 普通管理员只能看到自己店铺的订单
    let recentOrdersSql = `
      SELECT DISTINCT o.*, u.username FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
    `
    const recentParams = []
    
    if (req.admin.role !== 'super') {
      recentOrdersSql += ' INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id WHERE p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      recentParams.push(req.admin.id)
    }
    
    recentOrdersSql += ' ORDER BY o.created_at DESC LIMIT 10'
    
    const [recentOrders] = await db.query(recentOrdersSql, recentParams)
    
    // 获取最近30天的订单统计数据（用于图表）
    let orderStatsSql = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as count,
        COALESCE(SUM(o.total_price), 0) as amount
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND o.status != 'cancelled'
    `
    const orderStatsParams = []
    
    // 普通管理员只能统计自己店铺的订单
    if (req.admin.role !== 'super') {
      orderStatsSql += ' AND p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      orderStatsParams.push(req.admin.id)
    }
    
    orderStatsSql += ' GROUP BY DATE(o.created_at) ORDER BY date ASC'
    
    const [orderStats] = await db.query(orderStatsSql, orderStatsParams)
    
    // 获取订单状态分布（用于饼图）
    let statusStatsSql = `
      SELECT 
        o.status,
        COUNT(DISTINCT o.id) as count
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      INNER JOIN products p ON oi.product_id = p.id
    `
    const statusParams = []
    
    // 普通管理员只能统计自己店铺的订单
    if (req.admin.role !== 'super') {
      statusStatsSql += ' WHERE p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      statusParams.push(req.admin.id)
    }
    
    statusStatsSql += ' GROUP BY o.status'
    
    const [statusStats] = await db.query(statusStatsSql, statusParams)
    
    // 获取商品分类销售统计（用于柱状图）
    let categoryStatsSql = `
      SELECT 
        c.name as category_name,
        COUNT(DISTINCT oi.product_id) as product_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.price * oi.quantity) as total_amount
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      INNER JOIN products p ON oi.product_id = p.id
      INNER JOIN categories c ON p.category_id = c.id
      WHERE o.status != 'cancelled'
    `
    const categoryParams = []
    
    // 普通管理员只能统计自己店铺的商品
    if (req.admin.role !== 'super') {
      categoryStatsSql += ' AND p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      categoryParams.push(req.admin.id)
    }
    
    categoryStatsSql += ' GROUP BY c.id, c.name ORDER BY total_amount DESC LIMIT 8'
    
    const [categoryStats] = await db.query(categoryStatsSql, categoryParams)
    
    res.json({
      code: 200,
      data: {
        stats: {
          productCount: productCount[0].count,
          orderCount: orderCount[0].count,
          userCount: userCount[0].count,
          totalSales: totalSales[0].total || 0
        },
        recentOrders,
        chartData: {
          orderTrend: orderStats,
          statusDistribution: statusStats,
          categorySales: categoryStats
        }
      }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取统计失败' })
  }
})

// 图片上传
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择文件' })
    }
    const fileUrl = `/uploads/products/${req.file.filename}`
    res.json({
      code: 200,
      data: { url: fileUrl },
      message: '上传成功'
    })
  } catch (error) {
    console.error('上传失败:', error)
    res.json({ code: 500, message: '上传失败' })
  }
})

// 商品列表
router.get('/products', authMiddleware, async (req, res) => {
  try {
    let { page = 1, pageSize = 10 } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    let sql = 'SELECT p.*, s.name as shop_name FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE 1=1'
    let countSql = 'SELECT COUNT(*) as total FROM products p LEFT JOIN shops s ON p.shop_id = s.id WHERE 1=1'
    const params = []
    const countParams = []
    
    // 普通管理员只能看到自己店铺的商品
    if (req.admin.role !== 'super') {
      sql += ' AND s.admin_id = ?'
      countSql += ' AND s.admin_id = ?'
      params.push(req.admin.id)
      countParams.push(req.admin.id)
    }
    
    sql += ' ORDER BY p.id ASC LIMIT ? OFFSET ?'
    params.push(pageSize, (page - 1) * pageSize)
    
    const [rows] = await db.query(sql, params)
    const [countResult] = await db.query(countSql, countParams)
    
    res.json({
      code: 200,
      data: { list: rows, total: countResult[0].total }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取商品列表失败' })
  }
})

// 添加商品
router.post('/products', authMiddleware, async (req, res) => {
  try {
    const { name, subtitle, description, category_id, price, original_price, image, stock, status, detail, specs, shop_id } = req.body
    
    // 普通管理员必须选择店铺
    if (req.admin.role !== 'super') {
      if (!shop_id) {
        return res.json({ code: 400, message: '请选择店铺' })
      }
      
      // 检查店铺是否属于该管理员
      const [shops] = await db.query(
        'SELECT * FROM shops WHERE id = ? AND admin_id = ?',
        [shop_id, req.admin.id]
      )
      
      if (shops.length === 0) {
        return res.json({ code: 403, message: '无权操作该店铺' })
      }
    }
    
    await db.query(
      'INSERT INTO products (name, subtitle, description, category_id, price, original_price, image, stock, status, detail, specs, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, subtitle, description, category_id, price, original_price, image, stock, status, detail || null, specs || null, shop_id || null]
    )
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '添加失败' })
  }
})

// 更新商品
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, subtitle, description, category_id, price, original_price, image, stock, status, detail, specs, shop_id } = req.body
    await db.query(
      'UPDATE products SET name=?, subtitle=?, description=?, category_id=?, price=?, original_price=?, image=?, stock=?, status=?, detail=?, specs=?, shop_id=? WHERE id=?',
      [name, subtitle, description, category_id, price, original_price, image, stock, status, detail || null, specs || null, shop_id || null, id]
    )
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新失败' })
  }
})

// 删除商品
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.query('DELETE FROM products WHERE id = ?', [id])
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '删除失败' })
  }
})

// 订单列表
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    let { page = 1, pageSize = 10, status } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    let sql = 'SELECT DISTINCT o.*, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id'
    let countSql = 'SELECT COUNT(DISTINCT o.id) as total FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id'
    const params = []
    const countParams = []
    
    // 普通管理员只能看到自己店铺的订单
    if (req.admin.role !== 'super') {
      sql += ' WHERE p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      countSql += ' WHERE p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?)'
      params.push(req.admin.id)
      countParams.push(req.admin.id)
    }
    
    if (status) {
      if (req.admin.role !== 'super') {
        sql += ' AND o.status = ?'
        countSql += ' AND o.status = ?'
      } else {
        sql += ' WHERE o.status = ?'
        countSql += ' WHERE status = ?'
      }
      params.push(status)
      countParams.push(status)
    }
    
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, (page - 1) * pageSize)
    
    const [rows] = await db.query(sql, params)
    const [countResult] = await db.query(countSql, countParams)
    
    const list = await Promise.all(rows.map(async (order) => {
      const [itemRows] = await db.query(
        'SELECT id, product_id as productId, product_name as name, product_image as image, specs, price, quantity FROM order_items WHERE order_id = ?',
        [order.id]
      )
      return {
        ...order,
        items: itemRows
      }
    }))
    
    res.json({
      code: 200,
      data: { list, total: countResult[0].total }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取订单列表失败' })
  }
})

// 更新订单状态
router.put('/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    // 普通管理员只能更新自己店铺的订单
    if (req.admin.role !== 'super') {
      const [orderRows] = await db.query(
        'SELECT o.id FROM orders o INNER JOIN order_items oi ON o.id = oi.order_id INNER JOIN products p ON oi.product_id = p.id WHERE o.id = ? AND p.shop_id IN (SELECT id FROM shops WHERE admin_id = ?) LIMIT 1',
        [id, req.admin.id]
      )
      
      if (orderRows.length === 0) {
        return res.json({ code: 403, message: '无权操作该订单' })
      }
    }
    
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id])
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新失败' })
  }
})

// 用户列表
router.get('/users', async (req, res) => {
  try {
    let { page = 1, pageSize = 10 } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    const [rows] = await db.query('SELECT id, username, phone, email, status, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?', [pageSize, (page - 1) * pageSize])
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM users')
    
    res.json({
      code: 200,
      data: { list: rows, total: countResult[0].total }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取用户列表失败' })
  }
})

// 更新用户状态
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新失败' })
  }
})

// 获取管理员列表（仅超级管理员）
router.get('/admins', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    let { page = 1, pageSize = 10 } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    const [rows] = await db.query('SELECT id, username, role, status, created_at FROM admin_users ORDER BY id DESC LIMIT ? OFFSET ?', [pageSize, (page - 1) * pageSize])
    const [countResult] = await db.query('SELECT COUNT(*) as total FROM admin_users')
    
    res.json({
      code: 200,
      data: { list: rows, total: countResult[0].total }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取管理员列表失败' })
  }
})

// 添加管理员（仅超级管理员）
router.post('/admins', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    const { username, password, role } = req.body
    
    if (!username || !password) {
      return res.json({ code: 400, message: '用户名和密码不能为空' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await db.query(
      'INSERT INTO admin_users (username, password, role, status) VALUES (?, ?, ?, 1)',
      [username, hashedPassword, role || 'admin']
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    console.error(error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.json({ code: 400, message: '用户名已存在' })
    } else {
      res.json({ code: 500, message: '添加失败' })
    }
  }
})

// 更新管理员角色（仅超级管理员）
router.put('/admins/:id', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    const { id } = req.params
    const { role, status } = req.body
    
    if (parseInt(id) === req.admin.id) {
      return res.json({ code: 400, message: '不能修改自己的角色' })
    }
    
    const updates = []
    const values = []
    
    if (role !== undefined) {
      updates.push('role = ?')
      values.push(role)
    }
    
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    
    if (updates.length === 0) {
      return res.json({ code: 400, message: '没有要更新的内容' })
    }
    
    values.push(id)
    await db.query(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, values)
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新失败' })
  }
})

// 删除管理员（仅超级管理员）
router.delete('/admins/:id', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    const { id } = req.params
    
    if (parseInt(id) === req.admin.id) {
      return res.json({ code: 400, message: '不能删除自己' })
    }
    
    await db.query('DELETE FROM admin_users WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '删除失败' })
  }
})

// 重置管理员密码（仅超级管理员）
router.put('/admins/:id/password', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    const { id } = req.params
    const { password } = req.body
    
    if (!password) {
      return res.json({ code: 400, message: '密码不能为空' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await db.query('UPDATE admin_users SET password = ? WHERE id = ?', [hashedPassword, id])
    
    res.json({ code: 200, message: '重置成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '重置失败' })
  }
})

// 店铺管理路由
// 获取店铺列表
router.get('/shops', authMiddleware, async (req, res) => {
  try {
    let { page = 1, pageSize = 10 } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)
    
    let sql = 'SELECT s.*, a.username as admin_name FROM shops s LEFT JOIN admin_users a ON s.admin_id = a.id'
    let countSql = 'SELECT COUNT(*) as total FROM shops'
    
    // 普通管理员只能看到自己的店铺
    if (req.admin.role !== 'super') {
      sql += ' WHERE s.admin_id = ?'
      countSql += ' WHERE admin_id = ?'
    }
    
    sql += ' ORDER BY s.id DESC LIMIT ? OFFSET ?'
    
    const params = req.admin.role !== 'super' 
      ? [req.admin.id, pageSize, (page - 1) * pageSize]
      : [pageSize, (page - 1) * pageSize]
    
    const [rows] = await db.query(sql, params)
    const [countResult] = await db.query(countSql, req.admin.role !== 'super' ? [req.admin.id] : [])
    
    res.json({
      code: 200,
      data: { list: rows, total: countResult[0].total }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取店铺列表失败' })
  }
})

// 获取所有店铺（用于下拉选择）
router.get('/shops/all', authMiddleware, async (req, res) => {
  try {
    let sql = 'SELECT id, name, status FROM shops WHERE status = 1'
    
    // 普通管理员只能看到自己的店铺
    if (req.admin.role !== 'super') {
      sql += ' AND admin_id = ?'
    }
    
    sql += ' ORDER BY id ASC'
    
    const [rows] = await db.query(sql, req.admin.role !== 'super' ? [req.admin.id] : [])
    
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取店铺列表失败' })
  }
})

// 获取我的店铺
router.get('/shops/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM shops WHERE admin_id = ? ORDER BY id ASC',
      [req.admin.id]
    )
    
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取我的店铺失败' })
  }
})

// 添加店铺
router.post('/shops', authMiddleware, async (req, res) => {
  try {
    const { name, description, logo, phone } = req.body
    
    if (!name) {
      return res.json({ code: 400, message: '店铺名称不能为空' })
    }
    
    await db.query(
      'INSERT INTO shops (name, description, logo, phone, admin_id) VALUES (?, ?, ?, ?, ?)',
      [name, description, logo, phone, req.admin.id]
    )
    
    res.json({ code: 200, message: '添加成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '添加失败' })
  }
})

// 更新店铺
router.put('/shops/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, logo, phone, status } = req.body
    
    // 检查权限
    const [shops] = await db.query('SELECT * FROM shops WHERE id = ?', [id])
    if (shops.length === 0) {
      return res.json({ code: 404, message: '店铺不存在' })
    }
    
    if (req.admin.role !== 'super' && shops[0].admin_id !== req.admin.id) {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    await db.query(
      'UPDATE shops SET name=?, description=?, logo=?, phone=?, status=? WHERE id=?',
      [name, description, logo, phone, status, id]
    )
    
    res.json({ code: 200, message: '更新成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新失败' })
  }
})

// 删除店铺
router.delete('/shops/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    
    // 检查权限
    const [shops] = await db.query('SELECT * FROM shops WHERE id = ?', [id])
    if (shops.length === 0) {
      return res.json({ code: 404, message: '店铺不存在' })
    }
    
    if (req.admin.role !== 'super' && shops[0].admin_id !== req.admin.id) {
      return res.json({ code: 403, message: '权限不足' })
    }
    
    // 检查是否有关联商品
    const [products] = await db.query('SELECT COUNT(*) as count FROM products WHERE shop_id = ?', [id])
    if (products[0].count > 0) {
      return res.json({ code: 400, message: '该店铺下还有商品，无法删除' })
    }
    
    await db.query('DELETE FROM shops WHERE id = ?', [id])
    
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '删除失败' })
  }
})

// 上传店铺图片
router.post('/shops/image', authMiddleware, shopAvatarUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择要上传的店铺图片' })
    }

    const imageUrl = '/uploads/shop_avatars/' + req.file.filename

    res.json({
      code: 200,
      message: '店铺图片上传成功',
      data: { image: imageUrl }
    })
  } catch (error) {
    console.error('上传店铺图片失败:', error)
    res.json({ code: 500, message: '上传店铺图片失败' })
  }
})

module.exports = router
