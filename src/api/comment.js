import request from './request'

// 发布评论
export function publishComment(data) {
  return request({
    url: '/comment/publish',
    method: 'post',
    data
  })
}

// 回复评论
export function replyComment(data) {
  return request({
    url: '/comment/reply',
    method: 'post',
    data
  })
}

// 根据景区ID分页查询评论
export function getCommentsByScenicId(scenicId, params) {
  return request({
    url: `/comment/scenic/${scenicId}`,
    method: 'get',
    params
  })
}

// 根据评论ID查询回复
export function getRepliesByCommentId(commentId) {
  return request({
    url: `/comment/${commentId}/replies`,
    method: 'get'
  })
}

// 点赞评论
export function likeComment(commentId) {
  return request({
    url: `/comment/${commentId}/like`,
    method: 'post'
  })
}

// 点赞回复
export function likeReply(replyId) {
  return request({
    url: `/comment/reply/${replyId}/like`,
    method: 'post'
  })
}

// 删除评论
export function deleteComment(commentId) {
  return request({
    url: `/comment/${commentId}`,
    method: 'delete'
  })
}

// 删除回复
export function deleteReply(replyId) {
  return request({
    url: `/comment/reply/${replyId}`,
    method: 'delete'
  })
}

// 获取景区评分统计
export function getRatingStatistics(scenicId) {
  return request({
    url: `/comment/scenic/${scenicId}/rating-statistics`,
    method: 'get'
  })
}

// 获取热门评论
export function getHotComments(scenicId, limit = 10) {
  return request({
    url: `/comment/scenic/${scenicId}/hot`,
    method: 'get',
    params: { limit }
  })
}

// 获取用户评论历史
export function getCommentsByUserId() {
  return request({
    url: '/comment/user/history',
    method: 'get'
  })
}
