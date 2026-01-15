const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

const router = express.Router()

// 获取购物车
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const [rows] = await db.query(`
      SELECT ci.*, p.name, p.image, p.price, p.stock
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId])
    
    const cartItems = rows.map(row => ({
      id: row.id,
      productId: row.product_id,
      name: row.name,
      image: row.image,
      price: row.price,
      quantity: row.quantity,
      stock: row.stock,
      selected: row.selected === 1
    }))
    
    res.json({
      code: 200,
      data: cartItems
    })
  } catch (error) {
    console.error('获取购物车失败:', error)
    res.json({ code: 500, message: '获取购物车失败' })
  }
})

// 添加到购物车
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, quantity = 1 } = req.body
    
    if (!productId) {
      return res.json({ code: 400, message: '商品ID不能为空' })
    }
    
    // 检查商品是否存在
    const [products] = await db.query('SELECT * FROM products WHERE id = ? AND status = 1', [productId])
    if (products.length === 0) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    const product = products[0]
    
    // 检查库存
    if (product.stock < quantity) {
      return res.json({ code: 400, message: '库存不足' })
    }
    
    // 检查商品是否已在购物车
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    
    if (existing.length > 0) {
      // 更新数量
      const newQuantity = existing[0].quantity + quantity
      if (newQuantity > product.stock) {
        return res.json({ code: 400, message: '库存不足' })
      }
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [newQuantity, userId, productId]
      )
    } else {
      // 添加新商品
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity, selected) VALUES (?, ?, ?, 1)',
        [userId, productId, quantity]
      )
    }
    
    res.json({
      code: 200,
      message: '添加成功'
    })
  } catch (error) {
    console.error('添加购物车失败:', error)
    res.json({ code: 500, message: '添加购物车失败' })
  }
})

// 更新购物车商品数量
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { quantity } = req.body
    
    // 检查购物车商品是否存在
    const [items] = await db.query(
      'SELECT ci.*, p.stock FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?',
      [id, userId]
    )
    
    if (items.length === 0) {
      return res.json({ code: 404, message: '商品不存在' })
    }
    
    if (quantity <= 0) {
      // 删除商品
      await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId])
    } else if (quantity > items[0].stock) {
      return res.json({ code: 400, message: '库存不足' })
    } else {
      // 更新数量
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, id, userId])
    }
    
    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    res.json({ code: 500, message: '更新购物车失败' })
  }
})

// 删除购物车商品
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    
    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId])
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除购物车失败:', error)
    res.json({ code: 500, message: '删除购物车失败' })
  }
})

// 清空购物车
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId])
    
    res.json({
      code: 200,
      message: '购物车已清空'
    })
  } catch (error) {
    console.error('清空购物车失败:', error)
    res.json({ code: 500, message: '清空购物车失败' })
  }
})

// 选中/取消选中商品
router.put('/:id/select', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params
    const { selected } = req.body
    
    await db.query(
      'UPDATE cart_items SET selected = ? WHERE id = ? AND user_id = ?',
      [selected ? 1 : 0, id, userId]
    )
    
    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    res.json({ code: 500, message: '更新购物车失败' })
  }
})

module.exports = router
