<template>
  <el-container class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <h2>万象商城</h2>
        <span>后台管理</span>
      </div>
      <el-menu
        :default-active="$route.path"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-s-home"></i>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <i class="el-icon-goods"></i>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <i class="el-icon-s-order"></i>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/shops">
          <i class="el-icon-office-building"></i>
          <span>店铺管理</span>
        </el-menu-item>
        <el-menu-item index="/shop-applications">
          <i class="el-icon-document"></i>
          <span>{{ userRole === 'super' ? '店铺申请' : '我的申请' }}</span>
        </el-menu-item>
        <el-menu-item index="/categories" v-if="userRole === 'super'">
          <i class="el-icon-menu"></i>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/users" v-if="userRole === 'super'">
          <i class="el-icon-user"></i>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admins" v-if="userRole === 'super'">
          <i class="el-icon-s-custom"></i>
          <span>管理员管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <span class="page-title">{{ $route.meta.title }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <i class="el-icon-user-solid"></i> {{ username }}
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Layout',
  data() {
    return {
      userRole: 'admin',
      username: ''
    }
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
    this.userRole = userInfo.role || 'admin'
    this.username = userInfo.username || ''
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.layout {
  height: 100%;
}
.aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  border-bottom: 1px solid #3a4a5c;
}
.logo h2 {
  font-size: 18px;
  margin: 0;
}
.logo span {
  font-size: 12px;
  color: #bfcbd9;
}
.header {
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.page-title {
  font-size: 18px;
  font-weight: 500;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
.main {
  background: #f0f2f5;
}
</style>
