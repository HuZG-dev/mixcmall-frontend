<template>
  <header class="header">
    <div class="header-content container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-text">万象商城</span>
      </router-link>
      
      <!-- 搜索栏 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品、店铺"
          @keyup.enter.native="handleSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
      
      <!-- 导航 -->
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/products" class="nav-item">全部商品</router-link>
        <router-link to="/cart" class="nav-item cart-link">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <i class="el-icon-shopping-cart-2"></i>
            <span>购物车</span>
          </el-badge>
        </router-link>
        
        <template v-if="isLoggedIn">
          <el-dropdown @command="handleCommand">
            <span class="nav-item user-dropdown">
              <i class="el-icon-user"></i>
              {{ username }}
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="user">个人中心</el-dropdown-item>
              <el-dropdown-item command="orders">我的订单</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="nav-item">注册</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Header',
  data() {
    return {
      searchKeyword: ''
    }
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn', 'username']),
    ...mapGetters('cart', ['cartCount'])
  },
  mounted() {
    // 加载购物车数据
    this.getCart()
  },
  methods: {
    ...mapActions('user', ['logout']),
    ...mapActions('cart', ['getCart']),
    handleSearch() {
      if (this.searchKeyword.trim()) {
        this.$router.push({
          path: '/products',
          query: { keyword: this.searchKeyword }
        })
      }
    },
    async handleCommand(command) {
      switch (command) {
        case 'user':
          this.$router.push('/user')
          break
        case 'orders':
          this.$router.push('/orders')
          break
        case 'logout':
          try {
            await this.logout()
            this.$message.success('退出成功')
            this.$router.push('/')
          } catch (error) {
            // 即使出错也清除本地状态并跳转
            this.$message.success('已退出登录')
            this.$router.push('/')
          }
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  
  .logo-text {
    font-size: 24px;
    font-weight: bold;
    color: $primary-color;
  }
}

.search-box {
  flex: 1;
  max-width: 400px;
  margin: 0 40px;
  
  .el-input {
    ::v-deep .el-input-group__append {
      background-color: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
  }
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 20px;
  
  .nav-item {
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.3s;
    
    &:hover {
      color: $primary-color;
    }
    
    &.router-link-exact-active {
      color: $primary-color;
    }
  }
  
  .cart-link {
    display: flex;
    align-items: center;
    gap: 4px;
    
    i {
      font-size: 18px;
    }
  }
  
  .user-dropdown {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
