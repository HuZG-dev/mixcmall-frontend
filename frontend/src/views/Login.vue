<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card card">
        <h2 class="login-title">用户登录</h2>
        <el-form ref="loginForm" :model="loginForm" :rules="rules" label-width="0">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名/手机号"
              prefix-icon="el-icon-user"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
              <el-link type="primary">忘记密码？</el-link>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-footer">
          <span>还没有账号？</span>
          <router-link to="/register">立即注册</router-link>
        </div>
        
        <div class="third-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="third-icons">
            <i class="el-icon-chat-dot-round" title="微信登录"></i>
            <i class="el-icon-message" title="QQ登录"></i>
            <i class="el-icon-mobile-phone" title="手机验证码登录"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        remember: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    ...mapActions('user', ['login', 'getUserInfo']),
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        
        this.loading = true
        try {
          const res = await this.login({
            username: this.loginForm.username,
            password: this.loginForm.password
          })
          
          if (res.code === 200) {
            await this.getUserInfo()
            this.$message.success('登录成功')
            const redirect = this.$route.query.redirect || '/'
            this.$router.push(redirect)
          }
        } catch (error) {
          this.$message.error('登录失败，请重试')
        } finally {
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.login-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 15px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  padding: 40px;
}

.login-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  
  a {
    color: $primary-color;
    margin-left: 5px;
  }
}

.third-login {
  margin-top: 30px;
  
  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    &::before, &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e0e0e0;
    }
    
    span {
      padding: 0 15px;
      color: #999;
      font-size: 12px;
    }
  }
  
  .third-icons {
    display: flex;
    justify-content: center;
    gap: 30px;
    
    i {
      font-size: 28px;
      color: #666;
      cursor: pointer;
      transition: color 0.3s;
      
      &:hover {
        color: $primary-color;
      }
    }
  }
}
</style>
