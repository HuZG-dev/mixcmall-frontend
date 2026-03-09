const jwt = require('jsonwebtoken')

// JWT认证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  console.log('认证中间件 - Authorization头:', authHeader)
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('认证中间件 - 缺少有效Authorization头')
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期'
    })
  }
  
  const token = authHeader.substring(7)
  console.log('认证中间件 - 提取的token:', token)
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mixcmall_secret')
    console.log('认证中间件 - 解码的token:', decoded)
    req.user = decoded
    req.admin = decoded
    next()
  } catch (error) {
    console.error('认证中间件 - token验证失败:', error)
    return res.status(401).json({
      code: 401,
      message: 'token无效或已过期'
    })
  }
}

// 可选认证中间件（登录用户可获取更多信息）
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mixcmall_secret')
      req.user = decoded
      req.admin = decoded
    } catch (error) {
      // 忽略错误，继续执行
    }
  }
  next()
}

module.exports = { authMiddleware, optionalAuth }
