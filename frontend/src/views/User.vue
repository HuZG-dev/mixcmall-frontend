<template>
  <div class="user-page container">
    <div class="user-layout">
      <!-- 侧边栏 -->
      <aside class="user-sidebar card">
        <div class="user-info">
          <el-avatar :size="80" :src="userInfo.avatar">
            <i class="el-icon-user"></i>
          </el-avatar>
          <h3 class="username">{{ userInfo.nickname || userInfo.username }}</h3>
          <p class="user-level">普通会员</p>
        </div>
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="profile">
            <i class="el-icon-user"></i>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <i class="el-icon-document"></i>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="address">
            <i class="el-icon-location"></i>
            <span>收货地址</span>
          </el-menu-item>
          <el-menu-item index="security">
            <i class="el-icon-lock"></i>
            <span>账户安全</span>
          </el-menu-item>
        </el-menu>
      </aside>
      
      <!-- 内容区 -->
      <main class="user-content card">
        <!-- 个人信息 -->
        <div v-if="activeMenu === 'profile'" class="content-section">
          <h3 class="section-title">个人信息</h3>
          <el-form :model="profileForm" label-width="100px">
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :auto-upload="false"
                :on-change="handleAvatarChange"
              >
                <el-avatar :size="100" :src="profileForm.avatar">
                  <i class="el-icon-plus"></i>
                </el-avatar>
              </el-upload>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="profileForm.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="secret">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="profileForm.birthday" type="date" placeholder="选择生日" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profileForm.phone" disabled />
              <el-button type="text">更换手机号</el-button>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveProfile">保存修改</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 收货地址 -->
        <div v-if="activeMenu === 'address'" class="content-section">
          <div class="section-header">
            <h3 class="section-title">收货地址</h3>
            <el-button type="primary" size="small" @click="showAddressDialog()">新增地址</el-button>
          </div>
          <div class="address-list">
            <div v-for="addr in addresses" :key="addr.id" class="address-item">
              <div class="address-info">
                <div class="address-header">
                  <span class="name">{{ addr.name }}</span>
                  <span class="phone">{{ addr.phone }}</span>
                  <el-tag v-if="addr.isDefault" size="mini" type="warning">默认</el-tag>
                </div>
                <p class="address-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detail }}</p>
              </div>
              <div class="address-actions">
                <el-button type="text" @click="showAddressDialog(addr)">编辑</el-button>
                <el-button type="text" @click="deleteAddress(addr.id)">删除</el-button>
                <el-button v-if="!addr.isDefault" type="text" @click="setDefault(addr.id)">设为默认</el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 账户安全 -->
        <div v-if="activeMenu === 'security'" class="content-section">
          <h3 class="section-title">账户安全</h3>
          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <h4>登录密码</h4>
                <p>定期修改密码可以提高账户安全性</p>
              </div>
              <el-button type="text" @click="showPasswordDialog">修改</el-button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <h4>手机绑定</h4>
                <p>已绑定手机：{{ userInfo.phone || '未绑定' }}</p>
              </div>
              <el-button type="text">修改</el-button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <h4>邮箱绑定</h4>
                <p>{{ userInfo.email ? '已绑定：' + userInfo.email : '未绑定' }}</p>
              </div>
              <el-button type="text">{{ userInfo.email ? '修改' : '绑定' }}</el-button>
            </div>
          </div>
        </div>
      </main>
    </div>
    
    <!-- 地址对话框 -->
    <el-dialog
      :title="addressForm.id ? '编辑地址' : '新增地址'"
      :visible.sync="addressDialogVisible"
      width="500px"
    >
      <el-form ref="addressForm" :model="addressForm" :rules="addressRules" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="addressForm.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addressForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="所在地区" prop="province">
          <el-cascader
            v-model="regionValue"
            :options="[
              { value: '广东省', label: '广东省', children: [
                { value: '深圳市', label: '深圳市', children: [
                  { value: '南山区', label: '南山区' },
                  { value: '福田区', label: '福田区' },
                  { value: '罗湖区', label: '罗湖区' }
                ]},
                { value: '广州市', label: '广州市', children: [
                  { value: '天河区', label: '天河区' },
                  { value: '越秀区', label: '越秀区' }
                ]}
              ]},
              { value: '北京市', label: '北京市', children: [
                { value: '北京市', label: '北京市', children: [
                  { value: '朝阳区', label: '朝阳区' },
                  { value: '海淀区', label: '海淀区' }
                ]}
              ]}
            ]"
            placeholder="请选择省/市/区"
            style="width: 100%"
            @change="handleRegionChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail" type="textarea" :rows="3" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo, uploadAvatar } from '@/api/user'
import { getAddressList, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/api/address'

export default {
  name: 'User',
  data() {
    return {
      activeMenu: 'profile',
      userInfo: {
        id: 1,
        username: 'testuser',
        avatar: 'https://picsum.photos/100/100?random=user',
        phone: '138****8888',
        email: ''
      },
      profileForm: {
        avatar: 'https://picsum.photos/100/100?random=user',
        username: 'testuser',
        nickname: '测试用户',
        gender: 'male',
        birthday: '',
        phone: '138****8888',
        email: ''
      },
      addresses: [],
      addressDialogVisible: false,
      addressForm: {
        id: null,
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false
      },
      regionValue: [],
      addressRules: {
        name: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        province: [{ required: true, message: '请选择省份', trigger: 'change' }],
        city: [{ required: true, message: '请选择城市', trigger: 'change' }],
        district: [{ required: true, message: '请选择区县', trigger: 'change' }],
        detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      }
    }
  },
  async mounted() {
    await this.loadUserInfo()
    await this.loadAddresses()
  },
  methods: {
    async loadUserInfo() {
      try {
        const res = await getUserInfo()
        this.userInfo = res.data
        this.profileForm = {
          avatar: res.data.avatar || 'https://picsum.photos/100/100?random=user',
          nickname: res.data.nickname || '',
          gender: res.data.gender || 'secret',
          birthday: res.data.birthday || '',
          phone: res.data.phone || '',
          email: res.data.email || ''
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },
    async loadAddresses() {
      try {
        const res = await getAddressList()
        this.addresses = res.data
      } catch (error) {
        console.error('获取地址列表失败:', error)
      }
    },
    handleMenuSelect(index) {
      if (index === 'orders') {
        this.$router.push('/orders')
      } else {
        this.activeMenu = index
      }
    },
    async handleAvatarChange(file) {
      try {
        const res = await uploadAvatar(file.raw)
        this.profileForm.avatar = res.data.avatar
        this.userInfo.avatar = res.data.avatar
        this.$message.success('头像上传成功')
      } catch (error) {
        console.error('上传头像失败:', error)
        this.$message.error('头像上传失败')
      }
    },
    async saveProfile() {
      try {
        await updateUserInfo({
          nickname: this.profileForm.nickname,
          email: this.profileForm.email,
          gender: this.profileForm.gender,
          birthday: this.profileForm.birthday
        })
        await this.loadUserInfo()
        this.$message.success('保存成功')
      } catch (error) {
        console.error('保存失败:', error)
      }
    },
    showAddressDialog(address) {
      if (address) {
        this.addressForm = { ...address }
        this.regionValue = [address.province, address.city, address.district]
      } else {
        this.addressForm = {
          id: null,
          name: '',
          phone: '',
          province: '',
          city: '',
          district: '',
          detail: '',
          isDefault: false
        }
        this.regionValue = []
      }
      this.addressDialogVisible = true
    },
    handleRegionChange(value) {
      if (value && value.length === 3) {
        this.addressForm.province = value[0]
        this.addressForm.city = value[1]
        this.addressForm.district = value[2]
      }
    },
    async saveAddress() {
      this.$refs.addressForm.validate(async valid => {
        if (!valid) return
        
        try {
          if (this.addressForm.id) {
            await updateAddress(this.addressForm.id, this.addressForm)
            this.$message.success('修改成功')
          } else {
            await createAddress(this.addressForm)
            this.$message.success('添加成功')
          }
          this.addressDialogVisible = false
          await this.loadAddresses()
        } catch (error) {
          console.error('保存地址失败:', error)
          this.$message.error('保存失败')
        }
      })
    },
    async deleteAddress(id) {
      this.$confirm('确定要删除该地址吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAddress(id)
          this.$message.success('删除成功')
          await this.loadAddresses()
        } catch (error) {
          console.error('删除地址失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async setDefault(id) {
      try {
        await setDefaultAddress(id)
        this.$message.success('设置成功')
        await this.loadAddresses()
      } catch (error) {
        console.error('设置默认地址失败:', error)
        this.$message.error('设置失败')
      }
    },
    showPasswordDialog() {
      this.$message.info('修改密码')
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.user-page {
  padding: 20px 15px;
}

.user-layout {
  display: flex;
  gap: 20px;
}

.user-sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 30px 0;
  
  .user-info {
    text-align: center;
    padding: 0 20px 20px;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 10px;
    
    .username {
      margin-top: 15px;
      font-size: 18px;
      color: #333;
    }
    
    .user-level {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
  }
  
  .el-menu {
    border-right: none;
  }
}

.user-content {
  flex: 1;
  min-height: 600px;
}

.content-section {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.avatar-uploader {
  cursor: pointer;
  
  .el-avatar {
    border: 2px dashed #d9d9d9;
    
    &:hover {
      border-color: $primary-color;
    }
  }
}

.address-list {
  .address-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin-bottom: 15px;
    
    &:hover {
      border-color: $primary-color;
    }
    
    .address-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
      
      .name {
        font-weight: bold;
        color: #333;
      }
      
      .phone {
        color: #666;
      }
    }
    
    .address-detail {
      font-size: 14px;
      color: #666;
    }
    
    .address-actions {
      display: flex;
      gap: 10px;
    }
  }
}

.security-list {
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f5f5f5;
    
    h4 {
      font-size: 14px;
      color: #333;
      margin-bottom: 5px;
    }
    
    p {
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
