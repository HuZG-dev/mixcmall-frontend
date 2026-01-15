const express = require('express')
const router = express.Router()
const db = require('../config/database')
const { authMiddleware } = require('../middleware/auth')

// 获取店铺申请列表（超级管理员）
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '无权访问' })
    }

    let { page = 1, pageSize = 10, status } = req.query
    page = parseInt(page)
    pageSize = parseInt(pageSize)

    let sql = 'SELECT a.*, u.username as admin_name FROM shop_applications a LEFT JOIN admin_users u ON a.admin_id = u.id WHERE 1=1'
    let countSql = 'SELECT COUNT(*) as total FROM shop_applications WHERE 1=1'
    const params = []
    const countParams = []

    if (status !== undefined && status !== '') {
      sql += ' AND a.status = ?'
      countSql += ' AND status = ?'
      params.push(parseInt(status))
      countParams.push(parseInt(status))
    }

    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?'
    params.push(pageSize, (page - 1) * pageSize)

    const [rows] = await db.query(sql, params)
    const [countResult] = await db.query(countSql, countParams)
    const total = countResult[0].total

    res.json({
      code: 200,
      data: {
        list: rows,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('获取店铺申请列表失败:', error)
    res.json({ code: 500, message: '获取店铺申请列表失败' })
  }
})

// 获取我的店铺申请（普通管理员）
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM shop_applications WHERE admin_id = ? ORDER BY created_at DESC',
      [req.admin.id]
    )

    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('获取我的店铺申请失败:', error)
    res.json({ code: 500, message: '获取我的店铺申请失败' })
  }
})

// 提交店铺申请
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, logo, phone } = req.body

    if (!name) {
      return res.json({ code: 400, message: '店铺名称不能为空' })
    }

    // 检查是否已有店铺
    const [existingShops] = await db.query(
      'SELECT * FROM shops WHERE admin_id = ?',
      [req.admin.id]
    )

    if (existingShops.length > 0) {
      return res.json({ code: 400, message: '您已拥有店铺，每个管理员只能创建一个店铺' })
    }

    // 检查是否已有待审核的申请
    const [existing] = await db.query(
      'SELECT * FROM shop_applications WHERE admin_id = ? AND status = 0',
      [req.admin.id]
    )

    if (existing.length > 0) {
      return res.json({ code: 400, message: '您已有待审核的店铺申请，请等待审核结果' })
    }

    const [result] = await db.query(
      'INSERT INTO shop_applications (admin_id, name, description, logo, phone, status) VALUES (?, ?, ?, ?, ?, 0)',
      [req.admin.id, name, description || '', logo || '', phone || '']
    )

    res.json({
      code: 200,
      message: '店铺申请提交成功，请等待审核',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('提交店铺申请失败:', error)
    res.json({ code: 500, message: '提交店铺申请失败' })
  }
})

// 审核店铺申请（超级管理员）
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '无权访问' })
    }

    const { id } = req.params

    // 获取申请信息
    const [applications] = await db.query(
      'SELECT * FROM shop_applications WHERE id = ? AND status = 0',
      [id]
    )

    if (applications.length === 0) {
      return res.json({ code: 404, message: '申请不存在或已处理' })
    }

    const application = applications[0]

    // 创建店铺
    const [shopResult] = await db.query(
      'INSERT INTO shops (name, description, logo, phone, admin_id, status) VALUES (?, ?, ?, ?, ?, 1)',
      [application.name, application.description, application.logo, application.phone, application.admin_id]
    )

    // 更新申请状态
    await db.query(
      'UPDATE shop_applications SET status = 1 WHERE id = ?',
      [id]
    )

    res.json({
      code: 200,
      message: '审核通过，店铺已创建',
      data: { shopId: shopResult.insertId }
    })
  } catch (error) {
    console.error('审核店铺申请失败:', error)
    res.json({ code: 500, message: '审核店铺申请失败' })
  }
})

// 拒绝店铺申请（超级管理员）
router.put('/:id/reject', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '无权访问' })
    }

    const { id } = req.params
    const { reject_reason } = req.body

    if (!reject_reason) {
      return res.json({ code: 400, message: '请填写拒绝原因' })
    }

    const [result] = await db.query(
      'UPDATE shop_applications SET status = 2, reject_reason = ? WHERE id = ? AND status = 0',
      [reject_reason, id]
    )

    if (result.affectedRows === 0) {
      return res.json({ code: 404, message: '申请不存在或已处理' })
    }

    res.json({
      code: 200,
      message: '已拒绝该申请'
    })
  } catch (error) {
    console.error('拒绝店铺申请失败:', error)
    res.json({ code: 500, message: '拒绝店铺申请失败' })
  }
})

// 删除店铺申请（仅删除已拒绝的申请）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // 普通管理员只能删除自己的申请
    let sql = 'DELETE FROM shop_applications WHERE id = ? AND status = 2'
    const params = [id]

    if (req.admin.role !== 'super') {
      sql += ' AND admin_id = ?'
      params.push(req.admin.id)
    }

    const [result] = await db.query(sql, params)

    if (result.affectedRows === 0) {
      return res.json({ code: 404, message: '申请不存在或无权删除' })
    }

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除店铺申请失败:', error)
    res.json({ code: 500, message: '删除店铺申请失败' })
  }
})

// 申请关闭店铺
router.post('/close-shop', authMiddleware, async (req, res) => {
  try {
    const { shopId } = req.body

    if (!shopId) {
      return res.json({ code: 400, message: '店铺ID不能为空' })
    }

    // 检查店铺是否存在且属于该管理员
    const [shops] = await db.query(
      'SELECT * FROM shops WHERE id = ? AND admin_id = ?',
      [shopId, req.admin.id]
    )

    if (shops.length === 0) {
      return res.json({ code: 404, message: '店铺不存在或无权操作' })
    }

    // 检查是否已有待审核的关闭申请
    const [existing] = await db.query(
      'SELECT * FROM shop_applications WHERE admin_id = ? AND status = 3',
      [req.admin.id]
    )

    if (existing.length > 0) {
      return res.json({ code: 400, message: '您已有待审核的关闭店铺申请，请等待审核结果' })
    }

    const shop = shops[0]

    // 创建关闭店铺申请
    const [result] = await db.query(
      'INSERT INTO shop_applications (admin_id, name, description, logo, phone, status, shop_id) VALUES (?, ?, ?, ?, ?, 3, ?)',
      [req.admin.id, shop.name, shop.description, shop.logo, shop.phone, shopId]
    )

    res.json({
      code: 200,
      message: '关闭店铺申请提交成功，请等待审核',
      data: { id: result.insertId }
    })
  } catch (error) {
    console.error('提交关闭店铺申请失败:', error)
    res.json({ code: 500, message: '提交关闭店铺申请失败' })
  }
})

// 审核关闭店铺申请（超级管理员）
router.put('/:id/approve-close', authMiddleware, async (req, res) => {
  try {
    if (req.admin.role !== 'super') {
      return res.json({ code: 403, message: '无权访问' })
    }

    const { id } = req.params

    // 获取申请信息
    const [applications] = await db.query(
      'SELECT * FROM shop_applications WHERE id = ? AND status = 3',
      [id]
    )

    if (applications.length === 0) {
      return res.json({ code: 404, message: '申请不存在或已处理' })
    }

    const application = applications[0]

    // 关闭店铺（将状态设为禁用）
    await db.query(
      'UPDATE shops SET status = 0 WHERE id = ?',
      [application.shop_id]
    )

    // 更新申请状态
    await db.query(
      'UPDATE shop_applications SET status = 4 WHERE id = ?',
      [id]
    )

    res.json({
      code: 200,
      message: '审核通过，店铺已关闭'
    })
  } catch (error) {
    console.error('审核关闭店铺申请失败:', error)
    res.json({ code: 500, message: '审核关闭店铺申请失败' })
  }
})

module.exports = router
