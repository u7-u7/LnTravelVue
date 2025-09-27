import request from './request'

// 获取个性化推荐
export function getPersonalRecommend() {
  return request({
    url: '/recommend/personal',
    method: 'get'
  })
}

// 获取热门推荐
export function getHotRecommend(limit = 10) {
  return request({
    url: '/recommend/hot',
    method: 'get',
    params: { limit }
  })
}

// 根据条件筛选推荐
export function getFilteredRecommend(data) {
  return request({
    url: '/recommend/filter',
    method: 'post',
    data
  })
}

// AI聊天推荐
export function aiChatRecommend(data) {
  return request({
    url: '/recommend/ai-chat',
    method: 'post',
    data
  })
}

// 获取AI对话历史
export function getChatHistory(sessionId) {
  return request({
    url: '/recommend/ai-chat/history',
    method: 'get',
    params: { sessionId }
  })
}

// 记录推荐点击
export function recordClick(recommendId) {
  return request({
    url: `/recommend/click/${recommendId}`,
    method: 'post'
  })
}

// 获取用户推荐历史
export function getRecommendHistory() {
  return request({
    url: '/recommend/history',
    method: 'get'
  })
}
