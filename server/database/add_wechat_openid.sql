-- 为用户表添加微信 openid 字段

-- 如果字段不存在则添加
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR(100) COMMENT '微信 openid' AFTER avatar;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_wechat_openid ON users(wechat_openid);

-- 查看结果
DESC users;
