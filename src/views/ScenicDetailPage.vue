<template>
  <div class="scenic-detail-page">
    <!-- 顶部图片轮播 -->
    <div class="scenic-hero">
      <el-carousel height="400px" interval="5000">
        <el-carousel-item v-for="(image, index) in scenic.images" :key="index">
          <img :src="image" :alt="scenic.name" />
        </el-carousel-item>
      </el-carousel>
      
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button circle @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
      </div>
      
      <!-- 收藏按钮 -->
      <div class="favorite-button">
        <el-button circle @click="toggleFavorite">
          <el-icon><StarFilled v-if="scenic.isFavorite" /><Star v-else /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-left">
        <!-- 景区基本信息 -->
        <el-card class="scenic-info-card">
          <div class="scenic-header">
            <div class="scenic-title">
              <h1>{{ scenic.name }}</h1>
              <div class="scenic-level">{{ scenic.level }}</div>
            </div>
            
            <div class="scenic-rating">
              <el-rate :model-value="scenic.rating" disabled show-score />
              <span class="rating-text">{{ scenic.rating }}分</span>
            </div>
          </div>
          
          <div class="scenic-meta">
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>{{ scenic.province }} {{ scenic.city }} {{ scenic.district }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ scenic.openTime }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Phone /></el-icon>
              <span>{{ scenic.phone }}</span>
            </div>
            <div class="meta-item">
              <el-icon><View /></el-icon>
              <span>{{ scenic.visitCount }}人访问</span>
            </div>
          </div>
          
          <div class="scenic-description">
            <h3>景区介绍</h3>
            <p>{{ scenic.description }}</p>
          </div>
          
          <div class="scenic-facilities" v-if="scenic.facilities?.length">
            <h3>服务设施</h3>
            <div class="facilities-list">
              <el-tag v-for="facility in scenic.facilities" :key="facility" class="facility-tag">
                {{ facility }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 标签页内容 -->
        <el-card class="tabs-card">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 门票信息 -->
            <el-tab-pane label="门票信息" name="tickets">
              <div class="tickets-section">
                <div v-if="tickets.length === 0" class="empty-state">
                  <el-empty description="暂无门票信息" />
                </div>
                
                <div v-else class="tickets-list">
                  <div v-for="ticket in tickets" :key="ticket.id" class="ticket-item">
                    <div class="ticket-info">
                      <h4>{{ ticket.name }}</h4>
                      <p class="ticket-desc">{{ ticket.description }}</p>
                      <div class="ticket-meta">
                        <span class="ticket-type">{{ getTicketTypeText(ticket.type) }}</span>
                        <span class="ticket-valid">有效期：{{ ticket.validDays }}天</span>
                      </div>
                    </div>
                    
                    <div class="ticket-price">
                      <div class="current-price">¥{{ ticket.price }}</div>
                      <div v-if="ticket.originalPrice && ticket.originalPrice !== ticket.price" class="original-price">
                        ¥{{ ticket.originalPrice }}
                      </div>
                    </div>
                    
                    <div class="ticket-actions">
                      <el-button type="primary" @click="buyTicket(ticket)">
                        立即购买
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <!-- 秒杀活动 -->
                <div v-if="seckillActivities.length > 0" class="seckill-section">
                  <h3>
                    <el-icon><Lightning /></el-icon>
                    限时秒杀
                  </h3>
                  
                  <div class="seckill-list">
                    <div v-for="activity in seckillActivities" :key="activity.id" class="seckill-item">
                      <div class="seckill-header">
                        <h4>{{ activity.title }}</h4>
                        <div class="seckill-countdown">
                          <el-countdown :value="activity.endTime" />
                        </div>
                      </div>
                      
                      <div class="seckill-content">
                        <div class="seckill-price">
                          <span class="current">¥{{ activity.seckillPrice }}</span>
                          <span class="original">¥{{ activity.originalPrice }}</span>
                        </div>
                        
                        <div class="seckill-progress">
                          <el-progress 
                            :percentage="(activity.sold / activity.stock) * 100" 
                            :show-text="false"
                          />
                          <span class="progress-text">已售{{ activity.sold }}/{{ activity.stock }}</span>
                        </div>
                        
                        <el-button 
                          type="danger" 
                          :disabled="activity.sold >= activity.stock"
                          @click="participateSeckill(activity)"
                        >
                          {{ activity.sold >= activity.stock ? '已售罄' : '立即秒杀' }}
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 评论评价 -->
            <el-tab-pane label="评论评价" name="comments">
              <div class="comments-section">
                <!-- 评分统计 -->
                <div class="rating-stats">
                  <div class="overall-rating">
                    <div class="rating-number">{{ scenic.rating }}</div>
                    <div class="rating-stars">
                      <el-rate :model-value="scenic.rating" disabled />
                    </div>
                    <div class="rating-count">{{ commentStats.total }}条评论</div>
                  </div>
                  
                  <div class="rating-breakdown">
                    <div v-for="item in commentStats.breakdown" :key="item.rating" class="rating-row">
                      <span>{{ item.rating }}星</span>
                      <el-progress :percentage="item.percentage" :show-text="false" />
                      <span>{{ item.count }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 评论筛选 -->
                <div class="comment-filters">
                  <el-radio-group v-model="commentFilter" @change="loadComments">
                    <el-radio-button label="">全部</el-radio-button>
                    <el-radio-button label="5">好评</el-radio-button>
                    <el-radio-button label="3,4">中评</el-radio-button>
                    <el-radio-button label="1,2">差评</el-radio-button>
                    <el-radio-button label="image">有图</el-radio-button>
                  </el-radio-group>
                  
                  <el-input
                    v-model="commentKeyword"
                    placeholder="搜索评论关键词"
                    style="width: 200px;"
                    @change="loadComments"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                
                <!-- 评论列表 -->
                <div class="comments-list">
                  <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <div class="user-info">
                        <img :src="comment.userAvatar || '/default-avatar.jpg'" class="user-avatar" />
                        <div class="user-details">
                          <div class="username">{{ comment.username || '匿名用户' }}</div>
                          <div class="comment-time">{{ formatDate(comment.createTime) }}</div>
                        </div>
                      </div>
                      
                      <el-rate :model-value="comment.rating" disabled size="small" />
                    </div>
                    
                    <div class="comment-content">
                      <p>{{ comment.content }}</p>
                      
                      <div v-if="comment.images?.length" class="comment-images">
                        <img 
                          v-for="(image, index) in comment.images" 
                          :key="index"
                          :src="image" 
                          class="comment-image"
                          @click="previewImage(comment.images, index)"
                        />
                      </div>
                    </div>
                    
                    <div class="comment-actions">
                      <el-button text @click="likeComment(comment)">
                        <el-icon><Like /></el-icon>
                        {{ comment.likeCount }}
                      </el-button>
                      <el-button text @click="showReplies(comment)">
                        <el-icon><ChatLineSquare /></el-icon>
                        {{ comment.replyCount }}
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <!-- 查看更多评论 -->
                <div class="more-comments">
                  <el-button @click="goToComments">查看更多评论</el-button>
                </div>
              </div>
            </el-tab-pane>

            <!-- 周边推荐 -->
            <el-tab-pane label="周边推荐" name="nearby">
              <div class="nearby-section">
                <div class="nearby-scenics">
                  <h3>周边景区</h3>
                  <div class="nearby-list">
                    <div v-for="item in nearbyScenics" :key="item.id" class="nearby-item" @click="goToScenic(item.id)">
                      <img :src="item.image" :alt="item.name" />
                      <div class="nearby-info">
                        <h4>{{ item.name }}</h4>
                        <p>{{ item.distance }}km</p>
                        <el-rate :model-value="item.rating" disabled size="small" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>

      <!-- 右侧侧边栏 -->
      <div class="content-right">
        <!-- 访问趋势 -->
        <el-card class="side-card">
          <template #header>
            <h3>访问趋势</h3>
          </template>
          <div ref="trendChartRef" class="side-chart"></div>
        </el-card>
        
        <!-- 快速操作 -->
        <el-card class="side-card">
          <template #header>
            <h3>快速操作</h3>
          </template>
          <div class="quick-actions">
            <el-button type="primary" block @click="shareScenic">
              <el-icon><Share /></el-icon>
              分享景区
            </el-button>
            <el-button block @click="addToFootprint">
              <el-icon><MapLocation /></el-icon>
              标记已访问
            </el-button>
            <el-button block @click="getDirections">
              <el-icon><Position /></el-icon>
              查看路线
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElImageViewer } from 'element-plus'
import {
  ArrowLeft,
  Star,
  StarFilled,
  Location,
  Clock,
  Phone,
  View,
  Lightning,
  Search,
  Like,
  ChatLineSquare,
  Share,
  MapLocation,
  Position
} from '@element-plus/icons-vue'

import { getScenicDetail } from '@/api/scenic'
import { getTicketsByScenicId, getSeckillByTicketId } from '@/api/ticket'
import { getCommentsByScenicId, getRatingStatistics, likeComment as apiLikeComment } from '@/api/comment'
import { addFavorite, removeFavorite, addUserFootprint } from '@/api/user'
import { getScenicTrend } from '@/api/data'
import { createChart, getTrendLineOption } from '@/utils/echarts'
import { formatDate } from '@/utils'

export default {
  name: 'ScenicDetailPage',
  components: {
    ArrowLeft,
    Star,
    StarFilled,
    Location,
    Clock,
    Phone,
    View,
    Lightning,
    Search,
    Like,
    ChatLineSquare,
    Share,
    MapLocation,
    Position
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const scenic = reactive({
      id: null,
      name: '',
      rating: 0,
      level: '',
      province: '',
      city: '',
      district: '',
      openTime: '',
      phone: '',
      visitCount: 0,
      description: '',
      images: [],
      facilities: [],
      isFavorite: false
    })
    
    const activeTab = ref('tickets')
    const tickets = ref([])
    const seckillActivities = ref([])
    const comments = ref([])
    const commentStats = reactive({
      total: 0,
      breakdown: []
    })
    const nearbyScenics = ref([])
    
    const commentFilter = ref('')
    const commentKeyword = ref('')
    
    const trendChartRef = ref(null)
    let trendChart = null
    
    // 加载景区详情
    const loadScenicDetail = async () => {
      try {
        const scenicId = route.params.scenicId
        const response = await getScenicDetail(scenicId)
        const data = response.data || {}
        
        Object.assign(scenic, {
          ...data,
          images: JSON.parse(data.images || '[]'),
          facilities: JSON.parse(data.facilities || '[]')
        })
        
        // 检查URL参数中的tab
        const tabParam = route.query.tab
        if (tabParam) {
          activeTab.value = tabParam
        }
        
      } catch (error) {
        console.error('加载景区详情失败:', error)
        ElMessage.error('加载景区详情失败')
      }
    }
    
    // 加载门票信息
    const loadTickets = async () => {
      try {
        const response = await getTicketsByScenicId(scenic.id)
        tickets.value = response.data || []
        
        // 加载秒杀活动
        for (const ticket of tickets.value) {
          const seckillResponse = await getSeckillByTicketId(ticket.id)
          const activities = seckillResponse.data || []
          seckillActivities.value.push(...activities)
        }
        
      } catch (error) {
        console.error('加载门票信息失败:', error)
      }
    }
    
    // 加载评论
    const loadComments = async () => {
      try {
        const params = {
          page: 1,
          size: 10,
          rating: commentFilter.value,
          keyword: commentKeyword.value
        }
        
        const response = await getCommentsByScenicId(scenic.id, params)
        comments.value = response.data?.records || []
        
        // 加载评分统计
        const statsResponse = await getRatingStatistics(scenic.id)
        const stats = statsResponse.data || []
        
        commentStats.total = stats.reduce((sum, item) => sum + item.count, 0)
        commentStats.breakdown = stats.map(item => ({
          ...item,
          percentage: commentStats.total > 0 ? (item.count / commentStats.total) * 100 : 0
        }))
        
      } catch (error) {
        console.error('加载评论失败:', error)
      }
    }
    
    // 初始化趋势图
    const initTrendChart = async () => {
      try {
        const response = await getScenicTrend(scenic.id, 7)
        const trendData = response.data || []
        
        const dates = trendData.map(item => formatDate(item.date, 'MM-DD'))
        const values = trendData.map(item => item.visitCount)
        
        trendChart = createChart(trendChartRef.value)
        trendChart.setOption(getTrendLineOption(values, dates))
        
      } catch (error) {
        console.error('加载趋势数据失败:', error)
      }
    }
    
    // 获取门票类型文本
    const getTicketTypeText = (type) => {
      const typeMap = {
        adult: '成人票',
        child: '儿童票',
        student: '学生票',
        senior: '老人票'
      }
      return typeMap[type] || type
    }
    
    // 处理标签页切换
    const handleTabChange = (tabName) => {
      if (tabName === 'tickets' && tickets.value.length === 0) {
        loadTickets()
      } else if (tabName === 'comments' && comments.value.length === 0) {
        loadComments()
      }
    }
    
    // 切换收藏
    const toggleFavorite = async () => {
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
    
    // 购买门票
    const buyTicket = (ticket) => {
      ElMessage.info('购票功能开发中')
    }
    
    // 参与秒杀
    const participateSeckill = (activity) => {
      ElMessage.info('秒杀功能开发中')
    }
    
    // 点赞评论
    const likeComment = async (comment) => {
      try {
        await apiLikeComment(comment.id)
        comment.likeCount++
        ElMessage.success('点赞成功')
      } catch (error) {
        ElMessage.error('点赞失败')
      }
    }
    
    // 预览图片
    const previewImage = (images, index) => {
      ElImageViewer({
        urlList: images,
        initialIndex: index
      })
    }
    
    // 导航方法
    const goBack = () => {
      router.go(-1)
    }
    
    const goToComments = () => {
      router.push(`/comments/${scenic.id}`)
    }
    
    const goToScenic = (scenicId) => {
      router.push(`/scenic/${scenicId}`)
    }
    
    // 快速操作
    const shareScenic = () => {
      ElMessage.info('分享功能开发中')
    }
    
    const addToFootprint = async () => {
      try {
        await addUserFootprint({
          scenicId: scenic.id,
          visitDate: new Date().toISOString().split('T')[0]
        })
        ElMessage.success('已标记为已访问')
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
    
    const getDirections = () => {
      ElMessage.info('导航功能开发中')
    }
    
    const showReplies = (comment) => {
      ElMessage.info('回复功能开发中')
    }
    
    // 监听路由参数变化
    watch(() => route.params.scenicId, () => {
      if (route.params.scenicId) {
        loadScenicDetail()
      }
    })
    
    // 生命周期
    onMounted(() => {
      loadScenicDetail()
      
      setTimeout(() => {
        initTrendChart()
      }, 100)
    })
    
    return {
      scenic,
      activeTab,
      tickets,
      seckillActivities,
      comments,
      commentStats,
      nearbyScenics,
      commentFilter,
      commentKeyword,
      trendChartRef,
      getTicketTypeText,
      handleTabChange,
      toggleFavorite,
      buyTicket,
      participateSeckill,
      likeComment,
      previewImage,
      goBack,
      goToComments,
      goToScenic,
      shareScenic,
      addToFootprint,
      getDirections,
      showReplies,
      formatDate,
      loadComments
    }
  }
}
</script>

<style lang="scss" scoped>
.scenic-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.scenic-hero {
  position: relative;
  height: 400px;
  
  .el-carousel {
    height: 100%;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .back-button,
  .favorite-button {
    position: absolute;
    top: 20px;
    z-index: 100;
    
    .el-button {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
    }
  }
  
  .back-button {
    left: 20px;
  }
  
  .favorite-button {
    right: 20px;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-left {
  .scenic-info-card {
    margin-bottom: 20px;
    
    .scenic-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      
      .scenic-title {
        display: flex;
        align-items: center;
        gap: 15px;
        
        h1 {
          margin: 0;
          font-size: 28px;
          color: #333;
        }
        
        .scenic-level {
          background: linear-gradient(45deg, #FF9800, #FF5722);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
        }
      }
      
      .scenic-rating {
        text-align: right;
        
        .rating-text {
          margin-left: 10px;
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      }
    }
    
    .scenic-meta {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #666;
        
        .el-icon {
          color: #2196F3;
        }
      }
    }
    
    .scenic-description,
    .scenic-facilities {
      margin-bottom: 25px;
      
      h3 {
        margin-bottom: 15px;
        color: #333;
        font-size: 18px;
      }
      
      p {
        line-height: 1.8;
        color: #666;
      }
    }
    
    .facilities-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .facility-tag {
        background: #e8f4ff;
        border: 1px solid #2196F3;
        color: #2196F3;
      }
    }
  }
  
  .tabs-card {
    .tickets-section {
      .tickets-list {
        .ticket-item {
          display: flex;
          align-items: center;
          padding: 20px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          margin-bottom: 15px;
          
          .ticket-info {
            flex: 1;
            
            h4 {
              margin: 0 0 8px 0;
              color: #333;
            }
            
            .ticket-desc {
              color: #666;
              margin: 5px 0;
            }
            
            .ticket-meta {
              display: flex;
              gap: 20px;
              font-size: 13px;
              color: #999;
            }
          }
          
          .ticket-price {
            text-align: right;
            margin-right: 20px;
            
            .current-price {
              font-size: 24px;
              font-weight: bold;
              color: #FF5722;
            }
            
            .original-price {
              font-size: 14px;
              color: #999;
              text-decoration: line-through;
            }
          }
        }
      }
      
      .seckill-section {
        margin-top: 30px;
        
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
          margin-bottom: 20px;
        }
        
        .seckill-list {
          .seckill-item {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 15px;
            
            .seckill-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              
              h4 {
                margin: 0;
              }
            }
            
            .seckill-content {
              display: flex;
              align-items: center;
              gap: 20px;
              
              .seckill-price {
                .current {
                  font-size: 28px;
                  font-weight: bold;
                  margin-right: 10px;
                }
                
                .original {
                  font-size: 16px;
                  text-decoration: line-through;
                  opacity: 0.8;
                }
              }
              
              .seckill-progress {
                flex: 1;
                
                .progress-text {
                  font-size: 12px;
                  margin-top: 5px;
                  display: block;
                }
              }
            }
          }
        }
      }
    }
    
    .comments-section {
      .rating-stats {
        display: flex;
        gap: 40px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 20px;
        
        .overall-rating {
          text-align: center;
          
          .rating-number {
            font-size: 48px;
            font-weight: bold;
            color: #2196F3;
          }
          
          .rating-count {
            color: #666;
            margin-top: 5px;
          }
        }
        
        .rating-breakdown {
          flex: 1;
          
          .rating-row {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 8px;
            
            span:first-child {
              width: 40px;
              color: #666;
            }
            
            .el-progress {
              flex: 1;
            }
            
            span:last-child {
              width: 30px;
              color: #666;
              text-align: right;
            }
          }
        }
      }
      
      .comment-filters {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .comments-list {
        .comment-item {
          padding: 20px;
          border-bottom: 1px solid #e4e7ed;
          
          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            
            .user-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
              }
              
              .username {
                font-weight: 500;
              }
              
              .comment-time {
                font-size: 12px;
                color: #999;
              }
            }
          }
          
          .comment-content {
            margin-bottom: 15px;
            
            p {
              line-height: 1.8;
              color: #333;
            }
            
            .comment-images {
              display: flex;
              gap: 10px;
              margin-top: 10px;
              
              .comment-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 4px;
                cursor: pointer;
              }
            }
          }
          
          .comment-actions {
            display: flex;
            gap: 20px;
          }
        }
      }
      
      .more-comments {
        text-align: center;
        margin-top: 20px;
      }
    }
    
    .nearby-section {
      .nearby-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        
        .nearby-item {
          display: flex;
          gap: 12px;
          padding: 15px;
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          
          img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
          }
          
          .nearby-info {
            flex: 1;
            
            h4 {
              margin: 0 0 5px 0;
              font-size: 16px;
            }
            
            p {
              color: #666;
              margin: 5px 0;
            }
          }
        }
      }
    }
  }
}

.content-right {
  .side-card {
    margin-bottom: 20px;
    
    .side-chart {
      width: 100%;
      height: 200px;
    }
    
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    
    .content-right {
      order: -1;
      
      .side-card {
        .side-chart {
          height: 150px;
        }
        
        .quick-actions {
          flex-direction: row;
          flex-wrap: wrap;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .scenic-info-card {
    .scenic-header {
      flex-direction: column;
      gap: 15px;
    }
    
    .scenic-meta {
      grid-template-columns: 1fr;
    }
  }
  
  .tickets-section {
    .ticket-item {
      flex-direction: column;
      text-align: center;
      gap: 15px;
    }
  }
  
  .rating-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .nearby-section .nearby-list {
    grid-template-columns: 1fr;
  }
}
</style>
