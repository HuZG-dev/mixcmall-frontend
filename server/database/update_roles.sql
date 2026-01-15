USE mixcmall;

-- 修改 role 字段，将默认值改为 'admin'（普通管理员）
ALTER TABLE admin_users MODIFY COLUMN role VARCHAR(20) DEFAULT 'admin' COMMENT '角色: super-超级管理员, admin-普通管理员';

-- 更新现有管理员的角色
UPDATE admin_users SET role = 'super' WHERE username = 'admin';
