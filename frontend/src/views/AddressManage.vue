<template>
  <div class="address-manage container">
    <div class="page-header">
      <h2 class="page-title">收货地址管理</h2>
      <el-button type="primary" @click="showAddDialog">添加新地址</el-button>
    </div>

    <div v-if="loading" class="loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else-if="addresses.length === 0" class="empty">
      <el-empty description="暂无收货地址">
        <el-button type="primary" @click="showAddDialog">添加地址</el-button>
      </el-empty>
    </div>

    <div v-else class="address-list">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        :class="['address-card', { default: addr.is_default }]"
      >
        <div class="address-content">
          <div class="address-header">
            <span class="name">{{ addr.name }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <el-tag v-if="addr.is_default" type="success" size="small">默认</el-tag>
          </div>
          <div class="address-detail">
            {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
          </div>
        </div>
        <div class="address-actions">
          <el-button
            v-if="!addr.is_default"
            type="text"
            size="small"
            @click="setDefault(addr.id)"
          >
            设为默认
          </el-button>
          <el-button type="text" size="small" @click="editAddress(addr)">编辑</el-button>
          <el-button type="text" size="small" @click="deleteAddress(addr.id)">删除</el-button>
        </div>
      </div>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="addressForm"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            :props="{ expandTrigger: 'hover' }"
            placeholder="请选择省/市/区"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="form.is_default" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAddressList, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'

export default {
  name: 'AddressManage',
  data() {
    return {
      loading: true,
      addresses: [],
      dialogVisible: false,
      dialogTitle: '添加地址',
      submitting: false,
      editingId: null,
      redirectPath: null,
      form: {
        name: '',
        phone: '',
        region: [],
        detail: '',
        is_default: false
      },
      rules: {
        name: [
          { required: true, message: '请输入收货人姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请选择地区', trigger: 'change' }
        ],
        detail: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      regionOptions: [
        {
          value: '北京市',
          label: '北京市',
          children: [
            {
              value: '东城区',
              label: '东城区'
            },
            {
              value: '西城区',
              label: '西城区'
            },
            {
              value: '朝阳区',
              label: '朝阳区'
            },
            {
              value: '海淀区',
              label: '海淀区'
            },
            {
              value: '丰台区',
              label: '丰台区'
            }
          ]
        },
        {
          value: '上海市',
          label: '上海市',
          children: [
            {
              value: '黄浦区',
              label: '黄浦区'
            },
            {
              value: '徐汇区',
              label: '徐汇区'
            },
            {
              value: '长宁区',
              label: '长宁区'
            },
            {
              value: '静安区',
              label: '静安区'
            },
            {
              value: '浦东新区',
              label: '浦东新区'
            }
          ]
        },
        {
          value: '广东省',
          label: '广东省',
          children: [
            {
              value: '广州市',
              label: '广州市',
              children: [
                { value: '天河区', label: '天河区' },
                { value: '越秀区', label: '越秀区' },
                { value: '海珠区', label: '海珠区' },
                { value: '白云区', label: '白云区' }
              ]
            },
            {
              value: '深圳市',
              label: '深圳市',
              children: [
                { value: '南山区', label: '南山区' },
                { value: '福田区', label: '福田区' },
                { value: '罗湖区', label: '罗湖区' },
                { value: '宝安区', label: '宝安区' }
              ]
            }
          ]
        }
      ]
    }
  },
  async created() {
    this.redirectPath = this.$route.query.redirect
    await this.loadAddresses()
  },
  methods: {
    async loadAddresses() {
      try {
        this.loading = true
        const res = await getAddressList()
        if (res.code === 200) {
          this.addresses = res.data || []
        }
      } catch (error) {
        this.$message.error('加载地址失败')
      } finally {
        this.loading = false
      }
    },
    showAddDialog() {
      this.dialogTitle = '添加地址'
      this.editingId = null
      this.dialogVisible = true
    },
    editAddress(addr) {
      this.dialogTitle = '编辑地址'
      this.editingId = addr.id
      this.form = {
        name: addr.name,
        phone: addr.phone,
        region: [addr.province, addr.city, addr.district],
        detail: addr.detail,
        is_default: addr.is_default
      }
      this.dialogVisible = true
    },
    async submitForm() {
      this.$refs.addressForm.validate(async (valid) => {
        if (!valid) return

        try {
          this.submitting = true
          const data = {
            name: this.form.name,
            phone: this.form.phone,
            province: this.form.region[0],
            city: this.form.region[1] || this.form.region[0],
            district: this.form.region[2] || '',
            detail: this.form.detail,
            isDefault: this.form.is_default
          }

          let res
          if (this.editingId) {
            res = await updateAddress(this.editingId, data)
          } else {
            res = await createAddress(data)
          }

          if (res.code === 200) {
            this.$message.success(this.editingId ? '修改成功' : '添加成功')
            this.dialogVisible = false
            await this.loadAddresses()
            
            if (this.redirectPath && !this.editingId) {
              this.$router.push(this.redirectPath)
            }
          } else {
            this.$message.error(res.message || '操作失败')
          }
        } catch (error) {
          console.error('地址操作失败:', error)
          this.$message.error('操作失败')
        } finally {
          this.submitting = false
        }
      })
    },
    async setDefault(id) {
      try {
        const res = await setDefaultAddress(id)
        if (res.code === 200) {
          this.$message.success('设置成功')
          await this.loadAddresses()
        } else {
          this.$message.error(res.message || '设置失败')
        }
      } catch (error) {
        this.$message.error('设置失败')
      }
    },
    async deleteAddress(id) {
      this.$confirm('确定要删除该地址吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteAddress(id)
          if (res.code === 200) {
            this.$message.success('删除成功')
            await this.loadAddresses()
          } else {
            this.$message.error(res.message || '删除失败')
          }
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    resetForm() {
      this.form = {
        name: '',
        phone: '',
        region: [],
        detail: '',
        is_default: false
      }
      this.editingId = null
      this.$refs.addressForm?.clearValidate()
    }
  }
}
</script>

<style scoped lang="scss">
.address-manage {
  padding: 20px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.address-card {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  &.default {
    border-color: #67c23a;
    background-color: #f0f9ff;
  }
}

.address-content {
  margin-bottom: 15px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;

  .name {
    font-size: 16px;
    font-weight: 600;
  }

  .phone {
    font-size: 14px;
    color: #909399;
  }
}

.address-detail {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.address-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.dialog-footer {
  text-align: right;
}
</style>
