import request from './request'

// 根据景区ID获取门票列表
export function getTicketsByScenicId(scenicId) {
  return request({
    url: `/ticket/scenic/${scenicId}`,
    method: 'get'
  })
}

// 获取门票详情
export function getTicketDetail(ticketId) {
  return request({
    url: `/ticket/${ticketId}`,
    method: 'get'
  })
}

// 获取秒杀活动列表
export function getSeckillActivities(params) {
  return request({
    url: '/ticket/seckill/list',
    method: 'get',
    params
  })
}

// 获取正在进行的秒杀活动
export function getActiveActivities() {
  return request({
    url: '/ticket/seckill/active',
    method: 'get'
  })
}

// 根据门票ID获取秒杀活动
export function getSeckillByTicketId(ticketId) {
  return request({
    url: `/ticket/${ticketId}/seckill`,
    method: 'get'
  })
}

// 参与秒杀
export function participateSeckill(activityId, data) {
  return request({
    url: `/ticket/seckill/${activityId}/participate`,
    method: 'post',
    data
  })
}

// 检查秒杀库存
export function checkSeckillStock(activityId, quantity = 1) {
  return request({
    url: `/ticket/seckill/${activityId}/stock`,
    method: 'get',
    params: { quantity }
  })
}
