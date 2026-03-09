<template>
  <div class="product-detail container">
    <div class="detail-main card">
      <!-- 商品图片 -->
      <div class="product-gallery">
        <div class="main-image">
          <img :src="product.image || ''" :alt="product.name" />
        </div>
      </div>
      
      <!-- 商品信息 -->
    <div class="product-info">
      <h1 class="product-name">{{ product.name }}</h1>
      <p class="product-subtitle">{{ product.subtitle }}</p>
      
      <!-- 店铺信息 -->
      <div v-if="product.shop" class="shop-info">
        <div class="shop-header">
          <div class="shop-logo" v-if="product.shop.logo">
            <img :src="product.shop.logo" :alt="product.shop.name">
          </div>
          <div class="shop-details">
            <div class="shop-name">{{ product.shop.name }}</div>
            <div class="shop-phone" v-if="product.shop.phone">
              <i class="el-icon-phone"></i> {{ product.shop.phone }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="price-box">
          <span class="current-price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
          <span v-if="product.discount" class="discount-tag">{{ product.discount }}折</span>
        </div>
        
        <div class="info-row">
          <span class="label">运费：</span>
          <span class="value">包邮</span>
        </div>
        
        <div class="info-row">
          <span class="label">销量：</span>
          <span class="value">{{ product.sales }} 件</span>
        </div>
        
        <div class="info-row">
          <span class="label">库存：</span>
          <span class="value">{{ product.stock }} 件</span>
        </div>
        
        <div class="quantity-row">
          <span class="label">数量：</span>
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="product.stock"
            size="small"
          />
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="handleAddToCart">
            <i class="el-icon-shopping-cart-2"></i> 加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="buyNow">
            立即购买
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 商品详情 -->
    <div class="detail-tabs card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="商品详情" name="detail">
          <div class="detail-content" v-html="product.detail"></div>
        </el-tab-pane>
        <el-tab-pane label="规格参数" name="specs">
          <div class="specs-table">
            <div v-for="(spec, index) in product.specs" :key="index" class="spec-row">
              <span class="spec-name">{{ spec.name }}</span>
              <span class="spec-value">{{ spec.value }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="用户评价" name="reviews">
          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="reviewer">{{ review.username }}</span>
                <el-rate v-model="review.rating" disabled />
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>
          <el-empty v-else description="暂无评价" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getProductById } from '@/api/product'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: {
        id: 1,
        name: '',
        subtitle: '',
        price: '0.00',
        originalPrice: '0.00',
        sales: 0,
        stock: 0,
        images: [],
        detail: '',
        specs: []
      },
      quantity: 1,
      activeTab: 'detail',
      reviews: [
        { id: 1, username: '用户***1', rating: 5, date: '2024-01-15', content: '非常好用，物流也很快！' },
        { id: 2, username: '用户***2', rating: 4, date: '2024-01-14', content: '质量不错，值得购买。' },
        { id: 3, username: '用户***3', rating: 5, date: '2024-01-13', content: '包装很好，正品保证！' }
      ]
    }
  },
  created() {
    this.loadProduct()
  },
  methods: {
    ...mapActions('cart', ['addToCart']),
    async loadProduct() {
      try {
        const id = this.$route.params.id
        const res = await getProductById(id)
        if (res.code === 200) {
          this.product = res.data
        }
      } catch (error) {
        console.error('加载商品详情失败:', error)
      }
    },
    async handleAddToCart() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }
      
      try {
        console.log('添加到购物车:', { productId: this.product.id, quantity: this.quantity })
        const result = await this.addToCart({
          productId: this.product.id,
          quantity: this.quantity
        })
        console.log('添加到购物车结果:', result)
        this.$message.success('已加入购物车')
      } catch (error) {
        console.error('添加到购物车失败:', error)
        this.$message.error('添加失败，请重试')
      }
    },
    buyNow() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.$message.warning('请先登录')
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
        return
      }
      
      // 直接购买逻辑
      this.$router.push({
        path: '/orders/confirm',
        query: {
          productId: this.product.id,
          quantity: this.quantity
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.product-detail {
  padding: 20px 15px;
}

.detail-main {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.product-gallery {
  width: 450px;
  flex-shrink: 0;
  
  .main-image {
    width: 100%;
    height: 450px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 15px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .thumb-list {
    display: flex;
    gap: 10px;
  }
  
  .thumb-item {
    width: 80px;
    height: 80px;
    border: 2px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s;
    
    &.active, &:hover {
      border-color: $primary-color;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.product-info {
  flex: 1;
  
  .product-name {
    font-size: 22px;
    color: #333;
    margin-bottom: 10px;
    line-height: 1.4;
  }
  
  .product-subtitle {
    font-size: 14px;
    color: #999;
    margin-bottom: 20px;
  }
  
  .shop-info {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    
    .shop-header {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .shop-logo {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .shop-details {
        flex: 1;
        
        .shop-name {
          font-size: 16px;
          color: #333;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .shop-phone {
          font-size: 13px;
          color: #666;
          
          .el-icon-phone {
            margin-right: 4px;
          }
        }
      }
    }
  }
  
  .price-box {
    background: #fff5f0;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
    gap: 15px;
    
    .current-price {
      font-size: 32px;
      color: #f56c6c;
      font-weight: bold;
    }
    
    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
    }
    
    .discount-tag {
      background: #f56c6c;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
  
  .info-row, .quantity-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    .label {
      width: 60px;
      color: #999;
      font-size: 14px;
    }
    
    .value {
      color: #333;
      font-size: 14px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 30px;
    
    .el-button {
      padding: 15px 40px;
      font-size: 16px;
    }
  }
}

.detail-tabs {
  margin-top: 20px;
}

.detail-content {
  padding: 20px 0;
  
  img {
    max-width: 100%;
  }
}

.specs-table {
  .spec-row {
    display: flex;
    border-bottom: 1px solid #f5f5f5;
    padding: 12px 0;
    
    .spec-name {
      width: 120px;
      color: #999;
      font-size: 14px;
    }
    
    .spec-value {
      color: #333;
      font-size: 14px;
    }
  }
}

.reviews-list {
  .review-item {
    padding: 20px 0;
    border-bottom: 1px solid #f5f5f5;
    
    .review-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
      
      .reviewer {
        font-weight: bold;
        color: #333;
      }
      
      .review-date {
        color: #999;
        font-size: 12px;
        margin-left: auto;
      }
    }
    
    .review-content {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .detail-main {
    flex-direction: column;
  }
  
  .product-gallery {
    width: 100%;
    
    .main-image {
      height: 300px;
    }
  }
}
</style>
