USE mixcmall;

-- 为 shop_applications 表添加 shop_id 字段
ALTER TABLE shop_applications ADD COLUMN shop_id INT DEFAULT NULL COMMENT '关联的店铺ID（关闭店铺申请时使用）';

-- 添加索引
ALTER TABLE shop_applications ADD INDEX idx_shop_id (shop_id);
