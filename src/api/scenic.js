import request from './request'

// 获取景区列表
export function getScenicList(params) {
  return request({
    url: '/scenic/list',
    method: 'get',
    params
  })
}

// 获取景区详情
export function getScenicDetail(id) {
  return request({
    url: `/scenic/${id}`,
    method: 'get'
  })
}

// 搜索景区
export function searchScenic(params) {
  return request({
    url: '/scenic/search',
    method: 'get',
    params
  })
}

// 获取景区分类
export function getScenicCategories() {
  return request({
    url: '/scenic/categories',
    method: 'get'
  })
}

// 获取景区热力图数据
export function getScenicHeatmap() {
  return request({
    url: '/scenic/heatmap',
    method: 'get'
  })
}

// 获取景区排行榜
export function getScenicRanking(type) {
  return request({
    url: `/scenic/ranking/${type}`,
    method: 'get'
  })
}

// 获取省份景区数据
export function getProvinceScenic(provinceId) {
  return request({
    url: `/scenic/province/${provinceId}`,
    method: 'get'
  })
}
