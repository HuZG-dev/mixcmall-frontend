// 测试微信登录路由
const axios = require('axios')

async function testWxLogin() {
  try {
    const response = await axios.post('http://localhost:8081/api/user/wx-login', {
      code: 'test_code',
      userInfo: {
        nickName: '测试用户',
        avatarUrl: 'https://example.com/avatar.png',
        gender: 1
      }
    })
    
    console.log('响应成功:', response.data)
  } catch (error) {
    if (error.response) {
      console.log('HTTP 错误:', error.response.status)
      console.log('响应数据:', error.response.data)
    } else {
      console.log('请求失败:', error.message)
    }
  }
}

testWxLogin()
