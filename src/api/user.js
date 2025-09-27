import request from './request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/info',
    method: 'put',
    data
  })
}

// 检查用户名是否存在
export function checkUsername(username) {
  return request({
    url: '/user/check-username',
    method: 'get',
    params: { username }
  })
}

// 检查邮箱是否存在
export function checkEmail(email) {
  return request({
    url: '/user/check-email',
    method: 'get',
    params: { email }
  })
}

// 检查手机号是否存在
export function checkPhone(phone) {
  return request({
    url: '/user/check-phone',
    method: 'get',
    params: { phone }
  })
}

// 获取用户足迹
export function getUserFootprints() {
  return request({
    url: '/user/footprints',
    method: 'get'
  })
}

// 添加用户足迹
export function addUserFootprint(data) {
  return request({
    url: '/user/footprints',
    method: 'post',
    data
  })
}

// 获取用户收藏
export function getUserFavorites() {
  return request({
    url: '/user/favorites',
    method: 'get'
  })
}

// 添加收藏
export function addFavorite(scenicId) {
  return request({
    url: '/user/favorites',
    method: 'post',
    data: { scenicId }
  })
}

// 取消收藏
export function removeFavorite(scenicId) {
  return request({
    url: `/user/favorites/${scenicId}`,
    method: 'delete'
  })
}

// 获取用户订单
export function getUserOrders(params) {
  return request({
    url: '/user/orders',
    method: 'get',
    params
  })
}
