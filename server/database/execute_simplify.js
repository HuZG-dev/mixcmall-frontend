const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function executeSQL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'mixcmall'
  });

  try {
    const sqlPath = path.join(__dirname, 'simplify_shops.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('执行成功:', statement.trim().substring(0, 50) + '...');
      }
    }
    
    console.log('店铺表结构简化完成！');
  } catch (error) {
    console.error('执行失败:', error);
  } finally {
    await connection.end();
  }
}

executeSQL();
