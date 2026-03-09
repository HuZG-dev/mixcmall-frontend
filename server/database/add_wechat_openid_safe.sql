-- 为用户表添加微信 openid 字段（安全版本）

-- 检查字段是否存在，如果不存在则添加
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'wechat_openid';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) COMMENT \'微信 openid\' AFTER avatar')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 创建索引（如果不存在）
SET @indexName = 'idx_wechat_openid';
SET @tableName = 'users';
SET @columnName = 'wechat_openid';

SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tableName)
      AND (index_name = @indexName)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexName, ' ON ', @tableName, '(', @columnName, ')')
));

PREPARE createIndex FROM @preparedStatement2;
EXECUTE createIndex;
DEALLOCATE PREPARE createIndex;

-- 验证结果
SELECT '数据库迁移完成！' as message;
DESC users;
