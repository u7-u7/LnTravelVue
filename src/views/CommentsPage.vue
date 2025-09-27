<template>
  <div class="comments-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: `/scenic/${scenicId}` }">{{ scenicName }}</el-breadcrumb-item>
        <el-breadcrumb-item>评论</el-breadcrumb-item>
      </el-breadcrumb>
      
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回景区
        </el-button>
        <el-button type="primary" @click="showWriteComment">
          <el-icon><EditPen /></el-icon>
          写评论
        </el-button>
      </div>
    </div>

    <!-- 评分概览 -->
    <el-card class="rating-overview">
      <div class="overview-content">
        <div class="overall-rating">
          <div class="rating-number">{{ overallRating }}</div>
          <div class="rating-stars">
            <el-rate :model-value="overallRating" disabled />
          </div>
          <div class="rating-text">综合评分</div>
          <div class="rating-count">基于{{ totalComments }}条评论</div>
        </div>
        
        <div class="rating-breakdown">
          <div v-for="item in ratingBreakdown" :key="item.rating" class="rating-row">
            <span class="rating-label">{{ item.rating }}星</span>
            <div class="rating-bar">
              <el-progress 
                :percentage="item.percentage" 
                :show-text="false"
                :stroke-width="8"
              />
            </div>
            <span class="rating-count">{{ item.count }}</span>
          </div>
        </div>
        
        <div class="rating-tags">
          <h4>热门标签</h4>
          <div class="tags-list">
            <el-tag 
              v-for="tag in popularTags" 
              :key="tag.name"
              size="large"
              @click="filterByTag(tag.name)"
            >
              {{ tag.name }} ({{ tag.count }})
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 筛选和排序 -->
    <el-card class="filter-card">
      <div class="filter-controls">
        <div class="filter-left">
          <el-radio-group v-model="filters.rating" @change="handleFilterChange">
            <el-radio-button label="">全部评分</el-radio-button>
            <el-radio-button label="5">5星</el-radio-button>
            <el-radio-button label="4">4星</el-radio-button>
            <el-radio-button label="3">3星</el-radio-button>
            <el-radio-button label="2">2星</el-radio-button>
            <el-radio-button label="1">1星</el-radio-button>
          </el-radio-group>
          
          <el-checkbox-group v-model="filters.types" @change="handleFilterChange">
            <el-checkbox label="hasImage">有图片</el-checkbox>
            <el-checkbox label="hasReply">有回复</el-checkbox>
            <el-checkbox label="verified">实名认证</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-right">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索评论内容..."
            style="width: 300px;"
            @change="handleFilterChange"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select v-model="filters.sortBy" @change="handleFilterChange" style="width: 150px;">
            <el-option label="最新发布" value="time" />
            <el-option label="点赞最多" value="likes" />
            <el-option label="回复最多" value="replies" />
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 评论列表 -->
    <div class="comments-container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="comments.length === 0" class="empty-container">
        <el-empty description="暂无评论">
          <el-button type="primary" @click="showWriteComment">写第一条评论</el-button>
        </el-empty>
      </div>
      
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <!-- 评论头部 -->
          <div class="comment-header">
            <div class="user-info">
              <img :src="comment.userAvatar || '/default-avatar.jpg'" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">
                  {{ comment.username || '匿名用户' }}
                  <el-tag v-if="comment.isVerified" size="small" type="success">认证</el-tag>
                </div>
                <div class="comment-meta">
                  <span class="visit-time">{{ formatDate(comment.visitTime, 'YYYY年MM月') }}游玩</span>
                  <span class="publish-time">{{ formatDate(comment.createTime) }}发布</span>
                </div>
              </div>
            </div>
            
            <div class="comment-rating">
              <el-rate :model-value="comment.rating" disabled size="small" />
              <span class="rating-text">{{ comment.rating }}分</span>
            </div>
          </div>
          
          <!-- 评论内容 -->
          <div class="comment-content">
            <p class="comment-text">{{ comment.content }}</p>
            
            <!-- 评论图片 -->
            <div v-if="comment.images?.length" class="comment-images">
              <div class="images-grid">
                <img 
                  v-for="(image, index) in comment.images.slice(0, 9)" 
                  :key="index"
                  :src="image" 
                  class="comment-image"
                  @click="previewImage(comment.images, index)"
                />
                <div 
                  v-if="comment.images.length > 9" 
                  class="more-images"
                  @click="previewImage(comment.images, 9)"
                >
                  +{{ comment.images.length - 9 }}
                </div>
              </div>
            </div>
            
            <!-- 评论标签 -->
            <div v-if="comment.tags?.length" class="comment-tags">
              <el-tag 
                v-for="tag in comment.tags" 
                :key="tag"
                size="small"
                type="info"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
          
          <!-- 评论操作 -->
          <div class="comment-actions">
            <el-button 
              text 
              :type="comment.isLiked ? 'primary' : 'default'"
              @click="toggleLike(comment)"
            >
              <el-icon><Like /></el-icon>
              {{ comment.likeCount }}
            </el-button>
            
            <el-button text @click="showReplyDialog(comment)">
              <el-icon><ChatLineSquare /></el-icon>
              回复 {{ comment.replyCount }}
            </el-button>
            
            <el-button text @click="shareComment(comment)">
              <el-icon><Share /></el-icon>
              分享
            </el-button>
            
            <el-dropdown v-if="comment.userId === currentUserId">
              <el-button text>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editComment(comment)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="deleteComment(comment)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          
          <!-- 回复列表 -->
          <div v-if="comment.replies?.length" class="replies-section">
            <div v-for="reply in comment.replies.slice(0, 3)" :key="reply.id" class="reply-item">
              <div class="reply-header">
                <img :src="reply.userAvatar || '/default-avatar.jpg'" class="reply-avatar" />
                <span class="reply-user">{{ reply.username }}</span>
                <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
            
            <div v-if="comment.replyCount > 3" class="show-more-replies">
              <el-button text @click="loadMoreReplies(comment)">
                查看全部{{ comment.replyCount }}条回复
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="comments.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 写评论对话框 -->
    <el-dialog
      v-model="writeCommentVisible"
      title="写评论"
      width="600px"
      @close="resetCommentForm"
    >
      <el-form ref="commentFormRef" :model="commentForm" :rules="commentRules">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="commentForm.rating" show-text />
        </el-form-item>
        
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享你的游玩体验..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="上传图片">
          <el-upload
            v-model:file-list="commentForm.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="writeCommentVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitComment">
          发布评论
        </el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复评论"
      width="500px"
    >
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="写下你的回复..."
        maxlength="200"
        show-word-limit
      />
      
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replying" @click="submitReply">
          发布回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus'
import {
  ArrowLeft,
  EditPen,
  Search,
  Like,
  ChatLineSquare,
  Share,
  More,
  Plus
} from '@element-plus/icons-vue'

import { 
  getCommentsByScenicId, 
  getRatingStatistics,
  publishComment,
  replyComment,
  likeComment as apiLikeComment,
  deleteComment as apiDeleteComment
} from '@/api/comment'
import { getScenicDetail } from '@/api/scenic'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils'

export default {
  name: 'CommentsPage',
  components: {
    ArrowLeft,
    EditPen,
    Search,
    Like,
    ChatLineSquare,
    Share,
    More,
    Plus
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()
    
    const scenicId = ref(route.params.scenicId)
    const scenicName = ref('')
    const loading = ref(false)
    const submitting = ref(false)
    const replying = ref(false)
    
    const comments = ref([])
    const overallRating = ref(0)
    const totalComments = ref(0)
    const ratingBreakdown = ref([])
    const popularTags = ref([
      { name: '景色优美', count: 45 },
      { name: '值得一去', count: 32 },
      { name: '交通便利', count: 28 },
      { name: '服务周到', count: 22 },
      { name: '人多拥挤', count: 18 }
    ])
    
    const filters = reactive({
      rating: '',
      types: [],
      keyword: '',
      sortBy: 'time'
    })
    
    const pagination = reactive({
      current: 1,
      size: 10,
      total: 0
    })
    
    // 写评论相关
    const writeCommentVisible = ref(false)
    const commentFormRef = ref(null)
    const commentForm = reactive({
      rating: 5,
      content: '',
      images: []
    })
    
    const commentRules = {
      rating: [
        { required: true, message: '请选择评分', trigger: 'change' }
      ],
      content: [
        { required: true, message: '请输入评论内容', trigger: 'blur' },
        { min: 10, message: '评论内容至少10个字符', trigger: 'blur' }
      ]
    }
    
    // 回复相关
    const replyDialogVisible = ref(false)
    const replyContent = ref('')
    const currentReplyComment = ref(null)
    
    const currentUserId = computed(() => userStore.userId)
    
    // 加载景区基本信息
    const loadScenicInfo = async () => {
      try {
        const response = await getScenicDetail(scenicId.value)
        const scenic = response.data || {}
        scenicName.value = scenic.name || '景区'
        overallRating.value = scenic.rating || 0
      } catch (error) {
        console.error('加载景区信息失败:', error)
      }
    }
    
    // 加载评分统计
    const loadRatingStats = async () => {
      try {
        const response = await getRatingStatistics(scenicId.value)
        const stats = response.data || []
        
        totalComments.value = stats.reduce((sum, item) => sum + item.count, 0)
        ratingBreakdown.value = stats.map(item => ({
          rating: item.rating,
          count: item.count,
          percentage: totalComments.value > 0 ? (item.count / totalComments.value) * 100 : 0
        })).reverse()
        
      } catch (error) {
        console.error('加载评分统计失败:', error)
      }
    }
    
    // 加载评论列表
    const loadComments = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.current,
          size: pagination.size,
          rating: filters.rating,
          keyword: filters.keyword,
          sortBy: filters.sortBy
        }
        
        const response = await getCommentsByScenicId(scenicId.value, params)
        const result = response.data || {}
        
        comments.value = (result.records || []).map(comment => ({
          ...comment,
          images: comment.images ? JSON.parse(comment.images) : [],
          tags: comment.tags ? JSON.parse(comment.tags) : [],
          isLiked: false // 需要根据用户状态判断
        }))
        
        pagination.total = result.total || 0
        
      } catch (error) {
        console.error('加载评论失败:', error)
        ElMessage.error('加载评论失败')
      } finally {
        loading.value = false
      }
    }
    
    // 筛选处理
    const handleFilterChange = () => {
      pagination.current = 1
      loadComments()
    }
    
    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1
      loadComments()
    }
    
    const handleCurrentChange = (page) => {
      pagination.current = page
      loadComments()
    }
    
    // 按标签筛选
    const filterByTag = (tagName) => {
      filters.keyword = tagName
      handleFilterChange()
    }
    
    // 点赞切换
    const toggleLike = async (comment) => {
      try {
        await apiLikeComment(comment.id)
        
        if (comment.isLiked) {
          comment.likeCount--
          comment.isLiked = false
        } else {
          comment.likeCount++
          comment.isLiked = true
        }
        
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }
    
    // 显示写评论对话框
    const showWriteComment = () => {
      if (!userStore.isAuthenticated) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      writeCommentVisible.value = true
    }
    
    // 重置评论表单
    const resetCommentForm = () => {
      commentForm.rating = 5
      commentForm.content = ''
      commentForm.images = []
    }
    
    // 提交评论
    const submitComment = async () => {
      if (!commentFormRef.value) return
      
      await commentFormRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            const data = {
              scenicId: scenicId.value,
              content: commentForm.content,
              rating: commentForm.rating,
              images: JSON.stringify(commentForm.images.map(item => item.url || item.response?.url))
            }
            
            await publishComment(data)
            ElMessage.success('评论发布成功')
            writeCommentVisible.value = false
            resetCommentForm()
            loadComments()
            loadRatingStats()
            
          } catch (error) {
            ElMessage.error('评论发布失败')
          } finally {
            submitting.value = false
          }
        }
      })
    }
    
    // 显示回复对话框
    const showReplyDialog = (comment) => {
      if (!userStore.isAuthenticated) {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      }
      
      currentReplyComment.value = comment
      replyDialogVisible.value = true
    }
    
    // 提交回复
    const submitReply = async () => {
      if (!replyContent.value.trim()) {
        ElMessage.warning('请输入回复内容')
        return
      }
      
      replying.value = true
      try {
        const data = {
          commentId: currentReplyComment.value.id,
          content: replyContent.value
        }
        
        await replyComment(data)
        ElMessage.success('回复成功')
        replyDialogVisible.value = false
        replyContent.value = ''
        loadComments()
        
      } catch (error) {
        ElMessage.error('回复失败')
      } finally {
        replying.value = false
      }
    }
    
    // 预览图片
    const previewImage = (images, index) => {
      ElImageViewer({
        urlList: images,
        initialIndex: index
      })
    }
    
    // 分享评论
    const shareComment = (comment) => {
      ElMessage.info('分享功能开发中')
    }
    
    // 编辑评论
    const editComment = (comment) => {
      ElMessage.info('编辑功能开发中')
    }
    
    // 删除评论
    const deleteComment = async (comment) => {
      try {
        await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        await apiDeleteComment(comment.id)
        ElMessage.success('删除成功')
        loadComments()
        
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }
    
    // 加载更多回复
    const loadMoreReplies = (comment) => {
      ElMessage.info('加载更多回复功能开发中')
    }
    
    // 返回
    const goBack = () => {
      router.push(`/scenic/${scenicId.value}`)
    }
    
    // 生命周期
    onMounted(() => {
      loadScenicInfo()
      loadRatingStats()
      loadComments()
    })
    
    return {
      scenicId,
      scenicName,
      loading,
      submitting,
      replying,
      comments,
      overallRating,
      totalComments,
      ratingBreakdown,
      popularTags,
      filters,
      pagination,
      writeCommentVisible,
      commentFormRef,
      commentForm,
      commentRules,
      replyDialogVisible,
      replyContent,
      currentUserId,
      handleFilterChange,
      handleSizeChange,
      handleCurrentChange,
      filterByTag,
      toggleLike,
      showWriteComment,
      resetCommentForm,
      submitComment,
      showReplyDialog,
      submitReply,
      previewImage,
      shareComment,
      editComment,
      deleteComment,
      loadMoreReplies,
      goBack,
      formatDate
    }
  }
}
</script>

<style lang="scss" scoped>
.comments-page {
  min-height: 100vh;
  background: #f5f7fa;
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
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.rating-overview {
  margin-bottom: 20px;
  
  .overview-content {
    display: grid;
    grid-template-columns: 200px 1fr 300px;
    gap: 40px;
    align-items: start;
    
    .overall-rating {
      text-align: center;
      
      .rating-number {
        font-size: 48px;
        font-weight: bold;
        color: #2196F3;
        line-height: 1;
      }
      
      .rating-text {
        font-size: 16px;
        color: #333;
        margin: 10px 0 5px;
      }
      
      .rating-count {
        font-size: 14px;
        color: #666;
      }
    }
    
    .rating-breakdown {
      .rating-row {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 12px;
        
        .rating-label {
          width: 40px;
          color: #666;
          font-size: 14px;
        }
        
        .rating-bar {
          flex: 1;
        }
        
        .rating-count {
          width: 40px;
          text-align: right;
          color: #666;
          font-size: 14px;
        }
      }
    }
    
    .rating-tags {
      h4 {
        margin: 0 0 15px 0;
        color: #333;
      }
      
      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .el-tag {
          cursor: pointer;
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

.filter-card {
  margin-bottom: 20px;
  
  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    
    .filter-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    
    .filter-right {
      display: flex;
      gap: 15px;
      align-items: center;
    }
  }
}

.comments-container {
  .loading-container,
  .empty-container {
    background: white;
    padding: 40px;
    border-radius: 8px;
    text-align: center;
  }
  
  .comments-list {
    .comment-item {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        
        .user-info {
          display: flex;
          gap: 12px;
          
          .user-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
          }
          
          .user-details {
            .user-name {
              font-size: 16px;
              font-weight: 500;
              color: #333;
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .comment-meta {
              font-size: 13px;
              color: #999;
              
              span {
                margin-right: 15px;
              }
            }
          }
        }
        
        .comment-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .rating-text {
            font-size: 14px;
            color: #666;
            font-weight: 500;
          }
        }
      }
      
      .comment-content {
        .comment-text {
          font-size: 15px;
          line-height: 1.8;
          color: #333;
          margin-bottom: 15px;
        }
        
        .comment-images {
          margin-bottom: 15px;
          
          .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 8px;
            max-width: 400px;
            
            .comment-image {
              width: 100px;
              height: 100px;
              object-fit: cover;
              border-radius: 6px;
              cursor: pointer;
              transition: transform 0.3s ease;
              
              &:hover {
                transform: scale(1.05);
              }
            }
            
            .more-images {
              width: 100px;
              height: 100px;
              background: rgba(0, 0, 0, 0.6);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            }
          }
        }
        
        .comment-tags {
          .el-tag {
            margin-right: 8px;
            margin-bottom: 4px;
          }
        }
      }
      
      .comment-actions {
        display: flex;
        gap: 24px;
        padding-top: 16px;
        border-top: 1px solid #f0f0f0;
      }
      
      .replies-section {
        margin-top: 16px;
        padding-left: 20px;
        border-left: 2px solid #f0f0f0;
        
        .reply-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          
          .reply-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            
            .reply-avatar {
              width: 24px;
              height: 24px;
              border-radius: 50%;
            }
            
            .reply-user {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
            
            .reply-time {
              font-size: 12px;
              color: #999;
            }
          }
          
          .reply-content {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
          }
        }
        
        .show-more-replies {
          text-align: center;
          margin-top: 12px;
        }
      }
    }
  }
  
  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    padding: 20px;
    background: white;
    border-radius: 8px;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .rating-overview .overview-content {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
  
  .filter-card .filter-controls {
    flex-direction: column;
    align-items: stretch;
    
    .filter-left,
    .filter-right {
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .comments-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .comment-item {
    .comment-header {
      flex-direction: column;
      gap: 15px;
    }
    
    .comment-actions {
      flex-wrap: wrap;
      gap: 16px;
    }
  }
  
  .filter-controls {
    .filter-left {
      flex-direction: column;
      align-items: stretch;
    }
    
    .filter-right {
      flex-direction: column;
      
      .el-input,
      .el-select {
        width: 100% !important;
      }
    }
  }
}
</style>
