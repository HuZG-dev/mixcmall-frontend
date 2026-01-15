CREATE TABLE IF NOT EXISTS shop_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT NOT NULL COMMENT '申请的管理员ID',
  name VARCHAR(100) NOT NULL COMMENT '店铺名称',
  description TEXT COMMENT '店铺描述',
  logo VARCHAR(255) COMMENT '店铺图片',
  phone VARCHAR(20) COMMENT '联系电话',
  status TINYINT DEFAULT 0 COMMENT '状态: 0-待审核, 1-已通过, 2-已拒绝',
  reject_reason TEXT COMMENT '拒绝原因',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺申请表';
