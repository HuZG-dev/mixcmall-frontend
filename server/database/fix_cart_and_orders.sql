-- 购物车和订单功能完整修复脚本
-- 执行日期：2026-03-05

-- ==================== 1. 购物车表 ====================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS cart_items;

-- 创建购物车表
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  user_id INT NOT NULL COMMENT '用户 ID',
  product_id INT NOT NULL COMMENT '商品 ID',
  quantity INT DEFAULT 1 NOT NULL COMMENT '购买数量',
  selected TINYINT DEFAULT 1 COMMENT '是否选中（0-未选中，1-选中）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引和约束
  UNIQUE KEY unique_user_product (user_id, product_id) COMMENT '同一用户同一商品唯一',
  INDEX idx_user_id (user_id) COMMENT '用户 ID 索引',
  INDEX idx_product_id (product_id) COMMENT '商品 ID 索引',
  
  -- 外键约束
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';


-- ==================== 2. 订单表 ====================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS orders;

-- 创建订单表
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
  user_id INT NOT NULL COMMENT '用户 ID',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  freight_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
  status TINYINT DEFAULT 1 NOT NULL COMMENT '订单状态：1-待付款 2-待发货 3-待收货 4-已完成 5-已取消',
  payment_method VARCHAR(20) DEFAULT NULL COMMENT '支付方式：wechat-微信，alipay-支付宝',
  receiver_name VARCHAR(100) DEFAULT NULL COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) DEFAULT NULL COMMENT '收货人电话',
  receiver_address VARCHAR(500) DEFAULT NULL COMMENT '收货地址',
  remark VARCHAR(500) DEFAULT NULL COMMENT '订单备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  paid_at DATETIME DEFAULT NULL COMMENT '支付时间',
  shipped_at DATETIME DEFAULT NULL COMMENT '发货时间',
  received_at DATETIME DEFAULT NULL COMMENT '收货时间',
  cancelled_at DATETIME DEFAULT NULL COMMENT '取消时间',
  
  -- 索引和约束
  INDEX idx_user_id (user_id) COMMENT '用户 ID 索引',
  INDEX idx_order_no (order_no) COMMENT '订单编号索引',
  INDEX idx_status (status) COMMENT '订单状态索引',
  INDEX idx_created_at (created_at) COMMENT '下单时间索引',
  
  -- 外键约束
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';


-- ==================== 3. 订单商品表 ====================

-- 删除旧表（如果存在）
DROP TABLE IF EXISTS order_items;

-- 创建订单商品表
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  order_id INT NOT NULL COMMENT '订单 ID',
  product_id INT NOT NULL COMMENT '商品 ID',
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
  product_image VARCHAR(500) DEFAULT NULL COMMENT '商品图片',
  price DECIMAL(10,2) NOT NULL COMMENT '商品价格',
  quantity INT NOT NULL COMMENT '购买数量',
  
  -- 索引和约束
  INDEX idx_order_id (order_id) COMMENT '订单 ID 索引',
  INDEX idx_product_id (product_id) COMMENT '商品 ID 索引',
  
  -- 外键约束
  CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';


-- ==================== 4. 验证表结构 ====================

SELECT '========== 购物车表结构 ==========' as message;
DESC cart_items;

SELECT '========== 订单表结构 ==========' as message;
DESC orders;

SELECT '========== 订单商品表结构 ==========' as message;
DESC order_items;

SELECT '========== 所有表创建完成！请测试购物车和订单功能 ==========' as message;

-- 查看表示例数据（如果有的话）
SELECT '---------- 购物车数据 ----------' as message;
SELECT ci.id, u.username, p.name as product_name, ci.quantity, ci.created_at 
FROM cart_items ci
LEFT JOIN users u ON ci.user_id = u.id
LEFT JOIN products p ON ci.product_id = p.id
LIMIT 5;

SELECT '---------- 订单数据 ----------' as message;
SELECT o.id, o.order_no, u.username, o.total_amount, o.status, o.created_at 
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 5;

SELECT '---------- 订单商品数据 ----------' as message;
SELECT oi.id, o.order_no, oi.product_name, oi.price, oi.quantity 
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
ORDER BY oi.id DESC
LIMIT 10;
