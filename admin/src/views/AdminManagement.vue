<template>
  <div class="admin-management">
    <el-card>
      <div slot="header" class="card-header">
        <span>管理员管理</span>
        <el-button type="primary" size="small" @click="showAddDialog">添加管理员</el-button>
      </div>

      <el-table :data="adminList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === 'super' ? 'danger' : 'primary'">
              {{ scope.row.role === 'super' ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250">
          <template slot-scope="scope">
            <el-button size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="warning" @click="showResetPasswordDialog(scope.row)">重置密码</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row)" :disabled="scope.row.id === currentAdminId">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" :disabled="form.id === currentAdminId">
            <el-option label="超级管理员" value="super" />
            <el-option label="普通管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="重置密码" :visible.sync="resetPasswordVisible" width="400px" @close="resetPasswordForm">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="passwordForm.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdmins, addAdmin, updateAdmin, deleteAdmin, resetAdminPassword } from '@/api/admin'

export default {
  name: 'AdminManagement',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      adminList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      form: {
        id: null,
        username: '',
        password: '',
        role: 'admin',
        status: 1
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      resetPasswordVisible: false,
      passwordForm: {
        id: null,
        password: '',
        confirmPassword: ''
      },
      passwordRules: {
        password: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      },
      currentAdminId: null
    }
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
    this.currentAdminId = userInfo.id
    this.loadAdmins()
  },
  methods: {
    async loadAdmins() {
      this.loading = true
      try {
        const res = await getAdmins({
          page: this.page,
          pageSize: this.pageSize
        })
        if (res.code === 200) {
          this.adminList = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.message || '获取管理员列表失败')
        }
      } catch (error) {
        console.error('获取管理员列表失败:', error)
        this.$message.error('获取管理员列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadAdmins()
    },
    handleCurrentChange(val) {
      this.page = val
      this.loadAdmins()
    },
    showAddDialog() {
      this.dialogTitle = '添加管理员'
      this.isEdit = false
      this.form = {
        id: null,
        username: '',
        password: '',
        role: 'admin',
        status: 1
      }
      this.dialogVisible = true
    },
    showEditDialog(row) {
      this.dialogTitle = '编辑管理员'
      this.isEdit = true
      this.form = {
        id: row.id,
        username: row.username,
        role: row.role,
        status: row.status
      }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            let res
            if (this.isEdit) {
              res = await updateAdmin(this.form.id, {
                role: this.form.role,
                status: this.form.status
              })
            } else {
              res = await addAdmin({
                username: this.form.username,
                password: this.form.password,
                role: this.form.role
              })
            }

            if (res.code === 200) {
              this.$message.success(this.isEdit ? '更新成功' : '添加成功')
              this.dialogVisible = false
              this.loadAdmins()
            } else {
              this.$message.error(res.message || (this.isEdit ? '更新失败' : '添加失败'))
            }
          } catch (error) {
            console.error('操作失败:', error)
            this.$message.error(this.isEdit ? '更新失败' : '添加失败')
          }
        }
      })
    },
    resetForm() {
      this.$refs.form.resetFields()
    },
    showResetPasswordDialog(row) {
      this.passwordForm = {
        id: row.id,
        password: '',
        confirmPassword: ''
      }
      this.resetPasswordVisible = true
    },
    async handleResetPassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await resetAdminPassword(this.passwordForm.id, {
              password: this.passwordForm.password
            })
            if (res.code === 200) {
              this.$message.success('重置成功')
              this.resetPasswordVisible = false
            } else {
              this.$message.error(res.message || '重置失败')
            }
          } catch (error) {
            console.error('重置密码失败:', error)
            this.$message.error('重置失败')
          }
        }
      })
    },
    resetPasswordForm() {
      this.$refs.passwordForm.resetFields()
    },
    handleDelete(row) {
      this.$confirm('确定要删除该管理员吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteAdmin(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadAdmins()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
