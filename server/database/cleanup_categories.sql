-- 删除新插入的重复分类数据（ID 9 及之后）
-- 执行日期：2026-03-05

-- ⚠️ 重要提示：
-- 1. 此脚本会删除 ID >= 9 的分类记录
-- 2. 保留原有 ID 1-8 的分类
-- 3. 执行前建议先备份数据库

-- 第 1 步：先查看要删除的数据（确认无误后再执行删除）
SELECT id, name, icon, created_at 
FROM categories 
WHERE id >= 9
ORDER BY id;

-- 第 2 步：确认这些是要删除的数据后，执行删除
DELETE FROM categories 
WHERE id >= 9;

-- 第 3 步：验证删除结果
SELECT '删除成功！当前所有分类：' as message;
SELECT id, name, icon, sort 
FROM categories 
ORDER BY sort ASC, id ASC;

-- 第 4 步：检查是否还有重复
SELECT '重复检查结果（应该为空）：' as message;
SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM categories
GROUP BY name
HAVING count > 1;
