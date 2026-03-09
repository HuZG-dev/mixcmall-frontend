const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

const router = express.Router()

// 获取订单列表
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id
  let { page = 1, pageSize = 10, status } = req.query
  
  page = parseInt(page)
  pageSize = parseInt(pageSize)
  
  try {
    let sql = 'SELECT o.*, (SELECT JSON_ARRAYAGG(JSON_OBJECT(' +
      '"id", oi.id, "productId", oi.product_id, "name", oi.product_name, ' +
      '"image", oi.product_image, "specs", oi.specs, "price", oi.price, "quantity", oi.quantity' +
      ')) FROM order_items oi WHERE oi.order_id = o.id) as items FROM orders o WHERE o.user_id = ?'
    const params = [userId]
    
    if (status && status !== 'all') {
      sql += ' AND o.status = ?'
      params.push(status)
    }
    
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, (page - 1) * pageSize)
    
    const [rows] = await db.query(sql, params)
    
    let countSql = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?'
    const countParams = [userId]
    
    if (status && status !== 'all') {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    
    const [countResult] = await db.query(countSql, countParams)
    
    const list = rows.map(order => ({
      ...order,
      items: order.items || [],
      createTime: order.created_at,
      payTime: order.pay_time,
      shipTime: order.ship_time,
      completeTime: order.complete_time
    }))
    
    res.json({
      code: 200,
      data: {
        list,
        total: countResult[0].total,
        page,
        pageSize
      }
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取订单列表失败' })
  }
})

// 获取订单详情
router.get('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!orderRows || orderRows.length === 0) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    const order = orderRows[0]
    
    const [itemRows] = await db.query(
      'SELECT id, product_id as productId, product_name as name, product_image as image, specs, price, quantity FROM order_items WHERE order_id = ?',
      [id]
    )
    
    const orderDetail = {
      ...order,
      items: itemRows,
      createTime: order.created_at,
      payTime: order.pay_time,
      shipTime: order.ship_time,
      completeTime: order.complete_time
    }
    
    res.json({
      code: 200,
      data: orderDetail
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取订单详情失败' })
  }
})

// 创建订单
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.id
  let { items, productId, quantity, addressId, paymentMethod, remark } = req.body
  
  // 处理前端发送的items数组格式
  if (items && Array.isArray(items) && items.length > 0) {
    const firstItem = items[0]
    productId = firstItem.productId
    quantity = firstItem.quantity
  }
  
  if (!productId) {
    return res.json({ code: 400, message: '请选择商品' })
  }
  
  if (!quantity || quantity <= 0) {
    return res.json({ code: 400, message: '请输入正确的数量' })
  }
  
  try {
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const [productRows] = await connection.query(
        'SELECT id, name, subtitle, price, image FROM products WHERE id = ?',
        [productId]
      )
      
      if (!productRows || productRows.length === 0) {
        await connection.rollback()
        return res.json({ code: 404, message: '商品不存在' })
      }
      
      const product = productRows[0]
      
      const totalPrice = (product.price * quantity).toFixed(2)
      const orderNo = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      
      const [orderResult] = await connection.query(
        'INSERT INTO orders (order_no, user_id, total_quantity, total_price, freight, status, address_id, payment_method, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNo, userId, quantity, totalPrice, '0.00', 'pending', addressId, paymentMethod || 'alipay', remark || '']
      )
      
      const orderId = orderResult.insertId
      
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, specs, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, product.id, product.name, product.image, product.subtitle || '默认规格', product.price, quantity]
      )
      
      await connection.commit()
      
      const [newOrderRows] = await connection.query(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      )
      
      const [newItemRows] = await connection.query(
        'SELECT id, product_id as productId, product_name as name, product_image as image, specs, price, quantity FROM order_items WHERE order_id = ?',
        [orderId]
      )
      
      const newOrder = {
        ...newOrderRows[0],
        items: newItemRows,
        createTime: newOrderRows[0].created_at,
        payTime: newOrderRows[0].pay_time,
        shipTime: newOrderRows[0].ship_time,
        completeTime: newOrderRows[0].complete_time
      }
      
      connection.release()
      
      res.json({
        code: 200,
        message: '订单创建成功',
        data: newOrder
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '订单创建失败' })
  }
})

// 取消订单
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!orderRows || orderRows.length === 0) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    const order = orderRows[0]
    
    if (order.status !== 'pending') {
      return res.json({ code: 400, message: '只能取消待付款订单' })
    }
    
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['cancelled', id]
    )
    
    res.json({
      code: 200,
      message: '订单已取消'
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '取消订单失败' })
  }
})

// 支付订单
router.post('/:id/pay', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  const { paymentMethod } = req.body
  
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!orderRows || orderRows.length === 0) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    const order = orderRows[0]
    
    if (order.status !== 'pending') {
      return res.json({ code: 400, message: '订单状态异常' })
    }
    
    await db.query(
      'UPDATE orders SET status = ?, pay_time = NOW(), payment_method = ? WHERE id = ?',
      ['paid', paymentMethod || 'alipay', id]
    )
    
    res.json({
      code: 200,
      message: '支付成功'
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '支付失败' })
  }
})

// 确认收货
router.put('/:id/confirm', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!orderRows || orderRows.length === 0) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    const order = orderRows[0]
    
    if (order.status !== 'shipped') {
      return res.json({ code: 400, message: '订单状态异常' })
    }
    
    await db.query(
      'UPDATE orders SET status = ?, complete_time = NOW() WHERE id = ?',
      ['completed', id]
    )
    
    res.json({
      code: 200,
      message: '确认收货成功'
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '确认收货失败' })
  }
})

// 删除订单
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!orderRows || orderRows.length === 0) {
      return res.json({ code: 404, message: '订单不存在' })
    }
    
    const order = orderRows[0]
    
    if (!['completed', 'cancelled'].includes(order.status)) {
      return res.json({ code: 400, message: '只能删除已完成或已取消的订单' })
    }
    
    await db.query('DELETE FROM order_items WHERE order_id = ?', [id])
    await db.query('DELETE FROM orders WHERE id = ?', [id])
    
    res.json({
      code: 200,
      message: '订单已删除'
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '删除订单失败' })
  }
})

module.exports = router
