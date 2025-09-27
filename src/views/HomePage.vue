<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-left">
        <img src="/logo.png" alt="旅牛网" class="logo" />
        <h1 class="title">旅牛网数据可视化大屏</h1>
      </div>
      <div class="nav-right">
        <div class="time">{{ currentTime }}</div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部统计卡片 -->
      <div class="stats-row">
        <div class="stat-card" v-for="(stat, index) in statsData" :key="index">
          <div class="stat-icon">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- 中间主要图表区域 -->
      <div class="charts-row">
        <!-- 左侧中国地图 -->
        <div class="chart-container map-container">
          <div class="chart-header">
            <h3>全国景区热度分布</h3>
          </div>
          <div class="chart-content">
            <div ref="chinaMapRef" class="china-map"></div>
          </div>
        </div>

        <!-- 右侧统计图表 -->
        <div class="chart-container stats-container">
          <div class="chart-section">
            <div class="chart-header">
              <h3>实时访问趋势</h3>
            </div>
            <div ref="trendChartRef" class="trend-chart"></div>
          </div>
          
          <div class="chart-section">
            <div class="chart-header">
              <h3>景区类型分布</h3>
            </div>
            <div ref="categoryPieRef" class="category-pie"></div>
          </div>
        </div>
      </div>

      <!-- 底部排行榜 -->
      <div class="rankings-row">
        <!-- 热度排行榜 -->
        <div class="ranking-container">
          <div class="chart-header">
            <h3>
              <el-icon><TrendCharts /></el-icon>
              景区热度排行榜
            </h3>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(item, index) in hotRanking" 
              :key="index"
              class="ranking-item"
              @click="goToScenic(item.id)"
            >
              <div class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</div>
              <div class="rank-content">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-location">{{ item.province }} {{ item.city }}</div>
              </div>
              <div class="rank-value">{{ item.visitCount }}</div>
            </div>
          </div>
        </div>

        <!-- 好评排行榜 -->
        <div class="ranking-container">
          <div class="chart-header">
            <h3>
              <el-icon><Star /></el-icon>
              景区好评排行榜
            </h3>
          </div>
          <div class="ranking-list">
            <div 
              v-for="(item, index) in ratingRanking" 
              :key="index"
              class="ranking-item"
              @click="goToScenic(item.id)"
            >
              <div class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</div>
              <div class="rank-content">
                <div class="rank-name">{{ item.name }}</div>
                <div class="rank-location">{{ item.province }} {{ item.city }}</div>
              </div>
              <div class="rank-value">{{ item.rating }}分</div>
            </div>
          </div>
        </div>

        <!-- 秒杀活动 -->
        <div class="ranking-container">
          <div class="chart-header">
            <h3>
              <el-icon><Lightning /></el-icon>
              热门秒杀活动
            </h3>
          </div>
          <div class="seckill-list">
            <div 
              v-for="(item, index) in seckillActivities" 
              :key="index"
              class="seckill-item"
              @click="goToSeckill(item.id)"
            >
              <div class="seckill-image">
                <img :src="item.image || '/default-scenic.jpg'" :alt="item.title" />
              </div>
              <div class="seckill-content">
                <div class="seckill-title">{{ item.title }}</div>
                <div class="seckill-price">
                  <span class="current-price">¥{{ item.seckillPrice }}</span>
                  <span class="original-price">¥{{ item.originalPrice }}</span>
                </div>
                <div class="seckill-progress">
                  <el-progress 
                    :percentage="(item.sold / item.stock) * 100" 
                    :show-text="false"
                    stroke-width="4"
                  />
                  <span class="sold-text">已售{{ item.sold }}/{{ item.stock }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮操作按钮 -->
    <div class="floating-actions">
      <el-button type="primary" circle @click="goToRecommend">
        <el-icon><Search /></el-icon>
      </el-button>
      <el-button type="success" circle @click="goToUserCenter">
        <el-icon><User /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  TrendCharts, 
  Star, 
  Lightning, 
  Search, 
  User, 
  Location, 
  View, 
  UserFilled,
  ChatLineSquare 
} from '@element-plus/icons-vue'

import { createChart, getChinaMapOption, getTrendLineOption, getRatingPieOption } from '@/utils/echarts'
import { getOverviewData, getNationalHeatmapData, getHotRanking, getRatingRanking } from '@/api/data'
import { getActiveActivities } from '@/api/ticket'
import { formatDate } from '@/utils'

export default {
  name: 'HomePage',
  components: {
    TrendCharts,
    Star,
    Lightning,
    Search,
    User,
    Location,
    View,
    UserFilled,
    ChatLineSquare
  },
  setup() {
    const router = useRouter()
    
    // 响应式数据
    const currentTime = ref('')
    const statsData = ref([
      { icon: 'Location', label: '景区总数', value: '0' },
      { icon: 'View', label: '今日访问', value: '0' },
      { icon: 'UserFilled', label: '在线用户', value: '0' },
      { icon: 'ChatLineSquare', label: '评论总数', value: '0' }
    ])
    
    const hotRanking = ref([])
    const ratingRanking = ref([])
    const seckillActivities = ref([])
    
    // 图表引用
    const chinaMapRef = ref(null)
    const trendChartRef = ref(null)
    const categoryPieRef = ref(null)
    
    let chinaMapChart = null
    let trendChart = null
    let categoryPieChart = null
    let timeInterval = null
    
    // 更新时间
    const updateTime = () => {
      currentTime.value = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    }
    
    // 获取排名样式类
    const getRankClass = (index) => {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return 'rank-normal'
    }
    
    // 初始化中国地图
    const initChinaMap = async () => {
      try {
        const response = await getNationalHeatmapData()
        const mapData = response.data || []
        
        chinaMapChart = createChart(chinaMapRef.value)
        const option = getChinaMapOption(mapData)
        chinaMapChart.setOption(option)
        
        // 添加点击事件
        chinaMapChart.on('click', (params) => {
          if (params.data && params.data.name) {
            router.push(`/province/${params.data.name}`)
          }
        })
      } catch (error) {
        console.error('初始化中国地图失败:', error)
      }
    }
    
    // 初始化趋势图
    const initTrendChart = () => {
      const dates = []
      const data = []
      const now = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        dates.push(formatDate(date, 'MM-DD'))
        data.push(Math.floor(Math.random() * 1000) + 500)
      }
      
      trendChart = createChart(trendChartRef.value)
      const option = getTrendLineOption(data, dates)
      trendChart.setOption(option)
    }
    
    // 初始化饼图
    const initCategoryPie = () => {
      const data = [
        { value: 335, name: '自然风光' },
        { value: 310, name: '历史文化' },
        { value: 234, name: '主题公园' },
        { value: 135, name: '博物馆' },
        { value: 148, name: '自然公园' }
      ]
      
      categoryPieChart = createChart(categoryPieRef.value)
      const option = getRatingPieOption(data)
      categoryPieChart.setOption(option)
    }
    
    // 加载数据
    const loadData = async () => {
      try {
        // 加载概览数据
        const overviewResponse = await getOverviewData()
        const overview = overviewResponse.data || {}
        
        statsData.value = [
          { icon: 'Location', label: '景区总数', value: overview.totalScenics || '0' },
          { icon: 'View', label: '今日访问', value: overview.todayVisits || '0' },
          { icon: 'UserFilled', label: '在线用户', value: overview.onlineUsers || '0' },
          { icon: 'ChatLineSquare', label: '评论总数', value: overview.totalComments || '0' }
        ]
        
        // 加载排行榜数据
        const [hotResponse, ratingResponse] = await Promise.all([
          getHotRanking(10),
          getRatingRanking(10)
        ])
        
        hotRanking.value = hotResponse.data || []
        ratingRanking.value = ratingResponse.data || []
        
        // 加载秒杀活动
        const seckillResponse = await getActiveActivities()
        seckillActivities.value = (seckillResponse.data || []).slice(0, 5)
        
      } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('数据加载失败')
      }
    }
    
    // 导航方法
    const goToScenic = (scenicId) => {
      router.push(`/scenic/${scenicId}`)
    }
    
    const goToSeckill = (activityId) => {
      // 可以跳转到秒杀详情页或者景区详情页
      router.push(`/seckill/${activityId}`)
    }
    
    const goToRecommend = () => {
      router.push('/recommend')
    }
    
    const goToUserCenter = () => {
      router.push('/user')
    }
    
    // 窗口大小改变处理
    const handleResize = () => {
      if (chinaMapChart) chinaMapChart.resize()
      if (trendChart) trendChart.resize()
      if (categoryPieChart) categoryPieChart.resize()
    }
    
    // 生命周期钩子
    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      
      loadData()
      
      // 延迟初始化图表，确保DOM已渲染
      setTimeout(() => {
        initChinaMap()
        initTrendChart()
        initCategoryPie()
      }, 100)
      
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
      
      if (chinaMapChart) chinaMapChart.dispose()
      if (trendChart) trendChart.dispose()
      if (categoryPieChart) categoryPieChart.dispose()
      
      window.removeEventListener('resize', handleResize)
    })
    
    return {
      currentTime,
      statsData,
      hotRanking,
      ratingRanking,
      seckillActivities,
      chinaMapRef,
      trendChartRef,
      categoryPieRef,
      getRankClass,
      goToScenic,
      goToSeckill,
      goToRecommend,
      goToUserCenter
    }
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0c1426 0%, #1a2642 50%, #2d3a5f 100%);
  overflow: hidden;
  position: relative;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .nav-left {
    display: flex;
    align-items: center;

    .logo {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }

    .title {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      background: linear-gradient(45deg, #2196F3, #21CBF3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  .nav-right {
    .time {
      color: #ffffff;
      font-size: 18px;
      font-family: 'Courier New', monospace;
    }
  }
}

.main-content {
  padding: 20px 40px;
  height: calc(100vh - 90px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(33, 150, 243, 0.3);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(45deg, #2196F3, #21CBF3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;

      .el-icon {
        font-size: 24px;
        color: #ffffff;
      }
    }

    .stat-content {
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #ffffff;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: #cccccc;
        margin-top: 5px;
      }
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  flex: 1;

  .chart-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;

    .chart-header {
      margin-bottom: 15px;

      h3 {
        color: #ffffff;
        font-size: 18px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  .map-container {
    .china-map {
      width: 100%;
      height: 400px;
    }
  }

  .stats-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .chart-section {
      flex: 1;

      .trend-chart,
      .category-pie {
        width: 100%;
        height: 180px;
      }
    }
  }
}

.rankings-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: 300px;

  .ranking-container {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px;
    overflow: hidden;

    .chart-header {
      margin-bottom: 15px;

      h3 {
        color: #ffffff;
        font-size: 16px;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .ranking-list {
      height: 220px;
      overflow-y: auto;

      .ranking-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .rank-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          margin-right: 12px;

          &.rank-first {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: #fff;
          }

          &.rank-second {
            background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
            color: #fff;
          }

          &.rank-third {
            background: linear-gradient(45deg, #CD7F32, #B87333);
            color: #fff;
          }

          &.rank-normal {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
          }
        }

        .rank-content {
          flex: 1;

          .rank-name {
            color: #ffffff;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 2px;
            @include text-ellipsis;
          }

          .rank-location {
            color: #cccccc;
            font-size: 12px;
          }
        }

        .rank-value {
          color: #2196F3;
          font-size: 14px;
          font-weight: bold;
        }
      }
    }

    .seckill-list {
      height: 220px;
      overflow-y: auto;

      .seckill-item {
        display: flex;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .seckill-image {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          margin-right: 12px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .seckill-content {
          flex: 1;

          .seckill-title {
            color: #ffffff;
            font-size: 14px;
            margin-bottom: 6px;
            @include text-ellipsis;
          }

          .seckill-price {
            margin-bottom: 8px;

            .current-price {
              color: #FF5722;
              font-size: 16px;
              font-weight: bold;
              margin-right: 8px;
            }

            .original-price {
              color: #999;
              font-size: 12px;
              text-decoration: line-through;
            }
          }

          .seckill-progress {
            .sold-text {
              color: #cccccc;
              font-size: 12px;
              margin-top: 4px;
              display: block;
            }
          }
        }
      }
    }
  }
}

.floating-actions {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 1000;

  .el-button {
    width: 50px;
    height: 50px;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);

    &:hover {
      transform: scale(1.1);
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .charts-row {
    grid-template-columns: 1fr;
    
    .stats-container {
      flex-direction: row;
    }
  }
  
  .rankings-row {
    grid-template-columns: 1fr;
    height: auto;
    
    .ranking-container {
      height: 300px;
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px 20px;
  }
  
  .top-nav {
    padding: 15px 20px;
    
    .nav-left .title {
      font-size: 18px;
    }
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
