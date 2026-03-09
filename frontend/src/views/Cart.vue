<template>
  <div class="cart-page container">
    <h2 class="page-title">我的购物车</h2>
    
    <div v-if="cartItems.length > 0" class="cart-content">
      <!-- 购物车列表 -->
      <div class="cart-list card">
        <div class="cart-header">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <span class="header-item product">商品信息</span>
          <span class="header-item price">单价</span>
          <span class="header-item quantity">数量</span>
          <span class="header-item subtotal">小计</span>
          <span class="header-item action">操作</span>
        </div>
        
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <el-checkbox v-model="item.selected" @change="handleSelect" />
          <div class="item-product">
            <img :src="item.image" :alt="item.name" class="product-image" />
            <div class="product-info">
              <h4 class="product-name" @click="goToDetail(item.productId)">{{ item.name }}</h4>
              <p class="product-specs">{{ item.specs }}</p>
            </div>
          </div>
          <div class="item-price">¥{{ item.price }}</div>
          <div class="item-quantity">
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="item.stock"
              size="small"
              @change="handleQuantityChange(item)"
            />
          </div>
          <div class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          <div class="item-action">
            <el-button type="text" @click="handleRemoveItem(item.id)">删除</el-button>
          </div>
        </div>
      </div>
      
      <!-- 结算栏 -->
      <div class="cart-footer card">
        <div class="footer-left">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <el-button type="text" @click="removeSelected">删除选中</el-button>
          <el-button type="text" @click="handleClearCart">清空购物车</el-button>
        </div>
        <div class="footer-right">
          <span class="selected-count">已选 <strong>{{ selectedCount }}</strong> 件商品</span>
          <span class="total-price">
            合计：<strong class="price">¥{{ totalPrice }}</strong>
          </span>
          <el-button type="danger" size="large" :disabled="selectedCount === 0" @click="checkout">
            结算
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 空购物车 -->
    <div v-else class="empty-cart card">
      <el-empty description="购物车还是空的哦~">
        <el-button type="primary" @click="$router.push('/products')">去购物</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Cart',
  data() {
    return {}
  },
  computed: {
    ...mapState('cart', ['cartItems']),
    selectAll: {
      get() {
        return this.cartItems.length > 0 && this.cartItems.every(item => item.selected)
      },
      set(val) {
        this.cartItems.forEach(item => {
          this.toggleSelect(item.id, val)
        })
      }
    },
    selectedItems() {
      return this.cartItems.filter(item => item.selected)
    },
    selectedCount() {
      return this.selectedItems.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice() {
      return this.selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
    }
  },
  created() {
    this.loadCart()
  },
  methods: {
    ...mapActions('cart', ['getCart', 'updateQuantity', 'removeItem', 'clearCart']),
    async loadCart() {
      try {
        await this.getCart()
      } catch (error) {
        console.error('加载购物车失败:', error)
      }
    },
    handleSelectAll(val) {
      this.cartItems.forEach(item => {
        this.toggleSelect(item.id, val)
      })
    },
    handleSelect() {
    },
    async handleQuantityChange(item) {
      try {
        await this.updateQuantity({ cartItemId: item.id, quantity: item.quantity })
      } catch (error) {
        console.error('更新数量失败:', error)
      }
    },
    async handleRemoveItem(id) {
      this.$confirm('确定要删除该商品吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await this.removeItem(id)
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async removeSelected() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的商品')
        return
      }
      this.$confirm(`确定要删除选中的 ${this.selectedItems.length} 件商品吗？`, '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await Promise.all(this.selectedItems.map(item => this.removeItem(item.id)))
          this.$message.success('删除成功')
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    async handleClearCart() {
      this.$confirm('确定要清空购物车吗？', '提示', {
        type: 'warning'
      }).then(async () => {
        try {
          await this.clearCart()
          this.$message.success('购物车已清空')
        } catch (error) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    goToDetail(productId) {
      this.$router.push(`/product/${productId}`)
    },
    checkout() {
      if (this.selectedCount === 0) {
        this.$message.warning('请选择要结算的商品')
        return
      }
      this.$router.push('/orders/confirm')
    },
    async toggleSelect(cartItemId, selected) {
      try {
        const { toggleCartItem } = await import('@/api/cart')
        await toggleCartItem(cartItemId, selected)
      } catch (error) {
        console.error('更新选中状态失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.cart-page {
  padding: 20px 15px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.cart-list {
  margin-bottom: 20px;
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
  font-size: 14px;
  color: #666;
  
  .header-item {
    text-align: center;
    
    &.product {
      flex: 1;
      text-align: left;
      margin-left: 20px;
    }
    
    &.price, &.quantity, &.subtotal {
      width: 120px;
    }
    
    &.action {
      width: 80px;
    }
  }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .item-product {
    flex: 1;
    display: flex;
    align-items: center;
    margin-left: 20px;
    
    .product-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      margin-right: 15px;
    }
    
    .product-info {
      .product-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
        cursor: pointer;
        
        &:hover {
          color: $primary-color;
        }
      }
      
      .product-specs {
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .item-price, .item-subtotal {
    width: 120px;
    text-align: center;
    font-size: 14px;
  }
  
  .item-subtotal {
    color: #f56c6c;
    font-weight: bold;
  }
  
  .item-quantity {
    width: 120px;
    text-align: center;
  }
  
  .item-action {
    width: 80px;
    text-align: center;
  }
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  position: sticky;
  bottom: 0;
  
  .footer-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .footer-right {
    display: flex;
    align-items: center;
    gap: 30px;
    
    .selected-count {
      color: #666;
      
      strong {
        color: $primary-color;
      }
    }
    
    .total-price {
      font-size: 14px;
      color: #666;
      
      .price {
        font-size: 24px;
        color: #f56c6c;
      }
    }
    
    .el-button {
      padding: 15px 50px;
      font-size: 16px;
    }
  }
}

.empty-cart {
  padding: 60px;
}
</style>
