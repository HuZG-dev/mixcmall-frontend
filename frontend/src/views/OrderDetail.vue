<template>
  <div class="order-detail container">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="!order" class="empty">
      <el-empty description="订单不存在" />
    </div>

    <div v-else>
      <div class="page-header">
        <el-button icon="el-icon-back" @click="goBack">返回</el-button>
        <h2 class="page-title">订单详情</h2>
      </div>

      <div class="order-status-card card">
        <div class="status-icon">
          <i :class="statusIcon[order.status]"></i>
        </div>
        <div class="status-info">
          <h3>{{ statusText[order.status] }}</h3>
          <p v-if="order.status === 'pending'">请在30分钟内完成支付</p>
          <p v-if="order.status === 'paid'">商家正在为您准备商品</p>
          <p v-if="order.status === 'shipped'">商品正在配送中</p>
          <p v-if="order.status === 'completed'">订单已完成</p>
          <p v-if="order.status === 'cancelled'">订单已取消</p>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">订单信息</h3>
        <div class="info-row">
          <span class="label">订单号：</span>
          <span class="value">{{ order.orderNo }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间：</span>
          <span class="value">{{ order.createTime }}</span>
        </div>
        <div class="info-row" v-if="order.payTime">
          <span class="label">支付时间：</span>
          <span class="value">{{ order.payTime }}</span>
        </div>
        <div class="info-row" v-if="order.shipTime">
          <span class="label">发货时间：</span>
          <span class="value">{{ order.shipTime }}</span>
        </div>
        <div class="info-row" v-if="order.completeTime">
          <span class="label">完成时间：</span>
          <span class="value">{{ order.completeTime }}</span>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">商品信息</h3>
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
        <div class="order-total">
          共 {{ order.total_quantity || 0 }} 件商品，合计：
          <span class="total-price">¥{{ order.total_price }}</span>
          <span class="freight">（含运费 ¥{{ order.freight || '0.00' }}）</span>
        </div>
      </div>

      <div class="card">
        <h3 class="section-title">支付信息</h3>
        <div class="info-row">
          <span class="label">支付方式：</span>
          <span class="value">{{ paymentMethodText[order.paymentMethod] }}</span>
        </div>
      </div>

      <div class="card" v-if="order.remark">
        <h3 class="section-title">订单备注</h3>
        <p class="remark">{{ order.remark }}</p>
      </div>

      <div class="order-actions">
        <template v-if="order.status === 'pending'">
          <el-button @click="cancelOrder">取消订单</el-button>
          <el-button type="danger" @click="payOrder">立即付款</el-button>
        </template>
        <template v-if="order.status === 'shipped'">
          <el-button type="primary" @click="confirmReceive">确认收货</el-button>
        </template>
        <template v-if="order.status === 'completed' || order.status === 'cancelled'">
          <el-button @click="deleteOrder">删除订单</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrderById, cancelOrder, payOrder, confirmOrder, deleteOrder } from '@/api/order'

export default {
  name: 'OrderDetail',
  data() {
    return {
      loading: true,
      order: null,
      statusText: {
        pending: '待付款',
        paid: '待发货',
        shipped: '待收货',
        completed: '已完成',
        cancelled: '已取消'
      },
      statusIcon: {
        pending: 'el-icon-time',
        paid: 'el-icon-goods',
        shipped: 'el-icon-truck',
        completed: 'el-icon-circle-check',
        cancelled: 'el-icon-circle-close'
      },
      paymentMethodText: {
        alipay: '支付宝',
        wechat: '微信支付',
        balance: '余额支付'
      }
    }
  },
  async created() {
    await this.loadOrder()
  },
  methods: {
    async loadOrder() {
      try {
        this.loading = true
        const orderId = this.$route.params.id
        const res = await getOrderById(orderId)
        if (res.code === 200) {
          this.order = res.data
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
    goBack() {
      this.$router.back()
    },
    async cancelOrder() {
      this.$confirm('确定要取消该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await cancelOrder(this.order.id)
          if (res.code === 200) {
            this.$message.success('订单已取消')
            await this.loadOrder()
          } else {
            this.$message.error(res.message || '取消订单失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          this.$message.error('取消订单失败')
        }
      }).catch(() => {})
    },
    async payOrder() {
      this.$confirm('确定要支付该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const res = await payOrder(this.order.id, this.order.paymentMethod)
          if (res.code === 200) {
            this.$message.success('支付成功')
            await this.loadOrder()
          } else {
            this.$message.error(res.message || '支付失败')
          }
        } catch (error) {
          console.error('支付失败:', error)
          this.$message.error('支付失败')
        }
      }).catch(() => {})
    },
    async confirmReceive() {
      this.$confirm('确定已收到商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await confirmOrder(this.order.id)
          if (res.code === 200) {
            this.$message.success('确认收货成功')
            await this.loadOrder()
          } else {
            this.$message.error(res.message || '确认收货失败')
          }
        } catch (error) {
          console.error('确认收货失败:', error)
          this.$message.error('确认收货失败')
        }
      }).catch(() => {})
    },
    async deleteOrder() {
      this.$confirm('确定要删除该订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteOrder(this.order.id)
          if (res.code === 200) {
            this.$message.success('订单已删除')
            this.$router.push('/orders')
          } else {
            this.$message.error(res.message || '删除订单失败')
          }
        } catch (error) {
          console.error('删除订单失败:', error)
          this.$message.error('删除订单失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
.order-detail {
  padding: 20px 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.loading,
.empty {
  padding: 40px 0;
}

.order-status-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px;
  margin-bottom: 20px;

  .status-icon {
    font-size: 48px;
    color: #409eff;
  }

  .status-info {
    h3 {
      font-size: 20px;
      margin: 0 0 8px 0;
    }

    p {
      margin: 0;
      color: #909399;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .label {
    width: 100px;
    color: #909399;
  }

  .value {
    flex: 1;
    color: #303133;
  }
}

.order-products {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

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
      margin: 0 0 5px 0;
    }

    .item-specs {
      font-size: 12px;
      color: #909399;
      margin: 0;
    }
  }

  .item-price {
    width: 80px;
    text-align: right;
    color: #f56c6c;
  }

  .item-quantity {
    width: 60px;
    text-align: right;
    color: #909399;
  }
}

.order-total {
  padding: 15px;
  text-align: right;
  background-color: #f9f9f9;

  .total-price {
    font-size: 18px;
    color: #f56c6c;
    font-weight: 600;
  }

  .freight {
    color: #909399;
    font-size: 12px;
  }
}

.remark {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin: 0;
  color: #606266;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
