<template>
  <div class="order-confirm container">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="!product" class="empty">
      <el-empty description="商品信息不存在" />
    </div>
    
    <div v-else>
      <h2 class="page-title">确认订单</h2>
      
      <div class="confirm-content">
        <div class="card address-section">
          <h3 class="section-title">
            <i class="el-icon-location"></i> 收货地址
          </h3>
          <div v-if="addresses.length > 0" class="address-list">
            <div
              v-for="addr in addresses"
              :key="addr.id"
              :class="['address-item', { active: selectedAddressId === addr.id }]"
              @click="selectAddress(addr.id)"
            >
              <div class="address-info">
                <span class="name">{{ addr.name }}</span>
                <span class="phone">{{ addr.phone }}</span>
              </div>
              <div class="address-detail">
                {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
              </div>
              <div v-if="addr.is_default" class="default-tag">默认</div>
            </div>
          </div>
          <div v-else class="no-address">
            <el-empty description="暂无收货地址" />
            <el-button type="primary" @click="addAddress">添加地址</el-button>
          </div>
        </div>
        
        <div class="card product-section">
          <h3 class="section-title">
            <i class="el-icon-goods"></i> 商品信息
          </h3>
          <div class="product-item">
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <p class="product-specs">{{ product.subtitle }}</p>
              <div class="product-meta">
                <span class="price">¥{{ product.price }}</span>
                <span class="quantity">x {{ quantity }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card payment-section">
          <h3 class="section-title">
            <i class="el-icon-wallet"></i> 支付方式
          </h3>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信支付</el-radio>
          </el-radio-group>
        </div>
        
        <div class="card remark-section">
          <h3 class="section-title">
            <i class="el-icon-edit-outline"></i> 订单备注
          </h3>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，请输入订单备注"
            maxlength="200"
            show-word-limit
          />
        </div>
        
        <div class="card total-section">
          <div class="total-info">
            <div class="total-row">
              <span>商品总额</span>
              <span>¥{{ (product.price * quantity).toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>运费</span>
              <span>¥0.00</span>
            </div>
            <div class="total-row final">
              <span>应付总额</span>
              <span class="total-price">¥{{ (product.price * quantity).toFixed(2) }}</span>
            </div>
          </div>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :disabled="!selectedAddressId || submitting"
            @click="submitOrder"
          >
            {{ submitting ? '提交中...' : '提交订单' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProductById } from '@/api/product'
import { getAddressList } from '@/api/address'
import { createOrder } from '@/api/order'
import { getCart } from '@/api/cart'

export default {
  name: 'OrderConfirm',
  data() {
    return {
      loading: true,
      submitting: false,
      product: null,
      quantity: 1,
      addresses: [],
      selectedAddressId: null,
      paymentMethod: 'alipay',
      remark: ''
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const { productId, quantity } = this.$route.query
        let addressRes
        
        if (productId) {
          // 从商品详情页直接购买
          this.quantity = parseInt(quantity) || 1
          
          const [productRes, addrRes] = await Promise.all([
            getProductById(productId),
            getAddressList()
          ])
          
          addressRes = addrRes
          
          if (productRes.code === 200) {
            this.product = productRes.data
          } else {
            this.$message.error('获取商品信息失败')
            this.$router.back()
            return
          }
        } else {
          // 从购物车结算
          const [cartRes, addrRes] = await Promise.all([
            getCart(),
            getAddressList()
          ])
          
          addressRes = addrRes
          
          if (cartRes.code === 200) {
            const selectedItems = cartRes.data.filter(item => item.selected)
            if (selectedItems.length === 0) {
              this.$message.error('请选择要结算的商品')
              this.$router.back()
              return
            }
            // 只取第一个商品作为示例，实际应该支持多个商品
            const firstItem = selectedItems[0]
            this.quantity = firstItem.quantity
            
            const productRes = await getProductById(firstItem.productId)
            if (productRes.code === 200) {
              this.product = productRes.data
            } else {
              this.$message.error('获取商品信息失败')
              this.$router.back()
              return
            }
          } else {
            this.$message.error('获取购物车信息失败')
            this.$router.back()
            return
          }
        }
        
        if (addressRes && addressRes.code === 200) {
          this.addresses = addressRes.data
          const defaultAddr = this.addresses.find(addr => addr.is_default)
          if (defaultAddr) {
            this.selectedAddressId = defaultAddr.id
          } else if (this.addresses.length > 0) {
            this.selectedAddressId = this.addresses[0].id
          }
        }
        
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
        this.$router.back()
      } finally {
        this.loading = false
      }
    },
    selectAddress(id) {
      this.selectedAddressId = id
    },
    addAddress() {
      this.$router.push({
        path: '/user/addresses',
        query: { redirect: this.$route.fullPath }
      })
    },
    async submitOrder() {
      if (!this.selectedAddressId) {
        this.$message.warning('请选择收货地址')
        return
      }
      
      this.submitting = true
      
      try {
        const res = await createOrder({
          items: [{
            productId: this.product.id,
            quantity: this.quantity
          }],
          addressId: this.selectedAddressId,
          paymentMethod: this.paymentMethod,
          remark: this.remark,
          totalAmount: this.product.price * this.quantity
        })
        
        if (res.code === 200) {
          this.$message.success('订单创建成功')
          this.$router.push(`/orders/${res.data.id}`)
        } else {
          this.$message.error(res.message || '订单创建失败')
        }
      } catch (error) {
        console.error('创建订单失败:', error)
        this.$message.error('创建订单失败，请重试')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.order-confirm {
  padding: 20px 15px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f5f5f5;
  
  i {
    margin-right: 8px;
    color: $primary-color;
  }
}

.address-section {
  .address-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
  }
  
  .address-item {
    border: 2px solid #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    
    &:hover {
      border-color: $primary-color;
    }
    
    &.active {
      border-color: $primary-color;
      background: #fff5f0;
    }
    
    .address-info {
      display: flex;
      gap: 15px;
      margin-bottom: 8px;
      
      .name {
        font-weight: bold;
        color: #333;
      }
      
      .phone {
        color: #666;
      }
    }
    
    .address-detail {
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
    
    .default-tag {
      position: absolute;
      top: 10px;
      right: 10px;
      background: $primary-color;
      color: #fff;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
  
  .no-address {
    text-align: center;
    padding: 20px 0;
    
    .el-button {
      margin-top: 15px;
    }
  }
}

.product-section {
  .product-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 8px;
  }
  
  .product-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .product-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
  }
  
  .product-specs {
    font-size: 12px;
    color: #999;
  }
  
  .product-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .price {
      font-size: 18px;
      color: #f56c6c;
      font-weight: bold;
    }
    
    .quantity {
      color: #666;
    }
  }
}

.payment-section {
  .el-radio-group {
    display: flex;
    gap: 20px;
  }
}

.total-section {
  .total-info {
    margin-bottom: 20px;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    color: #666;
    
    &.final {
      font-size: 18px;
      color: #333;
      border-top: 1px solid #f5f5f5;
      margin-top: 10px;
      padding-top: 15px;
      
      .total-price {
        color: #f56c6c;
        font-weight: bold;
        font-size: 24px;
      }
    }
  }
  
  .submit-btn {
    width: 100%;
    padding: 15px;
    font-size: 16px;
    background-color: $primary-color;
    border-color: $primary-color;
    
    &:hover {
      background-color: #e65c00;
      border-color: #e65c00;
    }
  }
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }
}
</style>
