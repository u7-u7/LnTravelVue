<template>
  <div class="province-page">
    <!-- 顶部导航 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ provinceName }}</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 省份概览 -->
    <div class="province-overview">
      <div class="overview-left">
        <h1>{{ provinceName }}旅游数据</h1>
        <div class="province-stats">
          <div class="stat-item">
            <div class="stat-value">{{ provinceData.totalScenics || 0 }}</div>
            <div class="stat-label">景区总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ provinceData.todayVisits || 0 }}</div>
            <div class="stat-label">今日访问</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ provinceData.avgRating || 0 }}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ provinceData.totalComments || 0 }}</div>
            <div class="stat-label">评论总数</div>
          </div>
        </div>
      </div>
      
      <div class="overview-right">
        <div ref="provinceMapRef" class="province-map"></div>
      </div>
    </div>

    <!-- 数据图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h3>访问趋势</h3>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <h3>景区类型分布</h3>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <el-card class="chart-card">
            <template #header>
              <h3>城市景区分布</h3>
            </template>
            <div ref="cityChartRef" class="chart-container-large"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 景区列表 -->
    <div class="scenics-section">
      <el-card>
        <template #header>
          <div class="section-header">
            <h3>{{ provinceName }}热门景区</h3>
            <div class="filter-controls">
              <el-select v-model="filters.category" placeholder="景区类型" clearable>
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
              
              <el-select v-model="filters.level" placeholder="景区等级" clearable>
                <el-option label="5A级" value="5A" />
                <el-option label="4A级" value="4A" />
                <el-option label="3A级" value="3A" />
              </el-select>
              
              <el-select v-model="filters.sortBy" placeholder="排序方式">
                <el-option label="热度排序" value="visitCount" />
                <el-option label="评分排序" value="rating" />
                <el-option label="距离排序" value="distance" />
              </el-select>
            </div>
          </div>
        </template>
        
        <div class="scenics-grid">
          <div
            v-for="scenic in scenicList"
            :key="scenic.id"
            class="scenic-card"
            @click="goToScenic(scenic.id)"
          >
            <div class="scenic-image">
              <img :src="scenic.images?.[0] || '/default-scenic.jpg'" :alt="scenic.name" />
              <div class="scenic-level">{{ scenic.level }}</div>
            </div>
            
            <div class="scenic-content">
              <h4>{{ scenic.name }}</h4>
              <p class="scenic-location">
                <el-icon><Location /></el-icon>
                {{ scenic.city }} {{ scenic.district }}
              </p>
              <p class="scenic-description">{{ scenic.description }}</p>
              
              <div class="scenic-meta">
                <div class="rating">
                  <el-rate :model-value="scenic.rating" disabled show-score />
                </div>
                <div class="visit-count">
                  <el-icon><View /></el-icon>
                  {{ scenic.visitCount }}人访问
                </div>
              </div>
              
              <div class="scenic-actions">
                <el-button size="small" @click.stop="toggleFavorite(scenic)">
                  <el-icon><StarFilled v-if="scenic.isFavorite" /><Star v-else /></el-icon>
                  {{ scenic.isFavorite ? '已收藏' : '收藏' }}
                </el-button>
                <el-button type="primary" size="small" @click.stop="goToTickets(scenic.id)">
                  查看门票
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[12, 24, 48]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Location,
  View,
  Star,
  StarFilled
} from '@element-plus/icons-vue'

import { createChart, getTrendLineOption, getRatingPieOption } from '@/utils/echarts'
import { getProvinceScenic, getScenicList, getScenicCategories } from '@/api/scenic'
import { getProvinceStatistics, getProvinceHeatmapData } from '@/api/data'
import { addFavorite, removeFavorite } from '@/api/user'
import { formatDate } from '@/utils'

export default {
  name: 'ProvincePage',
  components: {
    ArrowLeft,
    Location,
    View,
    Star,
    StarFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const provinceName = ref('')
    const provinceData = reactive({
      totalScenics: 0,
      todayVisits: 0,
      avgRating: 0,
      totalComments: 0
    })
    
    const scenicList = ref([])
    const categories = ref([])
    
    const filters = reactive({
      category: '',
      level: '',
      sortBy: 'visitCount'
    })
    
    const pagination = reactive({
      current: 1,
      size: 12,
      total: 0
    })
    
    // 图表引用
    const provinceMapRef = ref(null)
    const trendChartRef = ref(null)
    const categoryChartRef = ref(null)
    const cityChartRef = ref(null)
    
    let trendChart = null
    let categoryChart = null
    let cityChart = null
    
    // 加载省份数据
    const loadProvinceData = async () => {
      try {
        const provinceId = route.params.provinceId
        provinceName.value = provinceId
        
        // 加载省份统计数据
        const statsResponse = await getProvinceStatistics(provinceId)
        Object.assign(provinceData, statsResponse.data || {})
        
        // 加载景区分类
        const categoriesResponse = await getScenicCategories()
        categories.value = categoriesResponse.data || []
        
        // 加载景区列表
        await loadScenicList()
        
      } catch (error) {
        console.error('加载省份数据失败:', error)
        ElMessage.error('加载数据失败')
      }
    }
    
    // 加载景区列表
    const loadScenicList = async () => {
      try {
        const params = {
          province: provinceName.value,
          page: pagination.current,
          size: pagination.size,
          category: filters.category,
          level: filters.level,
          sortBy: filters.sortBy,
          sortOrder: 'desc'
        }
        
        const response = await getScenicList(params)
        const result = response.data || {}
        
        scenicList.value = result.records || []
        pagination.total = result.total || 0
        
      } catch (error) {
        console.error('加载景区列表失败:', error)
        ElMessage.error('加载景区列表失败')
      }
    }
    
    // 初始化图表
    const initCharts = () => {
      // 趋势图
      const dates = []
      const data = []
      const now = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        dates.push(formatDate(date, 'MM-DD'))
        data.push(Math.floor(Math.random() * 1000) + 500)
      }
      
      trendChart = createChart(trendChartRef.value)
      trendChart.setOption(getTrendLineOption(data, dates))
      
      // 类型分布饼图
      const categoryData = [
        { value: 35, name: '自然风光' },
        { value: 28, name: '历史文化' },
        { value: 20, name: '主题公园' },
        { value: 12, name: '博物馆' },
        { value: 15, name: '其他' }
      ]
      
      categoryChart = createChart(categoryChartRef.value)
      categoryChart.setOption(getRatingPieOption(categoryData))
      
      // 城市分布柱状图
      const cityData = ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴']
      const cityValues = [45, 32, 28, 25, 22, 20]
      
      cityChart = createChart(cityChartRef.value)
      cityChart.setOption({
        title: { text: '各城市景区数量' },
        tooltip: {},
        xAxis: { data: cityData },
        yAxis: {},
        series: [{
          name: '景区数量',
          type: 'bar',
          data: cityValues,
          itemStyle: {
            color: '#2196F3'
          }
        }]
      })
    }
    
    // 切换收藏
    const toggleFavorite = async (scenic) => {
      try {
        if (scenic.isFavorite) {
          await removeFavorite(scenic.id)
          scenic.isFavorite = false
          ElMessage.success('取消收藏成功')
        } else {
          await addFavorite(scenic.id)
          scenic.isFavorite = true
          ElMessage.success('收藏成功')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
    
    // 导航方法
    const goBack = () => {
      router.go(-1)
    }
    
    const goToScenic = (scenicId) => {
      router.push(`/scenic/${scenicId}`)
    }
    
    const goToTickets = (scenicId) => {
      router.push(`/scenic/${scenicId}?tab=tickets`)
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadScenicList()
    }
    
    const handleCurrentChange = (page) => {
      pagination.current = page
      loadScenicList()
    }
    
    // 窗口大小改变处理
    const handleResize = () => {
      if (trendChart) trendChart.resize()
      if (categoryChart) categoryChart.resize()
      if (cityChart) cityChart.resize()
    }
    
    // 监听筛选条件变化
    watch([() => filters.category, () => filters.level, () => filters.sortBy], () => {
      pagination.current = 1
      loadScenicList()
    })
    
    // 生命周期
    onMounted(() => {
      loadProvinceData()
      
      setTimeout(() => {
        initCharts()
      }, 100)
      
      window.addEventListener('resize', handleResize)
    })
    
    return {
      provinceName,
      provinceData,
      scenicList,
      categories,
      filters,
      pagination,
      provinceMapRef,
      trendChartRef,
      categoryChartRef,
      cityChartRef,
      toggleFavorite,
      goBack,
      goToScenic,
      goToTickets,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style lang="scss" scoped>
.province-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.province-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  
  .overview-left {
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    h1 {
      color: #333;
      font-size: 28px;
      margin-bottom: 30px;
      background: linear-gradient(45deg, #2196F3, #21CBF3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .province-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      
      .stat-item {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        color: white;
        
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }
  
  .overview-right {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    
    .province-map {
      width: 100%;
      height: 300px;
      border-radius: 12px;
    }
  }
}

.charts-section {
  margin-bottom: 30px;
  
  .chart-card {
    .chart-container {
      width: 100%;
      height: 250px;
    }
    
    .chart-container-large {
      width: 100%;
      height: 300px;
    }
  }
}

.scenics-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #333;
    }
    
    .filter-controls {
      display: flex;
      gap: 15px;
      
      .el-select {
        width: 150px;
      }
    }
  }
  
  .scenics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
    
    .scenic-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .scenic-image {
        position: relative;
        height: 200px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        &:hover img {
          transform: scale(1.1);
        }
        
        .scenic-level {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(45deg, #FF9800, #FF5722);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
      }
      
      .scenic-content {
        padding: 20px;
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #333;
          @include text-ellipsis;
        }
        
        .scenic-location {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .scenic-description {
          color: #999;
          font-size: 13px;
          margin: 10px 0;
          @include text-ellipsis-multiline(2);
        }
        
        .scenic-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 15px 0;
          
          .visit-count {
            color: #666;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
        
        .scenic-actions {
          display: flex;
          gap: 10px;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .province-overview {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    .el-row {
      .el-col {
        margin-bottom: 20px;
      }
    }
  }
}

@media (max-width: 768px) {
  .province-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .province-overview .overview-left {
    .province-stats {
      grid-template-columns: 1fr;
    }
  }
  
  .scenics-section .section-header {
    flex-direction: column;
    gap: 15px;
    
    .filter-controls {
      width: 100%;
      justify-content: space-between;
      
      .el-select {
        flex: 1;
        width: auto;
      }
    }
  }
  
  .scenics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
