<template>
  <div class="user-center-page">
    <!-- 用户信息卡片 -->
    <el-card class="user-info-card">
      <div class="user-header">
        <div class="user-avatar-section">
          <img :src="userInfo.avatar || '/default-avatar.jpg'" class="user-avatar" />
          <el-button size="small" @click="showAvatarUpload">更换头像</el-button>
        </div>
        
        <div class="user-details">
          <h2>{{ userInfo.nickname || userInfo.username }}</h2>
          <div class="user-meta">
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>注册时间：{{ formatDate(userInfo.createTime, 'YYYY年MM月') }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Location /></el-icon>
              <span>已访问 {{ statistics.visitedCities }}个城市</span>
            </div>
            <div class="meta-item">
              <el-icon><Star /></el-icon>
              <span>收藏 {{ statistics.favoriteCount }}个景区</span>
            </div>
          </div>
        </div>
        
        <div class="user-actions">
          <el-button type="primary" @click="showEditProfile">编辑资料</el-button>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据统计 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><MapLocation /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.totalFootprints }}</div>
                <div class="stat-label">足迹记录</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.favoriteCount }}</div>
                <div class="stat-label">收藏景区</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><ChatLineSquare /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.commentCount }}</div>
                <div class="stat-label">发布评论</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon><Tickets /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.orderCount }}</div>
                <div class="stat-label">购买门票</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-left">
        <!-- 足迹地图 -->
        <el-card class="footprint-card">
          <template #header>
            <div class="card-header">
              <h3>
                <el-icon><MapLocation /></el-icon>
                我的足迹地图
              </h3>
              <el-button size="small" @click="addFootprint">
                <el-icon><Plus /></el-icon>
                添加足迹
              </el-button>
            </div>
          </template>
          
          <div class="map-container">
            <div ref="footprintMapRef" class="footprint-map"></div>
          </div>
          
          <div class="footprint-stats">
            <div class="stat-item">
              <span class="label">已访问城市：</span>
              <span class="value">{{ statistics.visitedCities }}个</span>
            </div>
            <div class="stat-item">
              <span class="label">足迹覆盖率：</span>
              <span class="value">{{ ((statistics.visitedCities / 334) * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </el-card>

        <!-- 最近足迹 -->
        <el-card class="recent-footprints">
          <template #header>
            <h3>最近足迹</h3>
          </template>
          
          <div class="footprints-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="footprint in recentFootprints"
                :key="footprint.id"
                :timestamp="formatDate(footprint.visitDate)"
                placement="top"
              >
                <div class="footprint-item" @click="goToScenic(footprint.scenicId)">
                  <img :src="footprint.scenicImage" :alt="footprint.scenicName" />
                  <div class="footprint-info">
                    <h4>{{ footprint.scenicName }}</h4>
                    <p>{{ footprint.location }}</p>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </div>

      <div class="content-right">
        <!-- 标签页 -->
        <el-card class="tabs-card">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 我的收藏 -->
            <el-tab-pane label="我的收藏" name="favorites">
              <div class="favorites-section">
                <div v-if="favorites.length === 0" class="empty-state">
                  <el-empty description="还没有收藏任何景区">
                    <el-button type="primary" @click="goToRecommend">去发现景区</el-button>
                  </el-empty>
                </div>
                
                <div v-else class="favorites-grid">
                  <div
                    v-for="favorite in favorites"
                    :key="favorite.id"
                    class="favorite-item"
                    @click="goToScenic(favorite.scenicId)"
                  >
                    <img :src="favorite.scenicImage" :alt="favorite.scenicName" />
                    <div class="favorite-info">
                      <h4>{{ favorite.scenicName }}</h4>
                      <p>{{ favorite.location }}</p>
                      <div class="favorite-meta">
                        <el-rate :model-value="favorite.rating" disabled size="small" />
                        <span class="collect-time">{{ formatDate(favorite.createTime, 'MM-DD') }}收藏</span>
                      </div>
                    </div>
                    <div class="favorite-actions">
                      <el-button 
                        size="small" 
                        type="danger" 
                        text
                        @click.stop="removeFavorite(favorite)"
                      >
                        取消收藏
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 我的订单 -->
            <el-tab-pane label="我的订单" name="orders">
              <div class="orders-section">
                <div class="order-filters">
                  <el-radio-group v-model="orderFilter" @change="loadOrders">
                    <el-radio-button label="">全部订单</el-radio-button>
                    <el-radio-button label="PENDING">待支付</el-radio-button>
                    <el-radio-button label="PAID">已支付</el-radio-button>
                    <el-radio-button label="USED">已使用</el-radio-button>
                    <el-radio-button label="CANCELLED">已取消</el-radio-button>
                  </el-radio-group>
                </div>
                
                <div v-if="orders.length === 0" class="empty-state">
                  <el-empty description="暂无订单记录" />
                </div>
                
                <div v-else class="orders-list">
                  <div v-for="order in orders" :key="order.id" class="order-item">
                    <div class="order-header">
                      <div class="order-info">
                        <span class="order-no">订单号：{{ order.orderNo }}</span>
                        <span class="order-time">{{ formatDate(order.createTime) }}</span>
                      </div>
                      <div class="order-status">
                        <el-tag :type="getOrderStatusType(order.status)">
                          {{ getOrderStatusText(order.status) }}
                        </el-tag>
                      </div>
                    </div>
                    
                    <div class="order-content">
                      <img :src="order.scenicImage" :alt="order.scenicName" />
                      <div class="order-details">
                        <h4>{{ order.scenicName }}</h4>
                        <p>{{ order.ticketName }} × {{ order.quantity }}</p>
                        <p class="visit-date">游玩日期：{{ formatDate(order.visitDate, 'YYYY-MM-DD') }}</p>
                      </div>
                      <div class="order-price">
                        <div class="total-amount">¥{{ order.totalAmount }}</div>
                      </div>
                    </div>
                    
                    <div class="order-actions">
                      <el-button v-if="order.status === 'PENDING'" type="primary" size="small">
                        立即支付
                      </el-button>
                      <el-button v-if="order.status === 'PAID'" size="small">
                        查看详情
                      </el-button>
                      <el-button v-if="order.status === 'USED'" size="small" @click="writeComment(order)">
                        写评论
                      </el-button>
                      <el-button v-if="order.status === 'PENDING'" size="small">
                        取消订单
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 我的评论 -->
            <el-tab-pane label="我的评论" name="comments">
              <div class="comments-section">
                <div v-if="myComments.length === 0" class="empty-state">
                  <el-empty description="还没有发布过评论" />
                </div>
                
                <div v-else class="comments-list">
                  <div v-for="comment in myComments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <div class="scenic-info">
                        <img :src="comment.scenicImage" :alt="comment.scenicName" />
                        <div>
                          <h4>{{ comment.scenicName }}</h4>
                          <div class="comment-rating">
                            <el-rate :model-value="comment.rating" disabled size="small" />
                          </div>
                        </div>
                      </div>
                      <div class="comment-time">
                        {{ formatDate(comment.createTime) }}
                      </div>
                    </div>
                    
                    <div class="comment-content">
                      <p>{{ comment.content }}</p>
                      <div v-if="comment.images?.length" class="comment-images">
                        <img 
                          v-for="(image, index) in comment.images.slice(0, 3)" 
                          :key="index"
                          :src="image" 
                          class="comment-image"
                        />
                      </div>
                    </div>
                    
                    <div class="comment-stats">
                      <span><el-icon><Like /></el-icon>{{ comment.likeCount }}</span>
                      <span><el-icon><ChatLineSquare /></el-icon>{{ comment.replyCount }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 个性推荐 -->
            <el-tab-pane label="个性推荐" name="recommendations">
              <div class="recommendations-section">
                <div class="recommend-header">
                  <h4>基于你的兴趣推荐</h4>
                  <el-button size="small" @click="refreshRecommendations">
                    <el-icon><Refresh /></el-icon>
                    刷新推荐
                  </el-button>
                </div>
                
                <div class="recommendations-grid">
                  <div
                    v-for="item in recommendations"
                    :key="item.id"
                    class="recommend-item"
                    @click="goToScenic(item.scenicId)"
                  >
                    <img :src="item.scenicImage" :alt="item.scenicName" />
                    <div class="recommend-info">
                      <h4>{{ item.scenicName }}</h4>
                      <p class="recommend-reason">{{ item.recommendReason }}</p>
                      <div class="recommend-meta">
                        <el-rate :model-value="item.rating" disabled size="small" />
                        <span class="distance">{{ item.distance }}km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="editProfileVisible"
      title="编辑个人资料"
      width="500px"
    >
      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="80px">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="profileForm.gender">
            <el-radio :label="0">保密</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="profileForm.birthday"
            type="date"
            placeholder="选择生日"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editProfileVisible = false">取消</el-button>
        <el-button type="primary" :loading="updating" @click="updateProfile">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加足迹对话框 -->
    <el-dialog
      v-model="addFootprintVisible"
      title="添加足迹"
      width="400px"
    >
      <el-form :model="footprintForm" label-width="80px">
        <el-form-item label="选择景区">
          <el-select
            v-model="footprintForm.scenicId"
            placeholder="搜索景区名称"
            filterable
            remote
            :remote-method="searchScenics"
            style="width: 100%"
          >
            <el-option
              v-for="scenic in scenicOptions"
              :key="scenic.id"
              :label="scenic.name"
              :value="scenic.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="访问日期">
          <el-date-picker
            v-model="footprintForm.visitDate"
            type="date"
            placeholder="选择访问日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="addFootprintVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFootprint">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Location,
  Star,
  MapLocation,
  ChatLineSquare,
  Tickets,
  Plus,
  Like,
  Refresh,
  EditPen
} from '@element-plus/icons-vue'

import { useUserStore } from '@/store/modules/user'
import { 
  getUserInfo, 
  updateUserInfo,
  getUserFootprints,
  addUserFootprint,
  getUserFavorites,
  removeFavorite as apiRemoveFavorite,
  getUserOrders
} from '@/api/user'
import { getCommentsByUserId } from '@/api/comment'
import { getPersonalRecommend } from '@/api/recommend'
import { searchScenic } from '@/api/scenic'
import { createMap } from '@/utils/map'
import { formatDate } from '@/utils'

export default {
  name: 'UserCenterPage',
  components: {
    Calendar,
    Location,
    Star,
    MapLocation,
    ChatLineSquare,
    Tickets,
    Plus,
    Like,
    Refresh,
    EditPen
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const activeTab = ref('favorites')
    const updating = ref(false)
    
    const userInfo = ref({})
    const statistics = reactive({
      totalFootprints: 0,
      visitedCities: 0,
      favoriteCount: 0,
      commentCount: 0,
      orderCount: 0
    })
    
    const recentFootprints = ref([])
    const favorites = ref([])
    const orders = ref([])
    const myComments = ref([])
    const recommendations = ref([])
    
    const orderFilter = ref('')
    
    // 编辑资料
    const editProfileVisible = ref(false)
    const profileFormRef = ref(null)
    const profileForm = reactive({
      nickname: '',
      gender: 0,
      birthday: '',
      phone: ''
    })
    
    const profileRules = {
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
      ]
    }
    
    // 添加足迹
    const addFootprintVisible = ref(false)
    const footprintForm = reactive({
      scenicId: '',
      visitDate: ''
    })
    const scenicOptions = ref([])
    
    // 地图引用
    const footprintMapRef = ref(null)
    let footprintMap = null
    
    // 加载用户信息
    const loadUserInfo = async () => {
      try {
        const response = await getUserInfo()
        userInfo.value = response.data || {}
        
        // 更新统计数据（这里使用模拟数据，实际应该从API获取）
        statistics.totalFootprints = 15
        statistics.visitedCities = 8
        statistics.favoriteCount = 12
        statistics.commentCount = 5
        statistics.orderCount = 8
        
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }
    
    // 加载足迹数据
    const loadFootprints = async () => {
      try {
        const response = await getUserFootprints()
        const footprints = response.data || []
        
        recentFootprints.value = footprints.slice(0, 5).map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg',
          location: `${item.province} ${item.city}`
        }))
        
        // 初始化足迹地图
        if (footprintMapRef.value) {
          initFootprintMap(footprints)
        }
        
      } catch (error) {
        console.error('加载足迹数据失败:', error)
      }
    }
    
    // 加载收藏数据
    const loadFavorites = async () => {
      try {
        const response = await getUserFavorites()
        favorites.value = (response.data || []).map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg',
          location: `${item.province} ${item.city}`
        }))
        
      } catch (error) {
        console.error('加载收藏数据失败:', error)
      }
    }
    
    // 加载订单数据
    const loadOrders = async () => {
      try {
        const params = {
          status: orderFilter.value,
          page: 1,
          size: 20
        }
        
        const response = await getUserOrders(params)
        orders.value = (response.data?.records || []).map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg'
        }))
        
      } catch (error) {
        console.error('加载订单数据失败:', error)
      }
    }
    
    // 加载评论数据
    const loadMyComments = async () => {
      try {
        const response = await getCommentsByUserId()
        myComments.value = (response.data || []).map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg',
          images: item.images ? JSON.parse(item.images) : []
        }))
        
      } catch (error) {
        console.error('加载评论数据失败:', error)
      }
    }
    
    // 加载推荐数据
    const loadRecommendations = async () => {
      try {
        const response = await getPersonalRecommend()
        recommendations.value = (response.data || []).map(item => ({
          ...item,
          scenicImage: '/default-scenic.jpg',
          distance: Math.floor(Math.random() * 100) + 10
        }))
        
      } catch (error) {
        console.error('加载推荐数据失败:', error)
      }
    }
    
    // 初始化足迹地图
    const initFootprintMap = async (footprints) => {
      try {
        footprintMap = await createMap(footprintMapRef.value, {
          center: [116.397428, 39.90923],
          zoom: 5
        })
        
        // 添加足迹标记点
        footprints.forEach(footprint => {
          if (footprint.longitude && footprint.latitude) {
            // 添加标记点逻辑
          }
        })
        
      } catch (error) {
        console.error('初始化足迹地图失败:', error)
      }
    }
    
    // 标签页切换处理
    const handleTabChange = (tabName) => {
      switch (tabName) {
        case 'favorites':
          if (favorites.value.length === 0) loadFavorites()
          break
        case 'orders':
          if (orders.value.length === 0) loadOrders()
          break
        case 'comments':
          if (myComments.value.length === 0) loadMyComments()
          break
        case 'recommendations':
          if (recommendations.value.length === 0) loadRecommendations()
          break
      }
    }
    
    // 显示编辑资料对话框
    const showEditProfile = () => {
      Object.assign(profileForm, {
        nickname: userInfo.value.nickname || '',
        gender: userInfo.value.gender || 0,
        birthday: userInfo.value.birthday || '',
        phone: userInfo.value.phone || ''
      })
      editProfileVisible.value = true
    }
    
    // 更新个人资料
    const updateProfile = async () => {
      if (!profileFormRef.value) return
      
      await profileFormRef.value.validate(async (valid) => {
        if (valid) {
          updating.value = true
          try {
            await updateUserInfo(profileForm)
            ElMessage.success('资料更新成功')
            editProfileVisible.value = false
            loadUserInfo()
          } catch (error) {
            ElMessage.error('更新失败')
          } finally {
            updating.value = false
          }
        }
      })
    }
    
    // 搜索景区
    const searchScenics = async (query) => {
      if (!query) return
      
      try {
        const response = await searchScenic({ keyword: query, size: 10 })
        scenicOptions.value = response.data?.records || []
      } catch (error) {
        console.error('搜索景区失败:', error)
      }
    }
    
    // 添加足迹
    const addFootprint = () => {
      footprintForm.scenicId = ''
      footprintForm.visitDate = ''
      addFootprintVisible.value = true
    }
    
    const submitFootprint = async () => {
      if (!footprintForm.scenicId || !footprintForm.visitDate) {
        ElMessage.warning('请完善信息')
        return
      }
      
      try {
        await addUserFootprint(footprintForm)
        ElMessage.success('足迹添加成功')
        addFootprintVisible.value = false
        loadFootprints()
      } catch (error) {
        ElMessage.error('添加失败')
      }
    }
    
    // 取消收藏
    const removeFavorite = async (favorite) => {
      try {
        await ElMessageBox.confirm('确定要取消收藏吗？', '提示')
        await apiRemoveFavorite(favorite.scenicId)
        ElMessage.success('取消收藏成功')
        loadFavorites()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作失败')
        }
      }
    }
    
    // 获取订单状态类型
    const getOrderStatusType = (status) => {
      const typeMap = {
        PENDING: 'warning',
        PAID: 'success',
        USED: 'info',
        CANCELLED: 'danger',
        REFUNDED: 'info'
      }
      return typeMap[status] || 'info'
    }
    
    // 获取订单状态文本
    const getOrderStatusText = (status) => {
      const textMap = {
        PENDING: '待支付',
        PAID: '已支付',
        USED: '已使用',
        CANCELLED: '已取消',
        REFUNDED: '已退款'
      }
      return textMap[status] || status
    }
    
    // 写评论
    const writeComment = (order) => {
      router.push(`/scenic/${order.scenicId}?tab=comments`)
    }
    
    // 刷新推荐
    const refreshRecommendations = () => {
      loadRecommendations()
    }
    
    // 导航方法
    const goToScenic = (scenicId) => {
      router.push(`/scenic/${scenicId}`)
    }
    
    const goToRecommend = () => {
      router.push('/recommend')
    }
    
    const showAvatarUpload = () => {
      ElMessage.info('头像上传功能开发中')
    }
    
    const logout = async () => {
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示')
        userStore.logout()
        router.push('/login')
      } catch (error) {
        // 取消操作
      }
    }
    
    // 生命周期
    onMounted(() => {
      loadUserInfo()
      loadFootprints()
      loadFavorites()
    })
    
    return {
      activeTab,
      updating,
      userInfo,
      statistics,
      recentFootprints,
      favorites,
      orders,
      myComments,
      recommendations,
      orderFilter,
      editProfileVisible,
      profileFormRef,
      profileForm,
      profileRules,
      addFootprintVisible,
      footprintForm,
      scenicOptions,
      footprintMapRef,
      handleTabChange,
      showEditProfile,
      updateProfile,
      searchScenics,
      addFootprint,
      submitFootprint,
      removeFavorite,
      getOrderStatusType,
      getOrderStatusText,
      writeComment,
      refreshRecommendations,
      goToScenic,
      goToRecommend,
      showAvatarUpload,
      logout,
      loadOrders,
      formatDate
    }
  }
}
</script>

<style lang="scss" scoped>
.user-center-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.user-info-card {
  margin-bottom: 20px;
  
  .user-header {
    display: flex;
    align-items: flex-start;
    gap: 30px;
    
    .user-avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      
      .user-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid #f0f0f0;
      }
    }
    
    .user-details {
      flex: 1;
      
      h2 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 24px;
      }
      
      .user-meta {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
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
    }
    
    .user-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.stats-section {
  margin-bottom: 20px;
  
  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(45deg, #2196F3, #21CBF3);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          font-size: 24px;
          color: white;
        }
      }
      
      .stat-info {
        .stat-number {
          font-size: 28px;
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
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.content-left {
  .footprint-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
    
    .map-container {
      .footprint-map {
        width: 100%;
        height: 300px;
        border-radius: 8px;
        background: #f0f0f0;
      }
    }
    
    .footprint-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #f0f0f0;
      
      .stat-item {
        .label {
          color: #666;
        }
        
        .value {
          color: #2196F3;
          font-weight: bold;
        }
      }
    }
  }
  
  .recent-footprints {
    .footprints-timeline {
      max-height: 400px;
      overflow-y: auto;
      
      .footprint-item {
        display: flex;
        gap: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 8px;
          margin: -8px;
        }
        
        img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
        }
        
        .footprint-info {
          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #333;
          }
          
          p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }
}

.content-right {
  .tabs-card {
    .favorites-section,
    .orders-section,
    .comments-section,
    .recommendations-section {
      min-height: 400px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px 0;
    }
    
    // 收藏页面样式
    .favorites-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
      
      .favorite-item {
        display: flex;
        gap: 12px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #e3f2fd;
        }
        
        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }
        
        .favorite-info {
          flex: 1;
          
          h4 {
            margin: 0 0 4px 0;
            font-size: 16px;
            color: #333;
          }
          
          p {
            margin: 0 0 8px 0;
            color: #666;
            font-size: 14px;
          }
          
          .favorite-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
            .collect-time {
              font-size: 12px;
              color: #999;
            }
          }
        }
        
        .favorite-actions {
          display: flex;
          align-items: center;
        }
      }
    }
    
    // 订单页面样式
    .order-filters {
      margin-bottom: 20px;
    }
    
    .orders-list {
      .order-item {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        margin-bottom: 15px;
        overflow: hidden;
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #e4e7ed;
          
          .order-info {
            display: flex;
            gap: 20px;
            
            .order-no {
              color: #333;
              font-weight: 500;
            }
            
            .order-time {
              color: #666;
              font-size: 14px;
            }
          }
        }
        
        .order-content {
          display: flex;
          gap: 15px;
          padding: 15px;
          
          img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 6px;
          }
          
          .order-details {
            flex: 1;
            
            h4 {
              margin: 0 0 8px 0;
              color: #333;
            }
            
            p {
              margin: 4px 0;
              color: #666;
              font-size: 14px;
              
              &.visit-date {
                color: #2196F3;
              }
            }
          }
          
          .order-price {
            text-align: right;
            
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #FF5722;
            }
          }
        }
        
        .order-actions {
          padding: 15px;
          border-top: 1px solid #f0f0f0;
          text-align: right;
          
          .el-button {
            margin-left: 10px;
          }
        }
      }
    }
    
    // 评论页面样式
    .comments-list {
      .comment-item {
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        
        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .scenic-info {
            display: flex;
            gap: 12px;
            align-items: center;
            
            img {
              width: 50px;
              height: 50px;
              object-fit: cover;
              border-radius: 6px;
            }
            
            h4 {
              margin: 0 0 4px 0;
              font-size: 16px;
              color: #333;
            }
          }
          
          .comment-time {
            color: #666;
            font-size: 14px;
          }
        }
        
        .comment-content {
          margin-bottom: 12px;
          
          p {
            color: #333;
            line-height: 1.6;
            margin-bottom: 10px;
          }
          
          .comment-images {
            display: flex;
            gap: 8px;
            
            .comment-image {
              width: 60px;
              height: 60px;
              object-fit: cover;
              border-radius: 4px;
            }
          }
        }
        
        .comment-stats {
          display: flex;
          gap: 20px;
          color: #666;
          font-size: 14px;
          
          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
    
    // 推荐页面样式
    .recommendations-section {
      .recommend-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h4 {
          margin: 0;
          color: #333;
        }
      }
      
      .recommendations-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        
        .recommend-item {
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
          
          .recommend-info {
            flex: 1;
            
            h4 {
              margin: 0 0 6px 0;
              font-size: 16px;
              color: #333;
            }
            
            .recommend-reason {
              color: #666;
              font-size: 14px;
              margin: 4px 0;
            }
            
            .recommend-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 8px;
              
              .distance {
                color: #999;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .user-center-page {
    padding: 15px;
  }
  
  .stats-section {
    .el-row .el-col {
      margin-bottom: 15px;
    }
  }
  
  .user-header .user-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
