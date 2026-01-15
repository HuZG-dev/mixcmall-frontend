USE mixcmall;

-- 创建店铺信息表
CREATE TABLE IF NOT EXISTS shops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '店铺名称',
  description TEXT COMMENT '店铺描述',
  logo VARCHAR(255) COMMENT '店铺logo',
  banner VARCHAR(255) COMMENT '店铺横幅',
  address VARCHAR(255) COMMENT '店铺地址',
  phone VARCHAR(20) COMMENT '联系电话',
  business_hours VARCHAR(100) COMMENT '营业时间',
  status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  admin_id INT COMMENT '关联的管理员ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺信息表';

-- 修改商品表，添加店铺ID字段
ALTER TABLE products ADD COLUMN shop_id INT DEFAULT NULL COMMENT '店铺ID';
ALTER TABLE products ADD FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL;

-- 为现有商品设置默认店铺ID（如果需要）
-- UPDATE products SET shop_id = 1 WHERE shop_id IS NULL;
