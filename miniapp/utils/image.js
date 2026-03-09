// 图片路径处理工具

/**
 * 处理图片路径
 * @param {string} imagePath - 图片相对路径
 * @returns {string} 完整的图片URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return ''
  
  // 如果已经是完整URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 拼接完整URL - 静态资源不需要 /api 前缀
  const baseUrl = 'http://localhost:8080'
  return baseUrl + imagePath
}