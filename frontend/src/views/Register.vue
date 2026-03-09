<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card card">
        <h2 class="register-title">用户注册</h2>
        <el-form ref="registerForm" :model="registerForm" :rules="rules" label-width="0">
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              prefix-icon="el-icon-mobile-phone"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="code">
            <div class="code-input">
              <el-input
                v-model="registerForm.code"
                placeholder="请输入验证码"
                prefix-icon="el-icon-message"
                size="large"
              />
              <el-button
                :disabled="countdown > 0"
                size="large"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s后重新获取` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20位）"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              prefix-icon="el-icon-lock"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item prop="agree">
            <el-checkbox v-model="registerForm.agree">
              我已阅读并同意 <el-link type="primary">《用户协议》</el-link> 和 <el-link type="primary">《隐私政策》</el-link>
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="register-btn"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-footer">
          <span>已有账号？</span>
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { register } from '@/api/user'

export default {
  name: 'Register',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
    const validateAgree = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请阅读并同意用户协议'))
      } else {
        callback()
      }
    }
    return {
      registerForm: {
        username: '',
        phone: '',
        code: '',
        password: '',
        confirmPassword: '',
        agree: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度为3-20位', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { len: 6, message: '验证码为6位数字', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        agree: [
          { validator: validateAgree, trigger: 'change' }
        ]
      },
      loading: false,
      countdown: 0
    }
  },
  methods: {
    sendCode() {
      if (!this.registerForm.phone) {
        this.$message.warning('请先输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      
      // 模拟发送验证码（实际项目中应该调用发送验证码的API）
      this.$message.success('验证码已发送')
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    async handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        if (!valid) return
        
        this.loading = true
        try {
          const res = await register({
            username: this.registerForm.username,
            phone: this.registerForm.phone,
            password: this.registerForm.password
          })
          
          if (res.code === 200) {
            this.$message.success('注册成功，请登录')
            this.$router.push('/login')
          } else {
            this.$message.error(res.message || '注册失败，请重试')
          }
        } catch (error) {
          console.error('注册失败:', error)
          this.$message.error('注册失败，请重试')
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

.register-page {
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 15px;
}

.register-container {
  width: 100%;
  max-width: 420px;
}

.register-card {
  padding: 40px;
}

.register-title {
  text-align: center;
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

.code-input {
  display: flex;
  gap: 10px;
  
  .el-input {
    flex: 1;
  }
  
  .el-button {
    width: 140px;
  }
}

.register-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  
  a {
    color: $primary-color;
    margin-left: 5px;
  }
}
</style>
