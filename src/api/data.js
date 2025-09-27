import request from './request'

// 获取首页统计数据
export function getOverviewData() {
  return request({
    url: '/data/overview',
    method: 'get'
  })
}

// 获取全国热力图数据
export function getNationalHeatmapData() {
  return request({
    url: '/data/heatmap/national',
    method: 'get'
  })
}

// 获取省份热力图数据
export function getProvinceHeatmapData(province) {
  return request({
    url: `/data/heatmap/province/${province}`,
    method: 'get'
  })
}

// 获取景区热度排行榜
export function getHotRanking(limit = 10) {
  return request({
    url: '/data/ranking/hot',
    method: 'get',
    params: { limit }
  })
}

// 获取景区好评排行榜
export function getRatingRanking(limit = 10) {
  return request({
    url: '/data/ranking/rating',
    method: 'get',
    params: { limit }
  })
}

// 获取省份统计数据
export function getProvinceStatistics(province) {
  return request({
    url: `/data/province/${province}/statistics`,
    method: 'get'
  })
}

// 获取景区访问趋势
export function getScenicTrend(scenicId, days = 7) {
  return request({
    url: `/data/scenic/${scenicId}/trend`,
    method: 'get',
    params: { days }
  })
}

// 获取客流量分析
export function getVisitorFlowAnalysis(params) {
  return request({
    url: '/data/visitor-flow',
    method: 'get',
    params
  })
}

// 获取实时数据
export function getRealtimeData() {
  return request({
    url: '/data/realtime',
    method: 'get'
  })
}
