<template>
  <div class="categories-page">
    <el-card>
      <div slot="header" class="header">
        <span>分类管理</span>
        <el-button type="primary" size="small" @click="showDialog()">新增分类</el-button>
      </div>
      
      <el-table :data="categories" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="分类名称"></el-table-column>
        <el-table-column prop="icon" label="图标">
          <template slot-scope="scope">
            <i :class="scope.row.icon" v-if="scope.row.icon"></i>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="showDialog(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 分类对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-select v-model="form.icon" placeholder="请选择图标" clearable>
            <el-option label="手机" value="el-icon-mobile-phone"></el-option>
            <el-option label="电脑" value="el-icon-monitor"></el-option>
            <el-option label="冰箱" value="el-icon-refrigerator"></el-option>
            <el-option label="商品" value="el-icon-goods"></el-option>
            <el-option label="礼物" value="el-icon-present"></el-option>
            <el-option label="苹果" value="el-icon-apple"></el-option>
            <el-option label="书籍" value="el-icon-reading"></el-option>
            <el-option label="自行车" value="el-icon-bicycle"></el-option>
            <el-option label="相机" value="el-icon-camera"></el-option>
            <el-option label="购物车" value="el-icon-shopping-cart-2"></el-option>
            <el-option label="咖啡杯" value="el-icon-coffee-cup"></el-option>
            <el-option label="星星" value="el-icon-star-on"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999"></el-input-number>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/api'

export default {
  name: 'Categories',
  data() {
    return {
      categories: [],
      loading: false,
      dialogVisible: false,
      form: {
        id: null,
        name: '',
        icon: '',
        sort: 0,
        status: 1
      },
      rules: {
        name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.form.id ? '编辑分类' : '新增分类'
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getCategories()
        if (res.code === 200) {
          this.categories = res.data
        }
      } catch (e) {
        console.error(e)
      }
      this.loading = false
    },
    showDialog(row) {
      if (row) {
        this.form = {
          id: row.id,
          name: row.name,
          icon: row.icon || '',
          sort: row.sort || 0,
          status: row.status !== undefined ? row.status : 1
        }
      } else {
        this.form = {
          id: null,
          name: '',
          icon: '',
          sort: 0,
          status: 1
        }
      }
      this.dialogVisible = true
    },
    async handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        
        this.loading = true
        try {
          if (this.form.id) {
            await updateCategory(this.form.id, this.form)
            this.$message.success('更新成功')
          } else {
            await addCategory(this.form)
            this.$message.success('添加成功')
          }
          this.dialogVisible = false
          await this.loadData()
        } catch (e) {
          console.error(e)
          this.$message.error('操作失败')
        }
        this.loading = false
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该分类吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        this.loading = true
        try {
          await deleteCategory(row.id)
          this.$message.success('删除成功')
          await this.loadData()
        } catch (e) {
          console.error(e)
          this.$message.error('删除失败')
        }
        this.loading = false
      }).catch(() => {})
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
</style>
