-- 删除重复的分类数据
-- 这个脚本用于清理之前运行 insert_categories.sql 时插入的重复分类

-- ⚠️ 警告：执行前请先备份数据库！

-- 方法一：删除特定名称的分类（如果你确定这些是重复的）
-- DELETE FROM categories 
-- WHERE name IN ('手机数码', '电脑办公', '家居家装', '服饰鞋包', '美食生鲜', '美妆个护', '母婴玩具', '图书文娱')
-- AND icon IN ('📱', '💻', '🏠', '👕', '🍎', '💄', '🧸', '📚');

-- 方法二：查看是否有重复的分类名称（推荐先执行这个查看）
SELECT name, COUNT(*) as count, GROUP_CONCAT(id) as ids
FROM categories
GROUP BY name
HAVING count > 1;

-- 方法三：查看最近插入的分类（根据 created_at 时间）
-- SELECT * FROM categories 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- 方法四：手动指定删除重复记录（保留 ID 小的）
-- DELETE c1 FROM categories c1
-- INNER JOIN categories c2 
-- WHERE c1.name = c2.name 
-- AND c1.created_at > c2.created_at;

-- 📋 建议操作步骤：
-- 1. 先执行"方法二"查看哪些分类重复了
-- 2. 确认重复的分类名称和 ID
-- 3. 使用以下命令删除特定的重复记录（替换成实际的 ID）
-- DELETE FROM categories WHERE id IN (你的重复记录 ID);

-- 示例：如果要删除 ID 为 9-16 的分类（假设这些是新插入的）
-- DELETE FROM categories WHERE id >= 9 AND name IN ('手机数码', '电脑办公', '家居家装', '服饰鞋包', '美食生鲜', '美妆个护', '母婴玩具', '图书文娱');
