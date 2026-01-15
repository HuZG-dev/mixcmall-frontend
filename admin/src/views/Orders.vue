<template>
  <div class="orders-page">
    <el-card>
      <div slot="header">订单列表</div>
      
      <el-form :inline="true" style="margin-bottom: 15px">
        <el-form-item label="状态">
          <el-select v-model="filterStatus" clearable placeholder="全部" @change="loadData">
            <el-option label="待付款" value="pending"></el-option>
            <el-option label="已付款" value="paid"></el-option>
            <el-option label="已发货" value="shipped"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      
      <el-table :data="orders" v-loading="loading" style="width: 100%" :expand-row-keys="expandedRowKeys" row-key="id">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div class="order-items">
              <div v-for="item in scope.row.items" :key="item.id" class="order-item">
                <img :src="item.image" :alt="item.name" class="item-image" />
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-specs">{{ item.specs }}</div>
                  <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="order_no" label="订单号" width="200"></el-table-column>
        <el-table-column prop="username" label="用户" width="120"></el-table-column>
        <el-table-column prop="total_quantity" label="商品数" width="80"></el-table-column>
        <el-table-column prop="total_price" label="总金额" width="120">
          <template slot-scope="scope">¥{{ scope.row.total_price }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="showDetail(scope.row)">详情</el-button>
            <el-dropdown v-if="scope.row.status !== 'cancelled' && scope.row.status !== 'completed'" @command="cmd => updateStatus(scope.row.id, cmd)">
              <el-button size="mini">更多<i class="el-icon-arrow-down"></i></el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.status === 'paid'" command="shipped">发货</el-dropdown-item>
                <el-dropdown-item v-if="scope.row.status === 'shipped'" command="completed">完成</el-dropdown-item>
                <el-dropdown-item command="cancelled">取消</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        style="margin-top: 20px; text-align: right"
        @current-change="handlePageChange"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
      ></el-pagination>
    </el-card>

    <el-dialog title="订单详情" :visible.sync="detailVisible" width="800px">
      <div v-if="currentOrder">
        <p><strong>订单号:</strong> {{ currentOrder.order_no }}</p>
        <p><strong>用户:</strong> {{ currentOrder.username }}</p>
        <p><strong>状态:</strong> {{ statusText(currentOrder.status) }}</p>
        <p><strong>下单时间:</strong> {{ currentOrder.created_at }}</p>
        <div v-if="currentOrder.items && currentOrder.items.length > 0" class="order-items-detail">
          <h4>商品清单</h4>
          <div v-for="item in currentOrder.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-specs">{{ item.specs }}</div>
              <div class="item-price">¥{{ item.price }} × {{ item.quantity }}</div>
            </div>
          </div>
          <div class="order-total">
            共 {{ totalItems }} 件商品，合计：<span class="total-price">¥{{ currentOrder.total_price }}</span><span class="freight">（含运费 ¥{{ currentOrder.freight || '0.00' }}）</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getOrders, updateOrderStatus } from '@/api'

export default {
  name: 'Orders',
  data() {
    return {
      orders: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      filterStatus: '',
      detailVisible: false,
      currentOrder: null,
      expandedRowKeys: []
    }
  },
  computed: {
    totalItems() {
      if (!this.currentOrder || !this.currentOrder.items) return 0
      return this.currentOrder.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.filterStatus) params.status = this.filterStatus
        const res = await getOrders(params)
        if (res.code === 200) {
          this.orders = res.data.list
          this.total = res.data.total
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    async updateStatus(id, status) {
      try {
        const res = await updateOrderStatus(id, status)
        if (res.code === 200) {
          this.$message.success('状态更新成功')
          this.loadData()
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    showDetail(row) {
      this.currentOrder = row
      this.detailVisible = true
    },
    handlePageChange(page) {
      this.page = page
      this.loadData()
    },
    statusType(status) {
      const map = { pending: 'warning', paid: 'primary', shipped: '', completed: 'success', cancelled: 'info' }
      return map[status] || ''
    },
    statusText(status) {
      const map = { pending: '待付款', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
      return map[status] || status
    }
  }
}
</script>

<style lang="scss" scoped>
.order-items {
  padding: 10px 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.item-specs {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.item-price {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
}

.order-items-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  
  h4 {
    margin-bottom: 15px;
    color: #333;
  }
}

.order-total {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  text-align: right;
  font-size: 14px;
  color: #666;
  
  .total-price {
    color: #f56c6c;
    font-size: 18px;
    font-weight: bold;
    margin: 0 5px;
  }
  
  .freight {
    color: #999;
    font-size: 12px;
    margin-left: 5px;
  }
}
</style>
