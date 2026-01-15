-- 万象商城数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS mixcmall DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mixcmall;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  email VARCHAR(100) COMMENT '邮箱',
  avatar VARCHAR(255) COMMENT '头像',
  nickname VARCHAR(50) COMMENT '昵称',
  gender ENUM('male', 'female', 'secret') DEFAULT 'secret' COMMENT '性别',
  birthday DATE COMMENT '生日',
  status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email)
) ENGINE=InnoDB COMMENT='用户表';

-- 管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '管理员账号',
  password VARCHAR(255) NOT NULL COMMENT '密码',
  role VARCHAR(20) DEFAULT 'admin' COMMENT '角色',
  status TINYINT DEFAULT 1 COMMENT '状态 1-正常 0-禁用',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB COMMENT='管理员表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  icon VARCHAR(100) COMMENT '图标',
  parent_id INT DEFAULT 0 COMMENT '父分类ID',
  sort INT DEFAULT 0 COMMENT '排序',
  status TINYINT DEFAULT 1 COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  subtitle VARCHAR(255) COMMENT '副标题',
  description TEXT COMMENT '商品描述',
  category_id INT COMMENT '分类ID',
  price DECIMAL(10,2) NOT NULL COMMENT '售价',
  original_price DECIMAL(10,2) COMMENT '原价',
  image VARCHAR(255) COMMENT '主图',
  images TEXT COMMENT '商品图片JSON',
  detail TEXT COMMENT '商品详情HTML',
  specs TEXT COMMENT '规格参数JSON',
  stock INT DEFAULT 0 COMMENT '库存',
  sales INT DEFAULT 0 COMMENT '销量',
  is_hot TINYINT DEFAULT 0 COMMENT '是否热门',
  is_new TINYINT DEFAULT 0 COMMENT '是否新品',
  status TINYINT DEFAULT 1 COMMENT '状态 1-上架 0-下架',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  FULLTEXT INDEX ft_name (name, description)
) ENGINE=InnoDB COMMENT='商品表';

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',
  quantity INT DEFAULT 1 COMMENT '数量',
  selected TINYINT DEFAULT 1 COMMENT '是否选中',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_product (user_id, product_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='购物车表';

-- 收货地址表
CREATE TABLE IF NOT EXISTS addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  name VARCHAR(50) NOT NULL COMMENT '收货人姓名',
  phone VARCHAR(20) NOT NULL COMMENT '收货人电话',
  province VARCHAR(50) COMMENT '省',
  city VARCHAR(50) COMMENT '市',
  district VARCHAR(50) COMMENT '区',
  detail VARCHAR(255) NOT NULL COMMENT '详细地址',
  is_default TINYINT DEFAULT 0 COMMENT '是否默认地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB COMMENT='收货地址表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  total_quantity INT DEFAULT 0 COMMENT '商品总数',
  total_price DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  freight DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  address_id INT COMMENT '收货地址ID',
  address_snapshot TEXT COMMENT '地址快照JSON',
  payment_method VARCHAR(20) COMMENT '支付方式',
  remark VARCHAR(255) COMMENT '订单备注',
  pay_time TIMESTAMP NULL COMMENT '支付时间',
  ship_time TIMESTAMP NULL COMMENT '发货时间',
  complete_time TIMESTAMP NULL COMMENT '完成时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_no (order_no)
) ENGINE=InnoDB COMMENT='订单表';

-- 订单商品表
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT NOT NULL COMMENT '商品ID',
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
  product_image VARCHAR(255) COMMENT '商品图片',
  specs VARCHAR(255) COMMENT '规格',
  price DECIMAL(10,2) NOT NULL COMMENT '购买价格',
  quantity INT NOT NULL COMMENT '购买数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB COMMENT='订单商品表';

-- 插入初始分类数据
INSERT INTO categories (name, icon, parent_id, sort) VALUES
('手机数码', 'el-icon-mobile-phone', 0, 1),
('电脑办公', 'el-icon-monitor', 0, 2),
('家用电器', 'el-icon-refrigerator', 0, 3),
('服饰鞋包', 'el-icon-goods', 0, 4),
('美妆护肤', 'el-icon-present', 0, 5),
('食品生鲜', 'el-icon-apple', 0, 6),
('图书音像', 'el-icon-reading', 0, 7),
('运动户外', 'el-icon-bicycle', 0, 8);

-- 插入测试用户 (密码: 123456)
INSERT INTO users (username, password, phone, email) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H0O9p9p.LO.8LGSH.OQR1.G7kHi', '13800138000', 'admin@mixcmall.com');

-- 插入管理员账户 (密码: 123456)
INSERT INTO admin_users (username, password, role, status) VALUES
('admin', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8g1uGf4bm/F/6HC8K3vpAWQp/QqFWK', 'super', 1);

-- 插入商品数据
INSERT INTO products (name, subtitle, description, category_id, price, original_price, image, images, detail, specs, stock, sales, is_hot, is_new) VALUES
-- 手机数码
('Apple iPhone 15 Pro', 'A17 Pro芯片，钛金属设计', 'iPhone 15 Pro采用钛金属设计，搭载A17 Pro芯片，配备4800万像素主摄，支持USB-C接口。', 1, 7999.00, 8999.00, '/uploads/products/iphone15.svg', '["/uploads/products/iphone15.svg"]', '<div><h3>A17 Pro芯片</h3><p>强大性能，专业级体验</p></div>', '[{"name":"品牌","value":"Apple"},{"name":"型号","value":"iPhone 15 Pro"},{"name":"存储","value":"256GB"}]', 500, 12580, 1, 1),

('华为 Mate 60 Pro', '麒麟9000S芯片，卫星通话', '华为Mate 60 Pro搭载麒麟9000S芯片，支持卫星通话功能，配备超感知徕卡影像。', 1, 6999.00, 7999.00, '/uploads/products/huawei-mate60.svg', '["/uploads/products/huawei-mate60.svg"]', '<div><h3>麒麟芯片回归</h3><p>遥遥领先</p></div>', '[{"name":"品牌","value":"华为"},{"name":"型号","value":"Mate 60 Pro"},{"name":"存储","value":"256GB"}]', 300, 8960, 1, 1),

('小米14 Ultra', '徕卡光学，骁龙8 Gen3', '小米14 Ultra搭载骁龙8 Gen3处理器，配备徕卡专业光学镜头，支持卫星通信。', 1, 5999.00, 6499.00, '/uploads/products/xiaomi14.svg', '["/uploads/products/xiaomi14.svg"]', '<div><h3>徕卡影像</h3><p>专业摄影体验</p></div>', '[{"name":"品牌","value":"小米"},{"name":"型号","value":"14 Ultra"},{"name":"存储","value":"256GB"}]', 450, 6750, 1, 1),

('AirPods Pro 2', '主动降噪，空间音频', 'Apple AirPods Pro第二代，搭载H2芯片，支持主动降噪和通透模式，提供沉浸式空间音频体验。', 1, 1899.00, 1999.00, '/uploads/products/airpods-pro.svg', '["/uploads/products/airpods-pro.svg"]', '<div><h3>H2芯片</h3><p>智能降噪</p></div>', '[{"name":"品牌","value":"Apple"},{"name":"型号","value":"AirPods Pro 2"},{"name":"连接","value":"蓝牙5.3"}]', 800, 15620, 1, 0),

('索尼 WH-1000XM5', '行业领先降噪', '索尼旗舰降噪耳机，搭载集成处理器V1和HD降噪处理器QN1，提供行业领先的降噪效果。', 1, 2699.00, 2999.00, '/uploads/products/sony-headphone.svg', '["/uploads/products/sony-headphone.svg"]', '<div><h3>顶级降噪</h3><p>30小时续航</p></div>', '[{"name":"品牌","value":"Sony"},{"name":"型号","value":"WH-1000XM5"},{"name":"续航","value":"30小时"}]', 350, 4280, 0, 0),

-- 电脑办公
('MacBook Pro 14英寸', 'M3 Pro芯片，专业创作', 'MacBook Pro 14英寸搭载M3 Pro芯片，配备Liquid Retina XDR显示屏，续航可达17小时。', 2, 14999.00, 16999.00, '/uploads/products/macbook-pro.svg', '["/uploads/products/macbook-pro.svg"]', '<div><h3>M3 Pro芯片</h3><p>专业级性能</p></div>', '[{"name":"品牌","value":"Apple"},{"name":"型号","value":"MacBook Pro 14"},{"name":"芯片","value":"M3 Pro"}]', 200, 3560, 1, 1),

('iPad Air 5', 'M1芯片，全面屏设计', 'iPad Air 5搭载M1芯片，配备10.9英寸Liquid Retina显示屏，支持Apple Pencil和妙控键盘。', 2, 4799.00, 5499.00, '/uploads/products/ipad-air.svg', '["/uploads/products/ipad-air.svg"]', '<div><h3>M1芯片</h3><p>强劲动力</p></div>', '[{"name":"品牌","value":"Apple"},{"name":"型号","value":"iPad Air 5"},{"name":"存储","value":"256GB"}]', 400, 7890, 1, 0),

-- 家用电器
('戴森 V15 Detect', '激光探测灰尘', '戴森V15 Detect无绳吸尘器，配备激光纤尘探测技术，智能LCD屏幕实时显示吸入微尘数量。', 3, 4990.00, 5590.00, '/uploads/products/dyson-vacuum.svg', '["/uploads/products/dyson-vacuum.svg"]', '<div><h3>激光探测</h3><p>深度清洁</p></div>', '[{"name":"品牌","value":"Dyson"},{"name":"型号","value":"V15 Detect"},{"name":"续航","value":"60分钟"}]', 250, 2340, 1, 0),

('戴森 Supersonic', '智能控温护发', '戴森Supersonic吹风机，搭载V9数码马达，智能控温保护头发光泽，配备多款风嘴。', 3, 2990.00, 3190.00, '/uploads/products/dyson-hairdryer.svg', '["/uploads/products/dyson-hairdryer.svg"]', '<div><h3>智能控温</h3><p>呵护秀发</p></div>', '[{"name":"品牌","value":"Dyson"},{"name":"型号","value":"Supersonic"},{"name":"功率","value":"1600W"}]', 320, 5670, 1, 0),

-- 服饰鞋包
('Nike Air Force 1', '经典白色运动鞋', 'Nike Air Force 1经典款运动鞋，采用优质皮革材质，Air气垫缓震，舒适百搭。', 4, 899.00, 999.00, '/uploads/products/nike-shoes.svg', '["/uploads/products/nike-shoes.svg"]', '<div><h3>经典设计</h3><p>百搭舒适</p></div>', '[{"name":"品牌","value":"Nike"},{"name":"型号","value":"Air Force 1"},{"name":"材质","value":"真皮"}]', 600, 18920, 1, 0),

-- 美妆护肤
('兰蔻小黑瓶精华', '肌底修护精华液', '兰蔻小黑瓶肌底精华液，蕴含二裂酵母发酵产物溶胞物，修护肌肤屏障，改善肤质。', 5, 1080.00, 1280.00, '/uploads/products/lancome.svg', '["/uploads/products/lancome.svg"]', '<div><h3>肌底修护</h3><p>焕活新生</p></div>', '[{"name":"品牌","value":"Lancôme"},{"name":"规格","value":"50ml"},{"name":"功效","value":"修护肌底"}]', 450, 9870, 1, 0),

('SK-II 神仙水', '护肤精华露', 'SK-II护肤精华露，含有超过90%的PITERA精华，帮助肌肤保持水润透亮，改善肤质。', 5, 1590.00, 1790.00, '/uploads/products/skii.svg', '["/uploads/products/skii.svg"]', '<div><h3>PITERA精华</h3><p>晶莹剔透</p></div>', '[{"name":"品牌","value":"SK-II"},{"name":"规格","value":"230ml"},{"name":"功效","value":"提亮肤色"}]', 380, 11250, 1, 0);
