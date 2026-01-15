<template>
  <div class="products-page">
    <el-card>
      <div slot="header" class="header">
        <span>商品列表</span>
        <el-button 
          type="primary" 
          size="small" 
          @click="showDialog()"
          :disabled="!isSuperAdmin && shops.length === 0"
        >
          {{ !isSuperAdmin && shops.length === 0 ? '请先创建店铺' : '添加商品' }}
        </el-button>
      </div>
      
      <el-table :data="products" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column label="图片" width="100">
          <template slot-scope="scope">
            <img :src="scope.row.image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template slot-scope="scope">¥{{ scope.row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100"></el-table-column>
        <el-table-column prop="sales" label="销量" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="showDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="form.subtitle"></el-input>
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="选择分类">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺" :prop="isSuperAdmin ? '' : 'shop_id'">
          <el-select v-model="form.shop_id" placeholder="选择店铺" clearable :disabled="!isSuperAdmin && shops.length === 0">
            <el-option v-for="s in shops" :key="s.id" :label="s.name" :value="s.id"></el-option>
          </el-select>
          <span v-if="!isSuperAdmin && shops.length === 0" style="color: #f56c6c; font-size: 12px; margin-left: 10px;">请先申请创建店铺</span>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="原价">
          <el-input-number v-model="form.original_price" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="商品图片" prop="image">
          <div class="image-container">
            <div class="image-preview-box">
              <img v-if="form.image" :src="form.image" class="image-preview">
              <div v-else class="image-placeholder">暂无图片</div>
            </div>
            <el-upload
              class="image-upload-btn"
              :action="uploadUrl"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              :headers="uploadHeaders"
              accept="image/*"
            >
              <el-button size="small" type="primary">{{ form.image ? '更换图片' : '上传图片' }}</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="商品描述">
          <el-input type="textarea" v-model="form.description" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="商品详情">
          <quill-editor
            v-model="form.detail"
            ref="myQuillEditor"
            :options="editorOption"
            style="height: 300px;"
          ></quill-editor>
        </el-form-item>
        <el-form-item label="规格参数">
          <div class="specs-container">
            <div v-for="(spec, index) in form.specsList" :key="index" class="spec-item">
              <el-input v-model="spec.key" placeholder="规格名称" style="width: 150px; margin-right: 10px;"></el-input>
              <el-input v-model="spec.value" placeholder="规格值" style="width: 200px; margin-right: 10px;"></el-input>
              <el-button size="mini" type="danger" @click="removeSpec(index)" icon="el-icon-delete">删除</el-button>
            </div>
            <el-button size="small" type="primary" @click="addSpec" icon="el-icon-plus">添加规格</el-button>
          </div>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories, uploadImage } from '@/api'
import { getAllShops, getMyShops } from '@/api/shop'

export default {
  name: 'Products',
  computed: {
    isSuperAdmin() {
      const userInfo = JSON.parse(localStorage.getItem('admin_info') || '{}')
      return userInfo.role === 'super'
    }
  },
  data() {
    return {
      products: [],
      categories: [],
      shops: [],
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      dialogTitle: '添加商品',
      editId: null,
      uploadUrl: '/api/admin/upload',
      uploadHeaders: {
        Authorization: 'Bearer ' + (localStorage.getItem('admin_token') || '')
      },
      form: {
        name: '',
        subtitle: '',
        category_id: '',
        shop_id: '',
        price: 0,
        original_price: 0,
        stock: 0,
        image: '',
        description: '',
        detail: '',
        specsList: [],
        status: 1
      },
      editorOption: {
        placeholder: '请输入商品详情...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image']
          ]
        }
      },
      rules: {
        name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
        price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
        image: [{ required: true, message: '请上传商品图片', trigger: 'change' }],
        shop_id: [
          { 
            validator: (rule, value, callback) => {
              if (!this.isSuperAdmin && !value) {
                callback(new Error('请选择店铺'))
              } else {
                callback()
              }
            }, 
            trigger: 'change' 
          }
        ]
      }
    }
  },
  created() {
    this.loadData()
    this.loadCategories()
    this.loadShops()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getProducts({ page: this.page, pageSize: this.pageSize })
        if (res.code === 200) {
          this.products = res.data.list
          this.total = res.data.total
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    async loadCategories() {
      const res = await getCategories()
      if (res.code === 200) {
        this.categories = res.data
      }
    },
    async loadShops() {
      const res = this.isSuperAdmin ? await getAllShops() : await getMyShops()
      if (res.code === 200) {
        this.shops = res.data
      }
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      if (!isLt5M) {
        this.$message.error('图片大小不能超过5MB')
        return false
      }
      return true
    },
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.form.image = response.data.url
        this.$message.success('上传成功')
      } else {
        this.$message.error(response.message || '上传失败')
      }
    },
    showDialog(row) {
      this.dialogVisible = true
      if (row) {
        this.dialogTitle = '编辑商品'
        this.editId = row.id
        this.form = { 
          ...row, 
          detail: row.detail || '',
          specsList: row.specs ? JSON.parse(row.specs) : [],
          shop_id: row.shop_id || ''
        }
      } else {
        this.dialogTitle = '添加商品'
        this.editId = null
        this.form = { 
          name: '', 
          subtitle: '', 
          category_id: '', 
          shop_id: '',
          price: 0, 
          original_price: 0, 
          stock: 0, 
          image: '', 
          description: '', 
          detail: '',
          specsList: [],
          status: 1 
        }
      }
    },
    addSpec() {
      this.form.specsList.push({ key: '', value: '' })
    },
    removeSpec(index) {
      this.form.specsList.splice(index, 1)
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        try {
          const submitData = {
            ...this.form,
            specs: this.form.specsList.length > 0 ? JSON.stringify(this.form.specsList) : null
          }
          const res = this.editId
            ? await updateProduct(this.editId, submitData)
            : await addProduct(submitData)
          if (res.code === 200) {
            this.$message.success(this.editId ? '更新成功' : '添加成功')
            this.dialogVisible = false
            this.loadData()
          } else {
            this.$message.error(res.message)
          }
        } catch (e) {
          this.$message.error('操作失败')
        }
      })
    },
    async handleDelete(id) {
      await this.$confirm('确定删除该商品?', '提示', { type: 'warning' })
      try {
        const res = await deleteProduct(id)
        if (res.code === 200) {
          this.$message.success('删除成功')
          this.loadData()
        }
      } catch (e) {
        console.error(e)
      }
    },
    handlePageChange(page) {
      this.page = page
      this.loadData()
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-container {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.image-preview-box {
  width: 148px;
  height: 148px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: cover;
}

.image-placeholder {
  width: 148px;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  background-color: #f5f7fa;
}

.image-upload-btn {
  display: inline-block;
}

.specs-container {
  width: 100%;
}

.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
