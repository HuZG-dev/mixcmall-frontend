<template>
  <div class="products-page container">
    <!-- 筛选栏 -->
    <div class="filter-bar card">
      <div class="filter-item">
        <span class="filter-label">分类：</span>
        <el-radio-group v-model="filters.category" @change="handleFilter">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button v-for="cat in categories" :key="cat.id" :label="cat.id">
            {{ cat.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-item">
        <span class="filter-label">排序：</span>
        <el-radio-group v-model="filters.sort" @change="handleFilter">
          <el-radio-button label="default">综合</el-radio-button>
          <el-radio-button label="sales">销量</el-radio-button>
          <el-radio-button label="price_asc">价格升序</el-radio-button>
          <el-radio-button label="price_desc">价格降序</el-radio-button>
        </el-radio-group>
      </div>
      <div class="filter-item">
        <span class="filter-label">价格：</span>
        <el-input v-model="filters.minPrice" placeholder="最低价" style="width: 100px" size="small" />
        <span class="price-divider">-</span>
        <el-input v-model="filters.maxPrice" placeholder="最高价" style="width: 100px" size="small" />
        <el-button type="primary" size="small" @click="handleFilter">确定</el-button>
      </div>
    </div>
    
    <!-- 搜索结果提示 -->
    <div v-if="searchKeyword" class="search-tip">
      搜索 "<span class="keyword">{{ searchKeyword }}</span>" 的结果，共 {{ total }} 件商品
    </div>
    
    <!-- 商品列表 -->
    <div class="product-list">
      <div v-if="products.length > 0" class="product-grid">
        <div
          v-for="product in products"
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
      
      <el-empty v-else description="暂无商品" />
    </div>
    
    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        background
        layout="prev, pager, next, jumper"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { getProducts, getCategories } from '@/api/product'

export default {
  name: 'Products',
  data() {
    return {
      filters: {
        category: '',
        sort: 'default',
        minPrice: '',
        maxPrice: ''
      },
      categories: [],
      searchKeyword: '',
      products: [],
      total: 0,
      pageSize: 12,
      currentPage: 1
    }
  },
  created() {
    this.loadCategories()
  },
  watch: {
    '$route.query': {
      handler(query) {
        this.searchKeyword = query.keyword || ''
        if (query.category) {
          this.filters.category = parseInt(query.category)
        }
        this.loadProducts()
      },
      immediate: true
    }
  },
  methods: {
    async loadCategories() {
      try {
        const res = await getCategories()
        if (res.code === 200) {
          this.categories = res.data
        }
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    },
    async loadProducts() {
      try {
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize
        }
        
        if (this.searchKeyword) {
          params.keyword = this.searchKeyword
        }
        if (this.filters.category) {
          params.category = this.filters.category
        }
        if (this.filters.minPrice) {
          params.minPrice = this.filters.minPrice
        }
        if (this.filters.maxPrice) {
          params.maxPrice = this.filters.maxPrice
        }
        if (this.filters.sort !== 'default') {
          params.sort = this.filters.sort
        }
        
        const res = await getProducts(params)
        if (res.code === 200) {
          this.products = res.data.list
          this.total = res.data.total
        }
      } catch (error) {
        console.error('加载商品失败:', error)
      }
    },
    handleFilter() {
      this.currentPage = 1
      this.loadProducts()
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadProducts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    goToDetail(productId) {
      this.$router.push(`/product/${productId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.products-page {
  padding: 90px 15px 20px;
}

.filter-bar {
  margin-bottom: 20px;
  
  .filter-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .filter-label {
    width: 60px;
    color: #666;
    font-size: 14px;
  }
  
  .price-divider {
    margin: 0 10px;
    color: #999;
  }
  
  .el-button {
    margin-left: 10px;
  }
}

.search-tip {
  padding: 15px 0;
  color: #666;
  
  .keyword {
    color: $primary-color;
    font-weight: bold;
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
    line-height: 20px;
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

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 30px;
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
}
</style>
