<template>
  <div class="users-page">
    <el-card>
      <div slot="header">用户列表</div>
      
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="phone" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              :type="scope.row.status === 1 ? 'danger' : 'success'"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
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
  </div>
</template>

<script>
import { getUsers, updateUserStatus } from '@/api'

export default {
  name: 'Users',
  data() {
    return {
      users: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getUsers({ page: this.page, pageSize: this.pageSize })
        if (res.code === 200) {
          this.users = res.data.list
          this.total = res.data.total
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    async toggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1
      try {
        const res = await updateUserStatus(row.id, newStatus)
        if (res.code === 200) {
          this.$message.success('操作成功')
          this.loadData()
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    handlePageChange(page) {
      this.page = page
      this.loadData()
    }
  }
}
</script>
