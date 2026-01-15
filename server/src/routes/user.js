const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const { authMiddleware } = require('../middleware/auth')
const db = require('../config/database')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/avatars')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + ext)
  }
})

const avatarUpload = multer({
  storage: avatarStorage,
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

// 用户注册
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).withMessage('用户名长度为3-20位'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位'),
  body('phone').matches(/^1[3-9]\d{9}$/).withMessage('请输入正确的手机号')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.json({ code: 400, message: errors.array()[0].msg })
  }
  
  const { username, password, phone } = req.body
  
  try {
    // 检查用户名是否已存在
    const [usernameRows] = await db.query('SELECT id FROM users WHERE username = ?', [username])
    if (usernameRows.length > 0) {
      return res.json({ code: 400, message: '用户名已存在' })
    }
    
    // 检查手机号是否已存在
    const [phoneRows] = await db.query('SELECT id FROM users WHERE phone = ?', [phone])
    if (phoneRows.length > 0) {
      return res.json({ code: 400, message: '手机号已被注册' })
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 插入用户到数据库
    const [result] = await db.query(
      'INSERT INTO users (username, password, phone, email, avatar, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, phone, '', '', 1]
    )
    
    res.json({
      code: 200,
      message: '注册成功',
      data: { id: result.insertId, username: username }
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.json({ code: 500, message: '注册失败，请重试' })
  }
})

// 用户登录
router.post('/login', [
  body('username').notEmpty().withMessage('请输入用户名'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.json({ code: 400, message: errors.array()[0].msg })
  }
  
  const { username, password } = req.body
  
  try {
    // 查找用户（支持用户名或手机号登录）
    const [rows] = await db.query(
      'SELECT * FROM users WHERE (username = ? OR phone = ?) AND status = 1',
      [username, username]
    )
    
    if (rows.length === 0) {
      return res.json({ code: 400, message: '用户不存在' })
    }
    
    const user = rows[0]
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.json({ code: 400, message: '密码错误' })
    }
    
    // 生成token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'mixcmall_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )
    
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname || '',
          phone: user.phone,
          email: user.email || '',
          avatar: user.avatar || ''
        }
      }
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.json({ code: 500, message: '登录失败，请重试' })
  }
})

// 获取用户信息
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, phone, email, avatar, nickname, gender, birthday FROM users WHERE id = ?', [req.user.id])
    
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const user = rows[0]
    res.json({
      code: 200,
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email || '',
        avatar: user.avatar || '',
        nickname: user.nickname || '',
        gender: user.gender || 'secret',
        birthday: user.birthday || ''
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.json({ code: 500, message: '获取用户信息失败' })
  }
})

// 上传头像
router.post('/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ code: 400, message: '请选择要上传的头像' })
    }

    const avatarUrl = '/uploads/avatars/' + req.file.filename

    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id])

    res.json({
      code: 200,
      message: '头像上传成功',
      data: { avatar: avatarUrl }
    })
  } catch (error) {
    console.error('上传头像失败:', error)
    res.json({ code: 500, message: '上传头像失败' })
  }
})

// 更新用户信息
router.put('/info', authMiddleware, async (req, res) => {
  try {
    const { nickname, email, avatar, gender, birthday } = req.body
    
    const updateFields = []
    const updateValues = []
    
    if (nickname !== undefined) {
      updateFields.push('nickname = ?')
      updateValues.push(nickname)
    }
    if (email !== undefined) {
      updateFields.push('email = ?')
      updateValues.push(email)
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?')
      updateValues.push(avatar)
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?')
      updateValues.push(gender)
    }
    if (birthday !== undefined) {
      updateFields.push('birthday = ?')
      updateValues.push(birthday || null)
    }
    
    if (updateFields.length === 0) {
      return res.json({ code: 400, message: '没有要更新的字段' })
    }
    
    updateValues.push(req.user.id)
    
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    // 获取更新后的用户信息
    const [rows] = await db.query('SELECT id, username, phone, email, avatar, nickname, gender, birthday FROM users WHERE id = ?', [req.user.id])
    
    res.json({
      code: 200,
      message: '更新成功',
      data: rows[0]
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    res.json({ code: 500, message: '更新失败，请重试' })
  }
})

// 修改密码
router.put('/password', authMiddleware, [
  body('oldPassword').notEmpty().withMessage('请输入原密码'),
  body('newPassword').isLength({ min: 6, max: 20 }).withMessage('新密码长度为6-20位')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.json({ code: 400, message: errors.array()[0].msg })
  }
  
  const { oldPassword, newPassword } = req.body
  
  try {
    // 获取用户信息
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id])
    
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在' })
    }
    
    const user = rows[0]
    
    // 验证原密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password)
    
    if (!isValidPassword) {
      return res.json({ code: 400, message: '原密码错误' })
    }
    
    // 加密新密码并更新
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id])
    
    res.json({
      code: 200,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    res.json({ code: 500, message: '修改密码失败，请重试' })
  }
})

// 退出登录：无需校验token，前端清理本地状态即可
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '退出成功'
  })
})

module.exports = router
