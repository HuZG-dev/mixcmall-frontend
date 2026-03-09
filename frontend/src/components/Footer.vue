<template>
  <footer class="footer">
    <div class="footer-content container">
      <div class="footer-section">
        <h4>万象商城</h4>
        <p>综合电商平台，为您提供便捷高效的购物体验</p>
      </div>
      <div class="footer-section">
        <h4>客户服务</h4>
        <ul>
          <li><a href="#">帮助中心</a></li>
          <li><a href="#">售后服务</a></li>
          <li><a href="#">配送说明</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>关于我们</h4>
        <ul>
          <li><a href="#">公司简介</a></li>
          <li><a href="#">联系我们</a></li>
          <li><a href="#">招贤纳士</a></li>
        </ul>
      </div>
      <div class="footer-section">
        <h4>关注我们</h4>
        <div class="social-links">
          <i class="el-icon-phone"></i>
          <span>400-888-8888</span>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 万象商城 MixcMall. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style lang="scss" scoped>
$primary-color: #ff6700;

.footer {
  background: #333;
  color: #fff;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 15px;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-section {
  h4 {
    font-size: 16px;
    margin-bottom: 15px;
    color: $primary-color;
  }
  
  p {
    font-size: 14px;
    color: #999;
    max-width: 250px;
  }
  
  ul {
    li {
      margin-bottom: 8px;
      
      a {
        color: #999;
        font-size: 14px;
        transition: color 0.3s;
        
        &:hover {
          color: $primary-color;
        }
      }
    }
  }
  
  .social-links {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #999;
    
    i {
      font-size: 20px;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #444;
  padding: 20px;
  text-align: center;
  
  p {
    font-size: 12px;
    color: #666;
  }
}
</style>
