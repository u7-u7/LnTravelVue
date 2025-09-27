<template>
  <div class="recommend-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>景区推荐</h1>
        <p>基于AI算法为您推荐最适合的旅游景区</p>
      </div>
      
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <div class="filter-section">
        <h3>条件筛选</h3>
        
        <el-form :model="filters" inline class="filter-form">
          <el-form-item label="目的地">
            <el-cascader
              v-model="filters.location"
              :options="locationOptions"
              placeholder="选择省份/城市"
              clearable
              style="width: 200px"
              @change="handleFilterChange"
            />
          </el-form-item>
          
          <el-form-item label="景区类型">
            <el-select
              v-model="filters.category"
              placeholder="选择类型"
              clearable
              style="width: 150px"
              @change="handleFilterChange"
            >
              <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="景区等级">
            <el-select
              v-model="filters.level"
              placeholder="选择等级"
              clearable
              style="width: 120px"
              @change="handleFilterChange"
            >
              <el-option label="5A级" value="5A" />
              <el-option label="4A级" value="4A" />
              <el-option label="3A级" value="3A" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="推荐类型">
            <el-select
              v-model="filters.type"
              placeholder="推荐类型"
              style="width: 130px"
              @change="handleFilterChange"
            >
              <el-option label="个性化推荐" value="personal" />
              <el-option label="热门推荐" value="hot" />
              <el-option label="AI推荐" value="ai" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="getRecommendations">
              <el-icon><Search /></el-icon>
              获取推荐
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧推荐列表 -->
      <div class="content-left">
        <!-- 推荐结果 -->
        <el-card class="recommendations-card">
          <template #header>
            <div class="card-header">
              <h3>为您推荐（{{ totalRecommendations }}个）</h3>
              <div class="sort-controls">
                <el-select v-model="sortBy" @change="handleSortChange" size="small">
                  <el-option label="推荐度" value="score" />
                  <el-option label="评分" value="rating" />
                  <el-option label="热度" value="popularity" />
                  <el-option label="距离" value="distance" />
                </el-select>
              </div>
            </div>
          </template>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="recommendations.length === 0" class="empty-container">
            <el-empty description="暂无推荐结果">
              <el-button type="primary" @click="getRecommendations">获取推荐</el-button>
            </el-empty>
          </div>
          
          <!-- 推荐列表 -->
          <div v-else class="recommendations-list">
            <div
              v-for="item in recommendations"
              :key="item.id"
              class="recommend-item"
              @click="goToScenic(item.scenicId)"
            >
              <div class="item-image">
                <img :src="item.scenicImage || '/default-scenic.jpg'" :alt="item.scenicName" />
                <div class="item-badges">
                  <el-tag v-if="item.isHot" type="danger" size="small">热门</el-tag>
                  <el-tag v-if="item.recommendType === 'ai'" type="success" size="small">AI推荐</el-tag>
                </div>
              </div>
              
              <div class="item-content">
                <div class="item-header">
                  <h3>{{ item.scenicName }}</h3>
                  <div class="item-score">
                    <span class="score-label">推荐度</span>
                    <span class="score-value">{{ item.score }}%</span>
                  </div>
                </div>
                
                <div class="item-meta">
                  <div class="meta-item">
                    <el-icon><Location /></el-icon>
                    <span>{{ item.location }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><Star /></el-icon>
                    <span>{{ item.rating }}分</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><View /></el-icon>
                    <span>{{ item.visitCount }}人访问</span>
                  </div>
                </div>
                
                <div class="item-reason">
                  <span class="reason-label">推荐理由：</span>
                  <span class="reason-text">{{ item.recommendReason }}</span>
                </div>
                
                <div class="item-tags">
                  <el-tag
                    v-for="tag in item.tags"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                
                <div class="item-actions">
                  <el-button size="small" @click.stop="toggleFavorite(item)">
                    <el-icon><StarFilled v-if="item.isFavorite" /><Star v-else /></el-icon>
                    {{ item.isFavorite ? '已收藏' : '收藏' }}
                  </el-button>
                  <el-button type="primary" size="small" @click.stop="viewTickets(item)">
                    查看门票
                  </el-button>
                  <el-button size="small" @click.stop="shareRecommend(item)">
                    <el-icon><Share /></el-icon>
                    分享
                  </el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div v-if="recommendations.length > 0" class="pagination-container">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="[6, 12, 24]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧AI助手 -->
      <div class="content-right">
        <!-- AI推荐助手 -->
        <el-card class="ai-assistant-card">
          <template #header>
            <div class="ai-header">
              <h3>
                <el-icon><ChatRound /></el-icon>
                AI旅游助手
              </h3>
              <el-tag type="success" size="small">在线</el-tag>
            </div>
          </template>
          
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div v-for="message in chatMessages" :key="message.id" class="chat-message">
                <div v-if="message.type === 'user'" class="user-message">
                  <div class="message-content">{{ message.content }}</div>
                  <img src="/user-avatar.jpg" class="message-avatar" />
                </div>
                
                <div v-else class="ai-message">
                  <img src="/ai-avatar.jpg" class="message-avatar" />
                  <div class="message-content">
                    <div class="message-text">{{ message.content }}</div>
                    <div v-if="message.recommendations?.length" class="message-recommendations">
                      <p>为您推荐以下景区：</p>
                      <div
                        v-for="rec in message.recommendations"
                        :key="rec.id"
                        class="recommendation-item"
                        @click="goToScenic(rec.scenicId)"
                      >
                        <img :src="rec.image" :alt="rec.name" />
                        <div class="rec-info">
                          <h5>{{ rec.name }}</h5>
                          <p>{{ rec.reason }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- AI正在输入 -->
              <div v-if="aiTyping" class="ai-message typing">
                <img src="/ai-avatar.jpg" class="message-avatar" />
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="chat-input">
              <el-input
                v-model="chatInput"
                placeholder="描述您的旅游需求，AI为您推荐..."
                @keyup.enter="sendMessage"
                :disabled="aiTyping"
              >
                <template #append>
                  <el-button
                    type="primary"
                    :loading="aiTyping"
                    @click="sendMessage"
                    :disabled="!chatInput.trim()"
                  >
                    发送
                  </el-button>
                </template>
              </el-input>
            </div>
            
            <div class="quick-questions">
              <p>快速提问：</p>
              <div class="questions-list">
                <el-tag
                  v-for="question in quickQuestions"
                  :key="question"
                  @click="selectQuickQuestion(question)"
                  style="cursor: pointer; margin: 5px;"
                >
                  {{ question }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 推荐统计 -->
        <el-card class="stats-card">
          <template #header>
            <h3>推荐统计</h3>
          </template>
          
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Aim /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ recommendStats.accuracy }}%</div>
                <div class="stat-label">推荐准确率</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ recommendStats.total }}</div>
                <div class="stat-label">累计推荐</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Like /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ recommendStats.liked }}</div>
                <div class="stat-label">喜欢推荐</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 热门标签 -->
        <el-card class="tags-card">
          <template #header>
            <h3>热门标签</h3>
          </template>
          
          <div class="tags-content">
            <el-tag
              v-for="tag in popularTags"
              :key="tag.name"
              :type="getTagType(tag.heat)"
              @click="filterByTag(tag.name)"
              style="cursor: pointer; margin: 8px 8px 0 0;"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Search,
  Location,
  Star,
  StarFilled,
  View,
  Share,
  ChatRound,
  Aim,
  TrendCharts,
  Like
} from '@element-plus/icons-vue'

import {
  getPersonalRecommend,
  getHotRecommend,
  getFilteredRecommend,
  aiChatRecommend
} from '@/api/recommend'
import { getScenicCategories } from '@/api/scenic'
import { addFavorite, removeFavorite } from '@/api/user'
import { generateId } from '@/utils'

export default {
  name: 'RecommendPage',
  components: {
    ArrowLeft,
    Search,
    Location,
    Star,
    StarFilled,
    View,
    Share,
    ChatRound,
    Aim,
    TrendCharts,
    Like
  },
  setup() {
    const router = useRouter()
    
    const loading = ref(false)
    const recommendations = ref([])
    const totalRecommendations = ref(0)
    const categories = ref([])
    
    const filters = reactive({
      location: [],
      category: '',
      level: '',
      type: 'personal'
    })
    
    const sortBy = ref('score')
    
    const pagination = reactive({
      current: 1,
      size: 6,
      total: 0
    })
    
    // 地区选项
    const locationOptions = [
      {
        value: 'beijing',
        label: '北京',
        children: [
          { value: 'beijing-city', label: '北京市' }
        ]
      },
      {
        value: 'shanghai',
        label: '上海',
        children: [
          { value: 'shanghai-city', label: '上海市' }
        ]
      },
      {
        value: 'guangdong',
        label: '广东',
        children: [
          { value: 'guangzhou', label: '广州市' },
          { value: 'shenzhen', label: '深圳市' }
        ]
      },
      {
        value: 'zhejiang',
        label: '浙江',
        children: [
          { value: 'hangzhou', label: '杭州市' },
          { value: 'ningbo', label: '宁波市' }
        ]
      }
    ]
    
    // AI聊天相关
    const chatInput = ref('')
    const chatMessages = ref([
      {
        id: 1,
        type: 'ai',
        content: '您好！我是您的AI旅游助手，可以根据您的需求为您推荐合适的景区。请告诉我您的旅游偏好吧！',
        timestamp: new Date()
      }
    ])
    const aiTyping = ref(false)
    const chatMessagesRef = ref(null)
    
    const quickQuestions = [
      '我想去海边度假',
      '推荐历史文化景区',
      '适合亲子游的地方',
      '周末两日游推荐',
      '春天赏花的景区'
    ]
    
    // 推荐统计
    const recommendStats = reactive({
      accuracy: 89,
      total: 156,
      liked: 128
    })
    
    // 热门标签
    const popularTags = [
      { name: '自然风光', count: 245, heat: 'high' },
      { name: '历史文化', count: 189, heat: 'high' },
      { name: '亲子游', count: 156, heat: 'medium' },
      { name: '摄影打卡', count: 134, heat: 'medium' },
      { name: '温泉度假', count: 98, heat: 'low' },
      { name: '登山徒步', count: 87, heat: 'low' }
    ]
    
    // 加载景区分类
    const loadCategories = async () => {
      try {
        const response = await getScenicCategories()
        categories.value = response.data || []
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }
    
    // 获取推荐
    const getRecommendations = async () => {
      loading.value = true
      try {
        let response
        
        if (filters.type === 'personal') {
          response = await getPersonalRecommend()
        } else if (filters.type === 'hot') {
          response = await getHotRecommend(pagination.size)
        } else {
          response = await getFilteredRecommend({
            province: filters.location[0],
            city: filters.location[1],
            category: filters.category,
            level: filters.level,
            limit: pagination.size
          })
        }
        
        const result = response.data || []
        
        recommendations.value = result.map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg',
          location: `${item.province} ${item.city}`,
          tags: ['风景优美', '值得一去'],
          isFavorite: false,
          isHot: Math.random() > 0.7,
          score: Math.floor(Math.random() * 30) + 70
        }))
        
        totalRecommendations.value = recommendations.value.length
        pagination.total = recommendations.value.length
        
      } catch (error) {
        console.error('获取推荐失败:', error)
        ElMessage.error('获取推荐失败')
      } finally {
        loading.value = false
      }
    }
    
    // 筛选条件变化
    const handleFilterChange = () => {
      pagination.current = 1
      getRecommendations()
    }
    
    // 排序变化
    const handleSortChange = () => {
      // 根据sortBy对recommendations进行排序
      recommendations.value.sort((a, b) => {
        switch (sortBy.value) {
          case 'score':
            return b.score - a.score
          case 'rating':
            return b.rating - a.rating
          case 'popularity':
            return b.visitCount - a.visitCount
          case 'distance':
            return a.distance - b.distance
          default:
            return 0
        }
      })
    }
    
    // 重置筛选
    const resetFilters = () => {
      filters.location = []
      filters.category = ''
      filters.level = ''
      filters.type = 'personal'
      getRecommendations()
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      getRecommendations()
    }
    
    const handleCurrentChange = (page) => {
      pagination.current = page
      getRecommendations()
    }
    
    // 发送AI消息
    const sendMessage = async () => {
      if (!chatInput.value.trim()) return
      
      const userMessage = {
        id: generateId(),
        type: 'user',
        content: chatInput.value,
        timestamp: new Date()
      }
      
      chatMessages.value.push(userMessage)
      
      const message = chatInput.value
      chatInput.value = ''
      aiTyping.value = true
      
      // 滚动到底部
      await nextTick()
      scrollToBottom()
      
      try {
        const response = await aiChatRecommend({
          message: message,
          sessionId: generateId()
        })
        
        const aiMessage = {
          id: generateId(),
          type: 'ai',
          content: response.data.reply || '抱歉，我暂时无法理解您的需求，请尝试更具体的描述。',
          recommendations: response.data.recommendations || [],
          timestamp: new Date()
        }
        
        chatMessages.value.push(aiMessage)
        
      } catch (error) {
        const errorMessage = {
          id: generateId(),
          type: 'ai',
          content: '抱歉，服务暂时不可用，请稍后再试。',
          timestamp: new Date()
        }
        chatMessages.value.push(errorMessage)
      } finally {
        aiTyping.value = false
        await nextTick()
        scrollToBottom()
      }
    }
    
    // 选择快速问题
    const selectQuickQuestion = (question) => {
      chatInput.value = question
      sendMessage()
    }
    
    // 滚动到底部
    const scrollToBottom = () => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    }
    
    // 切换收藏
    const toggleFavorite = async (item) => {
      try {
        if (item.isFavorite) {
          await removeFavorite(item.scenicId)
          item.isFavorite = false
          ElMessage.success('取消收藏成功')
        } else {
          await addFavorite(item.scenicId)
          item.isFavorite = true
          ElMessage.success('收藏成功')
        }
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
    
    // 获取标签类型
    const getTagType = (heat) => {
      const typeMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return typeMap[heat] || 'info'
    }
    
    // 按标签筛选
    const filterByTag = (tagName) => {
      // 可以根据标签筛选推荐结果
      ElMessage.info(`筛选标签：${tagName}`)
    }
    
    // 导航方法
    const goBack = () => {
      router.go(-1)
    }
    
    const goToScenic = (scenicId) => {
      router.push(`/scenic/${scenicId}`)
    }
    
    const viewTickets = (item) => {
      router.push(`/scenic/${item.scenicId}?tab=tickets`)
    }
    
    const shareRecommend = (item) => {
      ElMessage.info('分享功能开发中')
    }
    
    // 生命周期
    onMounted(() => {
      loadCategories()
      getRecommendations()
    })
    
    return {
      loading,
      recommendations,
      totalRecommendations,
      categories,
      filters,
      sortBy,
      pagination,
      locationOptions,
      chatInput,
      chatMessages,
      aiTyping,
      chatMessagesRef,
      quickQuestions,
      recommendStats,
      popularTags,
      handleFilterChange,
      handleSortChange,
      resetFilters,
      handleSizeChange,
      handleCurrentChange,
      getRecommendations,
      sendMessage,
      selectQuickQuestion,
      toggleFavorite,
      getTagType,
      filterByTag,
      goBack,
      goToScenic,
      viewTickets,
      shareRecommend
    }
  }
}
</script>

<style lang="scss" scoped>
.recommend-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .header-content {
    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #333;
      background: linear-gradient(45deg, #2196F3, #21CBF3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }
  }
}

.filter-card {
  margin-bottom: 20px;
  
  .filter-section {
    h3 {
      margin: 0 0 20px 0;
      color: #333;
    }
    
    .filter-form {
      .el-form-item {
        margin-right: 20px;
        margin-bottom: 15px;
      }
    }
  }
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.content-left {
  .recommendations-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: #333;
      }
    }
    
    .loading-container,
    .empty-container {
      padding: 40px;
      text-align: center;
    }
    
    .recommendations-list {
      .recommend-item {
        display: flex;
        gap: 20px;
        padding: 20px;
        border: 1px solid #e4e7ed;
        border-radius: 12px;
        margin-bottom: 20px;
        background: white;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .item-image {
          position: relative;
          width: 200px;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .item-badges {
            position: absolute;
            top: 8px;
            left: 8px;
            
            .el-tag {
              margin-right: 4px;
            }
          }
        }
        
        .item-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            
            h3 {
              margin: 0;
              font-size: 20px;
              color: #333;
              font-weight: 600;
            }
            
            .item-score {
              text-align: right;
              
              .score-label {
                font-size: 12px;
                color: #999;
                display: block;
              }
              
              .score-value {
                font-size: 18px;
                font-weight: bold;
                color: #2196F3;
              }
            }
          }
          
          .item-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 12px;
            
            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #666;
              font-size: 14px;
              
              .el-icon {
                color: #2196F3;
              }
            }
          }
          
          .item-reason {
            margin-bottom: 12px;
            
            .reason-label {
              color: #999;
              font-size: 14px;
            }
            
            .reason-text {
              color: #333;
              font-size: 14px;
              line-height: 1.6;
            }
          }
          
          .item-tags {
            margin-bottom: 15px;
            
            .el-tag {
              margin-right: 8px;
            }
          }
          
          .item-actions {
            margin-top: auto;
            
            .el-button {
              margin-right: 10px;
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
}

.content-right {
  .ai-assistant-card {
    margin-bottom: 20px;
    
    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #333;
      }
    }
    
    .chat-container {
      .chat-messages {
        height: 400px;
        overflow-y: auto;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 15px;
        
        .chat-message {
          margin-bottom: 15px;
          
          .user-message {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            
            .message-content {
              background: #2196F3;
              color: white;
              padding: 10px 15px;
              border-radius: 18px 18px 4px 18px;
              max-width: 80%;
              word-wrap: break-word;
            }
            
            .message-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              flex-shrink: 0;
            }
          }
          
          .ai-message {
            display: flex;
            gap: 10px;
            
            &.typing .message-content {
              .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 10px;
                
                span {
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #ccc;
                  animation: typing 1.4s infinite;
                  
                  &:nth-child(2) {
                    animation-delay: 0.2s;
                  }
                  
                  &:nth-child(3) {
                    animation-delay: 0.4s;
                  }
                }
              }
            }
            
            .message-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              flex-shrink: 0;
            }
            
            .message-content {
              background: #f0f0f0;
              padding: 10px 15px;
              border-radius: 18px 18px 18px 4px;
              max-width: 80%;
              
              .message-text {
                color: #333;
                line-height: 1.6;
                margin-bottom: 10px;
              }
              
              .message-recommendations {
                p {
                  margin: 0 0 8px 0;
                  font-size: 14px;
                  color: #666;
                }
                
                .recommendation-item {
                  display: flex;
                  gap: 8px;
                  padding: 8px;
                  border: 1px solid #e4e7ed;
                  border-radius: 6px;
                  margin-bottom: 6px;
                  cursor: pointer;
                  transition: background 0.3s ease;
                  
                  &:hover {
                    background: #f8f9fa;
                  }
                  
                  img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 4px;
                  }
                  
                  .rec-info {
                    flex: 1;
                    
                    h5 {
                      margin: 0 0 2px 0;
                      font-size: 14px;
                      color: #333;
                    }
                    
                    p {
                      margin: 0;
                      font-size: 12px;
                      color: #666;
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      .chat-input {
        margin-bottom: 15px;
      }
      
      .quick-questions {
        p {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }
        
        .questions-list {
          .el-tag {
            transition: all 0.3s ease;
            
            &:hover {
              background: #2196F3;
              color: white;
            }
          }
        }
      }
    }
  }
  
  .stats-card,
  .tags-card {
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
    }
    
    .stats-content {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(45deg, #2196F3, #21CBF3);
          display: flex;
          align-items: center;
          justify-content: center;
          
          .el-icon {
            font-size: 20px;
            color: white;
          }
        }
        
        .stat-info {
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            line-height: 1;
          }
          
          .stat-label {
            font-size: 14px;
            color: #666;
            margin-top: 4px;
          }
        }
      }
    }
    
    .tags-content {
      .el-tag {
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

// 动画
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    
    .content-right {
      order: -1;
    }
  }
  
  .recommend-item {
    flex-direction: column;
    
    .item-image {
      width: 100% !important;
      height: 200px !important;
    }
  }
}

@media (max-width: 768px) {
  .recommend-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .filter-form {
    .el-form-item {
      margin-right: 0 !important;
      width: 100%;
      
      .el-input,
      .el-select,
      .el-cascader {
        width: 100% !important;
      }
    }
  }
  
  .chat-container .chat-messages {
    height: 300px;
  }
}
</style>
