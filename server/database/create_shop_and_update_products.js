const mysql = require('mysql2/promise')

async function checkAndCreateShop() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'mixcmall'
  })

  try {
    console.log('检查解忧杂货铺店铺...')

    const [shops] = await connection.query(
      'SELECT * FROM shops WHERE name = ?',
      ['解忧杂货铺']
    )

    let shopId

    if (shops.length > 0) {
      shopId = shops[0].id
      console.log('解忧杂货铺已存在，ID:', shopId)
    } else {
      console.log('创建解忧杂货铺店铺...')
      const [result] = await connection.query(
        'INSERT INTO shops (name, description, logo, phone, admin_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['解忧杂货铺', '解忧杂货铺，为您提供优质商品', '', '400-123-4567', 1, 1]
      )
      shopId = result.insertId
      console.log('解忧杂货铺创建成功，ID:', shopId)
    }

    console.log('\n将所有商品关联到解忧杂货铺...')
    const [updateResult] = await connection.query(
      'UPDATE products SET shop_id = ? WHERE shop_id IS NULL OR shop_id = 0',
      [shopId]
    )
    console.log('已更新', updateResult.affectedRows, '个商品')

    console.log('\n完成！')
  } catch (error) {
    console.error('错误:', error)
  } finally {
    await connection.end()
  }
}

checkAndCreateShop()
