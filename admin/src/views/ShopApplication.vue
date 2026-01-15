<template>
  <div class="shop-application">
    <el-card>
      <div slot="header" class="card-header">
        <span>店铺申请管理</span>
        <div>
          <el-button 
            v-if="!isSuperAdmin && !hasPendingApplication && !hasShop" 
            type="primary" 
            size="small" 
            @click="showApplyDialog"
          >
            申请开店
          </el-button>
          <el-button v-if="!isSuperAdmin && !hasPendingCloseApplication" type="danger" size="small" @click="showCloseDialog">申请关店</el-button>
        </div>
      </div>

      <el-table :data="applicationList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="店铺名称" />
        <el-table-column prop="shop_id" label="店铺ID" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.shop_id">{{ scope.row.shop_id }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="店铺描述" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="logo" label="店铺图片" width="100">
          <template slot-scope="scope">
            <el-image
              v-if="scope.row.logo"
              :src="scope.row.logo"
              :preview-src-list="[scope.row.logo]"
              style="width: 60px; height: 60px"
              fit="cover"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reject_reason" label="拒绝原因" show-overflow-tooltip />
        <el-table-column prop="created_at" label="申请时间" width="180" />
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button v-if="isSuperAdmin && scope.row.status === 0" size="mini" type="success" @click="handleApprove(scope.row)">通过</el-button>
            <el-button v-if="isSuperAdmin && scope.row.status === 3" size="mini" type="success" @click="handleApprove(scope.row)">通过</el-button>
            <el-button v-if="isSuperAdmin && scope.row.status === 0" size="mini" type="warning" @click="handleReject(scope.row)">拒绝</el-button>
            <el-button v-if="scope.row.status === 2" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="isSuperAdmin"
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

    <el-dialog title="申请开店" :visible.sync="applyDialogVisible" width="600px" @close="resetForm">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="店铺名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="店铺描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="店铺图片" prop="logo">
          <div class="image-container">
            <div class="image-preview-box">
              <img v-if="form.logo" :src="form.logo" class="image-preview">
              <div v-else class="image-placeholder">暂无图片</div>
            </div>
            <el-upload
              class="image-upload-btn"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :headers="uploadHeaders"
              name="image"
              accept="image/*"
            >
              <el-button size="small" type="primary">{{ form.logo ? '更换图片' : '上传图片' }}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="applyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交申请</el-button>
      </div>
    </el-dialog>

    <el-dialog title="拒绝申请" :visible.sync="rejectDialogVisible" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectForm" label-width="100px">
        <el-form-item label="拒绝原因" prop="reject_reason">
          <el-input v-model="rejectForm.reject_reason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmReject">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="申请关店" :visible.sync="closeDialogVisible" width="500px">
      <el-form :model="closeForm" :rules="closeRules" ref="closeForm" label-width="100px">
        <el-form-item label="选择店铺" prop="shopId">
          <el-select v-model="closeForm.shopId" placeholder="请选择要关闭的店铺" style="width: 100%">
            <el-option
              v-for="shop in myShops"
              :key="shop.id"
              :label="shop.name"
              :value="shop.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitClose">提交申请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getShopApplications, getMyShopApplications, submitShopApplication, submitCloseShopApplication, approveShopApplication, approveCloseShopApplication, rejectShopApplication, deleteShopApplication } from '@/api/shopApplication'
import { uploadShopImage } from '@/api/shop'
import { getMyShops } from '@/api/shop'

export default {
  name: 'ShopApplication',
  computed: {
    isSuperAdmin() {
      const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
      return userInfo.role === 'super'
    },
    hasShop() {
      return this.myShops.length > 0
    }
  },
  data() {
    return {
      loading: false,
      applicationList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      applyDialogVisible: false,
      rejectDialogVisible: false,
      closeDialogVisible: false,
      hasPendingApplication: false,
      hasPendingCloseApplication: false,
      myShops: [],
      form: {
        name: '',
        description: '',
        logo: '',
        phone: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' }
        ]
      },
      rejectForm: {
        reject_reason: ''
      },
      rejectRules: {
        reject_reason: [
          { required: true, message: '请输入拒绝原因', trigger: 'blur' }
        ]
      },
      closeForm: {
        shopId: ''
      },
      closeRules: {
        shopId: [
          { required: true, message: '请选择要关闭的店铺', trigger: 'change' }
        ]
      },
      currentApplication: null,
      uploadUrl: '/api/admin/shops/image',
      uploadHeaders: {
        'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
      }
    }
  },
  created() {
    this.loadApplications()
    this.loadMyShops()
  },
  methods: {
    async loadApplications() {
      this.loading = true
      try {
        let res
        if (this.isSuperAdmin) {
          res = await getShopApplications({
            page: this.page,
            pageSize: this.pageSize
          })
        } else {
          res = await getMyShopApplications()
        }
        
        if (res.code === 200) {
          if (this.isSuperAdmin) {
            this.applicationList = res.data.list
            this.total = res.data.total
          } else {
            this.applicationList = res.data
            this.hasPendingApplication = res.data.some(app => app.status === 0)
            this.hasPendingCloseApplication = res.data.some(app => app.status === 3)
          }
        } else {
          this.$message.error(res.message || '获取申请列表失败')
        }
      } catch (error) {
        console.error('获取申请列表失败:', error)
        this.$message.error('获取申请列表失败')
      } finally {
        this.loading = false
      }
    },
    async loadMyShops() {
      try {
        const res = await getMyShops()
        if (res.code === 200) {
          this.myShops = res.data
        }
      } catch (error) {
        console.error('获取我的店铺失败:', error)
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadApplications()
    },
    handleCurrentChange(val) {
      this.page = val
      this.loadApplications()
    },
    showApplyDialog() {
      this.form = {
        name: '',
        description: '',
        logo: '',
        phone: ''
      }
      this.applyDialogVisible = true
    },
    showCloseDialog() {
      this.closeForm.shopId = ''
      this.closeDialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const res = await submitShopApplication(this.form)
            if (res.code === 200) {
              this.$message.success('申请提交成功，请等待审核')
              this.applyDialogVisible = false
              this.loadApplications()
            } else {
              this.$message.error(res.message || '申请提交失败')
            }
          } catch (error) {
            console.error('申请提交失败:', error)
            this.$message.error('申请提交失败')
          }
        }
      })
    },
    async handleSubmitClose() {
      this.$refs.closeForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await submitCloseShopApplication(this.closeForm)
            if (res.code === 200) {
              this.$message.success('关闭店铺申请提交成功，请等待审核')
              this.closeDialogVisible = false
              this.loadApplications()
            } else {
              this.$message.error(res.message || '申请提交失败')
            }
          } catch (error) {
            console.error('申请提交失败:', error)
            this.$message.error('申请提交失败')
          }
        }
      })
    },
    resetForm() {
      this.$refs.form.resetFields()
    },
    handleApprove(row) {
      const isCloseApplication = row.status === 3
      const confirmMessage = isCloseApplication ? '确定要通过该关闭店铺申请吗？' : '确定要通过该申请吗？'
      const successMessage = isCloseApplication ? '审核通过，店铺已关闭' : '审核通过，店铺已创建'
      
      this.$confirm(confirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async () => {
        try {
          let res
          if (isCloseApplication) {
            res = await approveCloseShopApplication(row.id)
          } else {
            res = await approveShopApplication(row.id)
          }
          
          if (res.code === 200) {
            this.$message.success(successMessage)
            this.loadApplications()
          } else {
            this.$message.error(res.message || '审核失败')
          }
        } catch (error) {
          console.error('审核失败:', error)
          this.$message.error('审核失败')
        }
      }).catch(() => {})
    },
    handleReject(row) {
      this.currentApplication = row
      this.rejectForm.reject_reason = ''
      this.rejectDialogVisible = true
    },
    handleConfirmReject() {
      this.$refs.rejectForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await rejectShopApplication(this.currentApplication.id, this.rejectForm)
            if (res.code === 200) {
              this.$message.success('已拒绝该申请')
              this.rejectDialogVisible = false
              this.loadApplications()
            } else {
              this.$message.error(res.message || '操作失败')
            }
          } catch (error) {
            console.error('操作失败:', error)
            this.$message.error('操作失败')
          }
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该申请吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteShopApplication(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadApplications()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.form.logo = response.data.image
        this.$message.success('图片上传成功')
      } else {
        this.$message.error(response.message || '图片上传失败')
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
        return false
      }
      return true
    },
    getStatusType(status) {
      const map = {
        0: 'warning',
        1: 'success',
        2: 'danger',
        3: 'warning',
        4: 'info'
      }
      return map[status] || 'info'
    },
    getStatusText(status) {
      const map = {
        0: '待审核',
        1: '已通过',
        2: '已拒绝',
        3: '待审核（关闭店铺）',
        4: '已关闭'
      }
      return map[status] || '未知'
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

.image-container {
  display: flex;
  align-items: center;
  gap: 20px;
}

.image-preview-box {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  color: #999;
  font-size: 12px;
}
</style>
