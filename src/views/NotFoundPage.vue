<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-image">
        <img src="/404.svg" alt="页面未找到" />
      </div>
      
      <div class="error-content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在或已被移动</p>
        
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { HomeFilled, Back } from '@element-plus/icons-vue'

export default {
  name: 'NotFoundPage',
  components: {
    HomeFilled,
    Back
  },
  setup() {
    const router = useRouter()
    
    const goHome = () => {
      router.push('/')
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    return {
      goHome,
      goBack
    }
  }
}
</script>

<style lang="scss" scoped>
.not-found-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-container {
  text-align: center;
  color: #ffffff;
  
  .error-image {
    margin-bottom: 30px;
    
    img {
      width: 300px;
      height: 200px;
      opacity: 0.8;
    }
  }
  
  .error-content {
    h1 {
      font-size: 80px;
      font-weight: bold;
      margin: 0;
      background: linear-gradient(45deg, #ffffff, #cccccc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    h2 {
      font-size: 32px;
      margin: 10px 0;
      font-weight: 500;
    }
    
    p {
      font-size: 16px;
      margin: 20px 0 40px;
      opacity: 0.8;
    }
  }
  
  .error-actions {
    .el-button {
      margin: 0 10px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .not-found-container {
    .error-image img {
      width: 200px;
      height: 130px;
    }
    
    .error-content {
      h1 {
        font-size: 60px;
      }
      
      h2 {
        font-size: 24px;
      }
    }
    
    .error-actions {
      .el-button {
        margin: 5px;
        display: block;
        width: 150px;
      }
    }
  }
}
</style>
