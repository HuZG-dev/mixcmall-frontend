<template>
  <div class="orders-page container">
    <h2 class="page-title">我的订单</h2>
    
    <!-- 订单状态筛选 -->
    <div class="order-tabs">
      <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
        <el-tab-pane label="全部订单" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="待发货" name="paid" />
        <el-tab-pane label="待收货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
      </el-tabs>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-wrap">
      <el-skeleton :rows="3" animated />
    </div>
    
    <!-- 订单列表 -->
    <div v-else-if="orders.length > 0" class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card card">
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-time">{{ order.createTime }}</span>
          <span class="order-status" :class="order.status">{{ statusText[order.status] }}</span>
        </div>
        
        <div class="order-products">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-specs">{{ item.specs }}</p>
            </div>
            <div class="item-price">¥{{ item.price }}</div>
            <div class="item-quantity">x{{ item.quantity }}</div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            共 {{ order.total_quantity || 0 }} 件商品，合计：
            <span class="total-price">¥{{ order.total_price }}</span>
            <span class="freight">（含运费 ¥{{ order.freight || '0.00' }}）</span>
          </div>
          <div class="order-actions">
            <template v-if="order.status === 'pending'">
              <el-button size="small" @click="cancelOrder(order.id)">取消订单</el-button>
              <el-button type="danger" size="small" @click="payOrder(order.id)">立即付款</el-button>
            </template>
            <template v-if="order.status === 'shipped'">
              <el-button size="small" @click="viewLogistics(order.id)">查看物流</el-button>
              <el-button type="primary" size="small" @click="confirmReceive(order.id)">确认收货</el-button>
            </template>
            <template v-if="order.status === 'completed'">
              <el-button size="small" @click="reviewOrder(order.id)">评价</el-button>
              <el-button size="small" @click="buyAgain(order)">再次购买</el-button>
            </template>
            <el-button type="text" @click="viewDetail(order.id)">订单详情</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-empty v-else description="暂无订单" />
    
    <!-- 分页 -->
    <div v-if="orders.length > 0" class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { getOrders, cancelOrder, payOrder, confirmOrder } from '@/api/order'

export default {
  name: 'Orders',
  data() {
    return {
      activeStatus: 'all',
      orders: [],
      statusText: {
        pending: '待付款',
        paid: '待发货',
        shipped: '待收货',
        completed: '已完成',
        cancelled: '已取消'
      },
      total: 0,
      pageSize: 10,
      currentPage: 1,
      loading: false
    }
  },
  async created() {
    await this.loadOrders()
  },
  methods: {
    handleTabClick(tab) {
      this.currentPage = 1
      this.loadOrders()
    },
    async loadOrders() {
      try {
        this.loading = true
        const res = await getOrders({
          page: this.currentPage,
          pageSize: this.pageSize,
          status: this.activeStatus
        })
        
        if (res.code === 200) {
          this.orders = res.data.list || []
          this.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '加载订单失败')
        }
      } catch (error) {
        console.error('加载订单失败:', error)
        this.$message.error('加载订单失败')
      } finally {
        this.loading = false
      }
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadOrders()
    },
    async cancelOrder(orderId) {
      this.$confirm('确定要取消该订单吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await cancelOrder(orderId)
          if (res.code === 200) {
            this.$message.success('订单已取消')
            await this.loadOrders()
          } else {
            this.$message.error(res.message || '取消订单失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          this.$message.error('取消订单失败')
        }
      }).catch(() => {})
    },
    async payOrder(orderId) {
      this.$confirm('确定要支付该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const res = await payOrder(orderId, 'alipay')
          if (res.code === 200) {
            this.$message.success('支付成功')
            await this.loadOrders()
          } else {
            this.$message.error(res.message || '支付失败')
          }
        } catch (error) {
          console.error('支付失败:', error)
          this.$message.error('支付失败')
        }
      }).catch(() => {})
    },
    viewLogistics(orderId) {
      this.$message.info('查看物流信息')
    },
    async confirmReceive(orderId) {
      this.$confirm('确认已收到商品？', '提示', {
        type: 'info'
      }).then(async () => {
        try {
          const res = await confirmOrder(orderId)
          if (res.code === 200) {
            this.$message.success('已确认收货')
            await this.loadOrders()
          } else {
            this.$message.error(res.message || '确认收货失败')
          }
        } catch (error) {
          console.error('确认收货失败:', error)
          this.$message.error('确认收货失败')
        }
      }).catch(() => {})
    },
    reviewOrder(orderId) {
      this.$message.info('跳转到评价页面')
    },
    buyAgain(order) {
      this.$message.info('商品已加入购物车')
    },
    viewDetail(orderId) {
      this.$router.push(`/orders/${orderId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.orders-page {
  padding: 20px 15px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.order-tabs {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #f9f9f9;
  border-radius: 8px 8px 0 0;
  
  .order-no {
    font-size: 14px;
    color: #333;
  }
  
  .order-time {
    font-size: 12px;
    color: #999;
    margin-left: 30px;
  }
  
  .order-status {
    margin-left: auto;
    font-size: 14px;
    font-weight: bold;
    
    &.pending { color: #e6a23c; }
    &.paid { color: #409eff; }
    &.shipped { color: $primary-color; }
    &.completed { color: #67c23a; }
    &.cancelled { color: #999; }
  }
}

.order-products {
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  
  .item-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 15px;
  }
  
  .item-info {
    flex: 1;
    
    .item-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
    }
    
    .item-specs {
      font-size: 12px;
      color: #999;
    }
  }
  
  .item-price {
    width: 100px;
    text-align: center;
    font-size: 14px;
    color: #333;
  }
  
  .item-quantity {
    width: 80px;
    text-align: center;
    font-size: 14px;
    color: #666;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  
  .order-total {
    font-size: 14px;
    color: #666;
    
    .total-price {
      font-size: 18px;
      color: #f56c6c;
      font-weight: bold;
    }
    
    .freight {
      font-size: 12px;
      color: #999;
    }
  }
  
  .order-actions {
    display: flex;
    gap: 10px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.loading-wrap {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}
</style>
