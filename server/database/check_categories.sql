-- 检查分类数据的 SQL

-- 1. 查看所有分类及其图标
SELECT id, name, icon, sort, created_at 
FROM categories 
ORDER BY sort ASC, id ASC;

-- 2. 检查 icon 字段的值（查看原始字节）
SELECT id, name, HEX(icon) as icon_hex, icon as icon_text
FROM categories 
ORDER BY id ASC;

-- 3. 如果 icon 显示为空，可能是字符集问题，尝试转换
SELECT id, name, 
       CONVERT(icon USING utf8mb4) as icon_utf8,
       LENGTH(icon) as icon_length
FROM categories 
ORDER BY id ASC;
