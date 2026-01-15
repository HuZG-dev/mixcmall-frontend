<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="userRole === 'super' ? 6 : 12">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #409EFF"><i class="el-icon-goods"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.productCount }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="userRole === 'super' ? 6 : 12">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #67C23A"><i class="el-icon-s-order"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" v-if="userRole === 'super'">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #E6A23C"><i class="el-icon-user"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" v-if="userRole === 'super'">
        <el-card class="stat-card">
          <div class="stat-icon" style="background: #F56C6C"><i class="el-icon-money"></i></div>
          <div class="stat-info">
            <div class="stat-value">¥{{ stats.totalSales }}</div>
            <div class="stat-label">销售总额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <div slot="header">最近30天订单趋势</div>
          <v-chart :option="orderTrendOption" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px" v-if="userRole === 'super'">
      <el-col :span="12">
        <el-card>
          <div slot="header">订单状态分布</div>
          <v-chart :option="statusPieOption" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">分类销售统计</div>
          <v-chart :option="categoryBarOption" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <div slot="header">最近订单</div>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号" width="200"></el-table-column>
        <el-table-column prop="username" label="用户"></el-table-column>
        <el-table-column prop="total_price" label="金额">
          <template slot-scope="scope">¥{{ scope.row.total_price }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <el-tag :type="statusType(scope.row.status)">{{ statusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getDashboardStats } from '@/api'

export default {
  name: 'Dashboard',
  data() {
    return {
      userRole: 'admin',
      stats: {
        productCount: 0,
        orderCount: 0,
        userCount: 0,
        totalSales: 0
      },
      recentOrders: [],
      chartData: {
        orderTrend: [],
        statusDistribution: [],
        categorySales: []
      },
      orderTrendOption: {},
      statusPieOption: {},
      categoryBarOption: {}
    }
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
    this.userRole = userInfo.role || 'admin'
    this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        const res = await getDashboardStats()
        if (res.code === 200) {
          this.stats = res.data.stats
          this.recentOrders = res.data.recentOrders
          this.chartData = res.data.chartData || {}
          this.initCharts()
        }
      } catch (e) {
        console.error(e)
      }
    },
    initCharts() {
      // 订单趋势图
      this.orderTrendOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['订单数量', '销售金额']
        },
        xAxis: {
          type: 'category',
          data: this.chartData.orderTrend.map(item => {
            const date = new Date(item.date)
            return `${date.getMonth() + 1}-${date.getDate()}`
          })
        },
        yAxis: [
          {
            type: 'value',
            name: '订单数',
            position: 'left'
          },
          {
            type: 'value',
            name: '金额(元)',
            position: 'right'
          }
        ],
        series: [
          {
            name: '订单数量',
            type: 'line',
            data: this.chartData.orderTrend.map(item => item.count),
            smooth: true,
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '销售金额',
            type: 'line',
            yAxisIndex: 1,
            data: this.chartData.orderTrend.map(item => parseFloat(item.amount)),
            smooth: true,
            itemStyle: { color: '#67C23A' }
          }
        ]
      }

      // 订单状态分布饼图
      const statusMap = {
        pending: '待付款',
        paid: '已付款',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
      }
      this.statusPieOption = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.chartData.statusDistribution.map(item => statusMap[item.status] || item.status)
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            data: this.chartData.statusDistribution.map(item => ({
              value: item.count,
              name: statusMap[item.status] || item.status
            }))
          }
        ]
      }

      // 分类销售统计柱状图
      this.categoryBarOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['销售额', '销售数量']
        },
        xAxis: {
          type: 'category',
          data: this.chartData.categorySales.map(item => item.category_name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额(元)',
            position: 'left'
          },
          {
            type: 'value',
            name: '数量',
            position: 'right'
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'bar',
            data: this.chartData.categorySales.map(item => parseFloat(item.total_amount)),
            itemStyle: { color: '#409EFF' }
          },
          {
            name: '销售数量',
            type: 'bar',
            yAxisIndex: 1,
            data: this.chartData.categorySales.map(item => item.total_quantity),
            itemStyle: { color: '#67C23A' }
          }
        ]
      }
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

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  padding: 10px;
}
.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}
.stat-icon i {
  font-size: 28px;
  color: #fff;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.stat-label {
  font-size: 14px;
  color: #999;
}
</style>
