/**
 * 小程序使用 Element UI 图标的解决方案
 * 
 * 问题：Element UI 图标是 Vue 组件，小程序无法直接使用
 * 解决：使用 iconfont 字体图标替代
 */

// ==================== 方案一：使用阿里巴巴 iconfont（推荐）====================

/**
 * 步骤：
 * 1. 访问 https://www.iconfont.cn/
 * 2. 注册账号并创建项目
 * 3. 添加需要的图标（搜索：goods, shop, home, cart, user 等）
 * 4. 生成 Font class 代码
 * 5. 下载生成的文件到小程序项目
 */

// 示例：下载后的文件结构
// miniprogram/iconfont/
//   ├── iconfont.css
//   ├── iconfont.ttf
//   ├── iconfont.woff
//   └── iconfont.js

// 在 app.wxss 中引入：
// @import './iconfont/iconfont.css';

// 然后在页面中使用：
// <text class="iconfont icon-goods"></text>


// ==================== 方案二：使用预定义的图标映射（简单快速）====================

/**
 * 如果数据库中的 icon 字段存储的是 Element UI 的类名，如：
 * - el-icon-goods
 * - el-icon-shop
 * - el-icon-home
 * - el-icon-shopping-cart
 * - el-icon-user
 * 
 * 我们可以将其映射为 Unicode 字符或 emoji
 */

// Element UI 图标到 emoji 的映射表
const elementIconToEmoji = {
  // 商品相关
  'el-icon-goods': '📦',
  'el-icon-present': '🎁',
  'el-icon-shopping-bag-1': '🛍️',
  'el-icon-shopping-cart-full': '🛒',
  
  // 店铺相关
  'el-icon-shop': '🏪',
  'el-icon-store': '🏬',
  'el-icon-s-platform': '💼',
  
  // 家居相关
  'el-icon-house': '🏠',
  'el-icon-home-filled': '🏡',
  'el-icon-coffee-cup': '☕',
  
  // 服饰相关
  'el-icon-suitcase': '🧳',
  'el-icon-ticket': '🎫',
  'el-icon-s-fold': '👔',
  
  // 美食相关
  'el-icon-food': '🍔',
  'el-icon-dish': '🍱',
  'el-icon-chicken': '🍗',
  
  // 美妆相关
  'el-icon-magic-stick': '✨',
  'el-icon-coordinate': '💄',
  'el-icon-video-play': '💋',
  
  // 母婴相关
  'el-icon-baby': '👶',
  'el-icon-toy': '🧸',
  'el-icon-cpu': '🍼',
  
  // 图书相关
  'el-icon-book': '📚',
  'el-icon-notebook-2': '📖',
  'el-icon-document': '📄',
  
  // 数码相关
  'el-icon-phone': '📱',
  'el-icon-monitor': '🖥️',
  'el-icon-camera': '📷',
  'el-icon-headset': '🎧',
  
  // 通用图标
  'el-icon-menu': '☰',
  'el-icon-setting': '⚙️',
  'el-icon-info': 'ℹ️',
  'el-icon-question': '❓',
  'el-icon-plus': '➕',
  'el-icon-minus': '➖',
  'el-icon-close': '❌',
  'el-icon-check': '✅',
}

module.exports = {
  elementIconToEmoji
}
