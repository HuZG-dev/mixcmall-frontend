require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

// 导入路由
const userRoutes = require('./routes/user')
const productRoutes = require('./routes/product')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/order')
const categoryRoutes = require('./routes/category')
const adminRoutes = require('./routes/admin')
const addressRoutes = require('./routes/address')
const shopApplicationRoutes = require('./routes/shopApplications')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 静态文件
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API路由
app.use('/api/user', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/admin/shop-applications', shopApplicationRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务运行正常', data: { time: new Date() } })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误'
  })
})

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`万象商城服务已启动: http://localhost:${PORT}`)
})

module.exports = app
