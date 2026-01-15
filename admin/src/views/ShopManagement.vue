<template>
  <div class="shop-management">
    <el-card>
      <div slot="header" class="card-header">
        <span>店铺管理</span>
        <el-button v-if="isSuperAdmin" type="primary" size="small" @click="showAddDialog">添加店铺</el-button>
      </div>

      <el-table :data="shopList" border style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="店铺名称" />
        <el-table-column prop="description" label="店铺描述" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button size="mini" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button v-if="isSuperAdmin" size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="resetForm">
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
        <el-form-item label="状态" prop="status" v-if="isEdit">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getShops, addShop, updateShop, deleteShop, uploadShopImage } from '@/api/shop'

export default {
  name: 'ShopManagement',
  computed: {
    isSuperAdmin() {
      const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
      return userInfo.role === 'super'
    }
  },
  data() {
    return {
      loading: false,
      shopList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '',
      isEdit: false,
      form: {
        id: null,
        name: '',
        description: '',
        logo: '',
        phone: '',
        status: 1
      },
      rules: {
        name: [
          { required: true, message: '请输入店铺名称', trigger: 'blur' }
        ]
      },
      uploadUrl: '/api/admin/shops/image',
      uploadHeaders: {
        'Authorization': 'Bearer ' + localStorage.getItem('admin_token')
      }
    }
  },
  created() {
    this.loadShops()
  },
  methods: {
    async loadShops() {
      this.loading = true
      try {
        const res = await getShops({
          page: this.page,
          pageSize: this.pageSize
        })
        if (res.code === 200) {
          this.shopList = res.data.list
          this.total = res.data.total
        } else {
          this.$message.error(res.message || '获取店铺列表失败')
        }
      } catch (error) {
        console.error('获取店铺列表失败:', error)
        this.$message.error('获取店铺列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.loadShops()
    },
    handleCurrentChange(val) {
      this.page = val
      this.loadShops()
    },
    showAddDialog() {
      this.dialogTitle = '添加店铺'
      this.isEdit = false
      this.form = {
        id: null,
        name: '',
        description: '',
        logo: '',
        phone: '',
        status: 1
      }
      this.dialogVisible = true
    },
    showEditDialog(row) {
      this.dialogTitle = '编辑店铺'
      this.isEdit = true
      this.form = {
        id: row.id,
        name: row.name,
        description: row.description,
        logo: row.logo,
        phone: row.phone,
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
              res = await updateShop(this.form.id, {
                name: this.form.name,
                description: this.form.description,
                logo: this.form.logo,
                phone: this.form.phone,
                status: this.form.status
              })
            } else {
              res = await addShop({
                name: this.form.name,
                description: this.form.description,
                logo: this.form.logo,
                phone: this.form.phone
              })
            }

            if (res.code === 200) {
              this.$message.success(this.isEdit ? '更新成功' : '添加成功')
              this.dialogVisible = false
              this.loadShops()
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
    handleDelete(row) {
      this.$confirm('确定要删除该店铺吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteShop(row.id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            this.loadShops()
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
