<template>
  <div class="home">
    <!-- 轮播图 -->
    <section class="banner">
      <el-carousel height="500px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${item.image})` }">
            <div class="banner-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle }}</p>
              <el-button type="primary" @click="goToProducts">立即选购</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>
    
    <!-- 分类导航 -->
    <section class="categories container">
      <div class="section-header">
        <h3>商品分类</h3>
      </div>
      <div class="category-list">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          @click="goToCategory(cat.id)"
        >
          <i :class="cat.icon"></i>
          <span>{{ cat.name }}</span>
        </div>
      </div>
    </section>
    
    <!-- 热门商品 -->
    <section class="hot-products container">
      <div class="section-header">
        <h3>热门商品</h3>
        <router-link to="/products" class="more-link">查看更多 ></router-link>
      </div>
      <div class="product-grid">
        <div
          v-for="product in hotProducts"
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price-wrap">
              <span class="product-price">¥{{ product.price }}</span>
              <span v-if="product.originalPrice" class="product-original-price">
                ¥{{ product.originalPrice }}
              </span>
            </div>
            <div class="product-sales">已售 {{ product.sales }} 件</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 推荐商品 -->
    <section class="recommend-products container">
      <div class="section-header">
        <h3>为你推荐</h3>
      </div>
      <div class="product-grid">
        <div
          v-for="product in recommendProducts"
          :key="product.id"
          class="product-card"
          @click="goToDetail(product.id)"
        >
          <img :src="product.image" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price-wrap">
              <span class="product-price">¥{{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getHotProducts, getRecommendProducts, getCategories } from '@/api/product'

export default {
  name: 'Home',
  data() {
    return {
      banners: [
        { id: 1, title: '新品上市', subtitle: '品质生活，从这里开始', image: '/uploads/banners/hyzx.jpg' },
        { id: 2, title: '限时特惠', subtitle: '超值好物，不容错过', image: '/uploads/banners/xpss.jpg' },
        { id: 3, title: '会员专享', subtitle: '专属优惠，尊享服务', image: '/uploads/banners/xsth.jpg' }
      ],
      categories: [],
      hotProducts: [],
      recommendProducts: []
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [hotRes, recommendRes, categoryRes] = await Promise.all([
          getHotProducts(),
          getRecommendProducts(),
          getCategories()
        ])
        if (hotRes.code === 200) {
          this.hotProducts = hotRes.data
        }
        if (recommendRes.code === 200) {
          this.recommendProducts = recommendRes.data
        }
        if (categoryRes.code === 200) {
          this.categories = categoryRes.data
        }
      } catch (error) {
        console.error('加载数据失败:', error)
      }
    },
    goToProducts() {
      this.$router.push('/products')
    },
    goToCategory(categoryId) {
      this.$router.push({ path: '/products', query: { category: categoryId } })
    },
    goToDetail(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.home {
  padding-bottom: 40px;
}

.banner {
  .banner-item {
    height: 500px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .banner-content {
    text-align: center;
    color: #fff;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    
    h2 {
      font-size: 48px;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 20px;
      margin-bottom: 30px;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0 20px;
  
  h3 {
    font-size: 24px;
    color: #333;
    position: relative;
    padding-left: 15px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: $primary-color;
      border-radius: 2px;
    }
  }
  
  .more-link {
    color: #999;
    font-size: 14px;
    
    &:hover {
      color: $primary-color;
    }
  }
}

.category-list {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 15px 25px;
  border-radius: 8px;
  transition: all 0.3s;
  
  &:hover {
    background: #fff5f0;
    
    i {
      color: $primary-color;
    }
  }
  
  i {
    font-size: 32px;
    color: #666;
    margin-bottom: 10px;
    transition: color 0.3s;
  }
  
  span {
    font-size: 14px;
    color: #333;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
  
  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .product-info {
    padding: 15px;
  }
  
  .product-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
    height: 40px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .product-price-wrap {
    display: flex;
    align-items: baseline;
    margin-bottom: 5px;
  }
  
  .product-price {
    font-size: 20px;
    color: #f56c6c;
    font-weight: bold;
  }
  
  .product-original-price {
    font-size: 12px;
    color: #999;
    text-decoration: line-through;
    margin-left: 8px;
  }
  
  .product-sales {
    font-size: 12px;
    color: #999;
  }
}

@media (max-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .category-list {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
  }
  
  .category-item {
    width: calc(25% - 10px);
  }
}
</style>
