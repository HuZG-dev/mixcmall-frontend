-- 安全更新分类图标（不删除现有数据）
-- 这个脚本只为没有图标的分类添加 emoji 图标，不会删除或修改已有图标

-- 方案一：为所有没有图标的分类设置默认图标
UPDATE categories 
SET icon = '📦' 
WHERE icon IS NULL OR icon = '';

-- 方案二：根据分类名称智能匹配图标（推荐）
-- 只更新 icon 为空的记录
UPDATE categories SET icon = 
  CASE 
    WHEN name LIKE '%手机%' OR name LIKE '%数码%' OR name LIKE '%电话%' THEN '📱'
    WHEN name LIKE '%电脑%' OR name LIKE '%办公%' OR name LIKE '%计算机%' THEN '💻'
    WHEN name LIKE '%家居%' OR name LIKE '%家装%' OR name LIKE '%家具%' THEN '🏠'
    WHEN name LIKE '%服饰%' OR name LIKE '%鞋包%' OR name LIKE '%服装%' THEN '👕'
    WHEN name LIKE '%美食%' OR name LIKE '%生鲜%' OR name LIKE '%食品%' THEN '🍎'
    WHEN name LIKE '%美妆%' OR name LIKE '%个护%' OR name LIKE '%化妆%' THEN '💄'
    WHEN name LIKE '%母婴%' OR name LIKE '%玩具%' OR name LIKE '%儿童%' THEN '🧸'
    WHEN name LIKE '%图书%' OR name LIKE '%文娱%' OR name LIKE '%书籍%' THEN '📚'
    ELSE '📦'
  END
WHERE icon IS NULL OR icon = '' OR icon = 'null';

-- 查看更新结果
SELECT id, name, icon, parent_id, sort 
FROM categories 
ORDER BY sort ASC, id ASC;

