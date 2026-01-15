import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/components/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '控制台' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '商品管理' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'shops',
        name: 'Shops',
        component: () => import('@/views/ShopManagement.vue'),
        meta: { title: '店铺管理' }
      },
      {
        path: 'shop-applications',
        name: 'ShopApplications',
        component: () => import('@/views/ShopApplication.vue'),
        meta: { title: '店铺申请' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue'),
        meta: { title: '分类管理', roles: ['super'] }
      },
      {
        path: 'admins',
        name: 'AdminManagement',
        component: () => import('@/views/AdminManagement.vue'),
        meta: { title: '管理员管理', roles: ['super'] }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    // 检查角色权限
    const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
    const userRole = userInfo.role || 'admin'
    
    // 如果路由有角色限制，检查用户角色
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      // 如果没有权限，重定向到控制台
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
