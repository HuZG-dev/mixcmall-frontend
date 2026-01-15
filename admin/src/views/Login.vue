<template>
  <div class="login-container">
    <div class="login-box">
      <h2>万象商城后台管理</h2>
      <el-form :model="form" :rules="rules" ref="loginForm">
        <el-form-item prop="username">
          <el-input v-model="form.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" prefix-icon="el-icon-lock" type="password" placeholder="密码" @keyup.enter.native="handleLogin"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { adminLogin } from '@/api'

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (!valid) return
        this.loading = true
        try {
          const res = await adminLogin(this.form)
          if (res.code === 200) {
            localStorage.setItem('admin_token', res.data.token)
            localStorage.setItem('admin_info', JSON.stringify(res.data.userInfo))
            this.$message.success('登录成功')
            this.$router.push('/dashboard')
          } else {
            this.$message.error(res.message || '登录失败')
          }
        } catch (e) {
          this.$message.error('登录失败')
        }
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
}
.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>
