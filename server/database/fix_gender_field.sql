-- 修复 users 表的 gender 字段

-- 修改 gender 字段类型为 TINYINT，允许 NULL，默认值为 0
ALTER TABLE users 
MODIFY COLUMN gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女';

-- 验证修改结果
DESC users;

-- 查看示例数据
SELECT id, username, nickname, gender, avatar FROM users LIMIT 5;
