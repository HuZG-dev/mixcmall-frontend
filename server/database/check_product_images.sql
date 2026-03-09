-- 检查商品图片路径
SELECT id, name, image FROM products LIMIT 10;

-- 更新图片路径（如果需要）
-- 如果数据库中的路径是相对路径（如 /uploads/products/xxx.jpg），则不需要修改
-- 后端会自动拼接完整 URL
