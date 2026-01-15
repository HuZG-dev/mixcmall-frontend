USE mixcmall;

-- 删除banner字段
SET @drop_banner = IFNULL((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mixcmall' AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'banner'), 0);
SET @sql_banner = IF(@drop_banner > 0, 'ALTER TABLE shops DROP COLUMN banner', 'SELECT "banner column does not exist"');
PREPARE stmt_banner FROM @sql_banner;
EXECUTE stmt_banner;
DEALLOCATE PREPARE stmt_banner;

-- 删除address字段
SET @drop_address = IFNULL((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mixcmall' AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'address'), 0);
SET @sql_address = IF(@drop_address > 0, 'ALTER TABLE shops DROP COLUMN address', 'SELECT "address column does not exist"');
PREPARE stmt_address FROM @sql_address;
EXECUTE stmt_address;
DEALLOCATE PREPARE stmt_address;

-- 删除business_hours字段
SET @drop_hours = IFNULL((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'mixcmall' AND TABLE_NAME = 'shops' AND COLUMN_NAME = 'business_hours'), 0);
SET @sql_hours = IF(@drop_hours > 0, 'ALTER TABLE shops DROP COLUMN business_hours', 'SELECT "business_hours column does not exist"');
PREPARE stmt_hours FROM @sql_hours;
EXECUTE stmt_hours;
DEALLOCATE PREPARE stmt_hours;
