const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')

const router = express.Router()

// 获取地址列表
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.id
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    )
    
    const addresses = rows.map(addr => ({
      ...addr,
      isDefault: addr.is_default,
      createTime: addr.created_at
    }))
    
    res.json({
      code: 200,
      data: addresses
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取地址列表失败' })
  }
})

// 获取地址详情
router.get('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!rows || rows.length === 0) {
      return res.json({ code: 404, message: '地址不存在' })
    }
    
    const address = {
      ...rows[0],
      isDefault: rows[0].is_default,
      createTime: rows[0].created_at
    }
    
    res.json({
      code: 200,
      data: address
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '获取地址详情失败' })
  }
})

// 创建地址
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phone, province, city, district, detail, isDefault } = req.body
    
    console.log('创建地址请求:', { userId, name, phone, province, city, district, detail, isDefault })
    
    if (!name || !phone || !province || !city || !detail) {
      console.log('地址信息不完整:', { name, phone, province, city, district, detail })
      return res.json({ code: 400, message: '请填写完整的地址信息' })
    }
    
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()
      
      if (isDefault) {
        await connection.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
          [userId]
        )
      }
      
      const [result] = await connection.query(
        'INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, phone, province, city, district || '', detail, isDefault ? 1 : 0]
      )
      
      await connection.commit()
      
      const [newAddressRows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [result.insertId]
      )
      
      connection.release()
      
      const newAddress = {
        ...newAddressRows[0],
        isDefault: newAddressRows[0].is_default,
        createTime: newAddressRows[0].created_at
      }
      
      console.log('地址创建成功:', newAddress)
      
      res.json({
        code: 200,
        message: '地址添加成功',
        data: newAddress
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error('创建地址失败:', error)
    res.json({ code: 500, message: '服务器错误' })
  }
})

// 更新地址
router.put('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  const { name, phone, province, city, district, detail, isDefault } = req.body
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!rows || rows.length === 0) {
      return res.json({ code: 404, message: '地址不存在' })
    }
    
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()
      
      if (isDefault) {
        await connection.query(
          'UPDATE addresses SET is_default = 0 WHERE user_id = ? AND id != ?',
          [userId, id]
        )
      }
      
      const updates = []
      const values = []
      
      if (name) {
        updates.push('name = ?')
        values.push(name)
      }
      if (phone) {
        updates.push('phone = ?')
        values.push(phone)
      }
      if (province) {
        updates.push('province = ?')
        values.push(province)
      }
      if (city) {
        updates.push('city = ?')
        values.push(city)
      }
      if (district !== undefined) {
        updates.push('district = ?')
        values.push(district)
      }
      if (detail) {
        updates.push('detail = ?')
        values.push(detail)
      }
      if (isDefault !== undefined) {
        updates.push('is_default = ?')
        values.push(isDefault ? 1 : 0)
      }
      
      if (updates.length > 0) {
        values.push(id)
        await connection.query(
          `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`,
          values
        )
      }
      
      await connection.commit()
      
      const [updatedRows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [id]
      )
      
      connection.release()
      
      const address = {
        ...updatedRows[0],
        isDefault: updatedRows[0].is_default,
        createTime: updatedRows[0].created_at
      }
      
      res.json({
        code: 200,
        message: '地址更新成功',
        data: address
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '更新地址失败' })
  }
})

// 删除地址
router.delete('/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!rows || rows.length === 0) {
      return res.json({ code: 404, message: '地址不存在' })
    }
    
    await db.query('DELETE FROM addresses WHERE id = ?', [id])
    
    res.json({
      code: 200,
      message: '地址删除成功'
    })
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '删除地址失败' })
  }
})

// 设置默认地址
router.put('/:id/default', authMiddleware, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params
  
  try {
    const [rows] = await db.query(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    if (!rows || rows.length === 0) {
      return res.json({ code: 404, message: '地址不存在' })
    }
    
    const connection = await db.getConnection()
    
    try {
      await connection.beginTransaction()
      
      await connection.query(
        'UPDATE addresses SET is_default = 0 WHERE user_id = ?',
        [userId]
      )
      
      await connection.query(
        'UPDATE addresses SET is_default = 1 WHERE id = ?',
        [id]
      )
      
      await connection.commit()
      
      const [updatedRows] = await connection.query(
        'SELECT * FROM addresses WHERE id = ?',
        [id]
      )
      
      connection.release()
      
      const address = {
        ...updatedRows[0],
        isDefault: updatedRows[0].is_default,
        createTime: updatedRows[0].created_at
      }
      
      res.json({
        code: 200,
        message: '默认地址设置成功',
        data: address
      })
    } catch (error) {
      await connection.rollback()
      connection.release()
      throw error
    }
  } catch (error) {
    console.error(error)
    res.json({ code: 500, message: '设置默认地址失败' })
  }
})

module.exports = router
