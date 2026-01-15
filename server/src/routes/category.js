const express = require('express')
const router = express.Router()
const db = require('../config/database')

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY sort ASC, id ASC')
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.json({ code: 500, message: '获取分类列表失败' })
  }
})

// 获取分类详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id])
    
    if (rows.length === 0) {
      return res.json({ code: 404, message: '分类不存在' })
    }
    
    res.json({
      code: 200,
      data: rows[0]
    })
  } catch (error) {
    console.error('获取分类详情失败:', error)
    res.json({ code: 500, message: '获取分类详情失败' })
  }
})

// 创建分类
router.post('/', async (req, res) => {
  try {
    const { name, icon, parentId, sort, status } = req.body
    
    if (!name) {
      return res.json({ code: 400, message: '分类名称不能为空' })
    }
    
    const [result] = await db.query(
      'INSERT INTO categories (name, icon, parent_id, sort, status) VALUES (?, ?, ?, ?, ?)',
      [name, icon || '', parentId || 0, sort || 0, status !== undefined ? status : 1]
    )
    
    res.json({
      code: 200,
      message: '创建成功',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('创建分类失败:', error)
    res.json({ code: 500, message: '创建分类失败' })
  }
})

// 更新分类
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon, parentId, sort, status } = req.body
    
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.json({ code: 404, message: '分类不存在' })
    }
    
    await db.query(
      'UPDATE categories SET name = ?, icon = ?, parent_id = ?, sort = ?, status = ? WHERE id = ?',
      [
        name || rows[0].name,
        icon !== undefined ? icon : rows[0].icon,
        parentId !== undefined ? parentId : rows[0].parent_id,
        sort !== undefined ? sort : rows[0].sort,
        status !== undefined ? status : rows[0].status,
        id
      ]
    )
    
    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('更新分类失败:', error)
    res.json({ code: 500, message: '更新分类失败' })
  }
})

// 删除分类
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.json({ code: 404, message: '分类不存在' })
    }
    
    const [productRows] = await db.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id])
    if (productRows[0].count > 0) {
      return res.json({ code: 400, message: '该分类下有商品，无法删除' })
    }
    
    await db.query('DELETE FROM categories WHERE id = ?', [id])
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.json({ code: 500, message: '删除分类失败' })
  }
})

module.exports = router
