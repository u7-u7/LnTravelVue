/**
 * 工具函数
 */

// 防抖函数
export function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// 节流函数
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const cloneObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloneObj[key] = deepClone(obj[key])
      }
    }
    return cloneObj
  }
}

// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 格式化数字
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined) return '0'
  return Number(num).toFixed(decimals)
}

// 格式化文件大小
export function formatFileSize(size) {
  if (size === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(size) / Math.log(k))
  return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成唯一ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 判断是否为移动端
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 获取URL参数
export function getUrlParams(url = window.location.href) {
  const params = {}
  const urlSearchParams = new URLSearchParams(url.split('?')[1])
  for (const [key, value] of urlSearchParams) {
    params[key] = value
  }
  return params
}

// 数组去重
export function uniqueArray(arr, key) {
  if (key) {
    const seen = new Set()
    return arr.filter(item => {
      const val = item[key]
      if (seen.has(val)) {
        return false
      }
      seen.add(val)
      return true
    })
  }
  return [...new Set(arr)]
}

// 计算两点间距离（单位：千米）
export function getDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = lat1 * Math.PI / 180.0
  const radLat2 = lat2 * Math.PI / 180.0
  const a = radLat1 - radLat2
  const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137
  s = Math.round(s * 10000) / 10000
  return s
}

// 存储操作
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('localStorage set error:', error)
    }
  },
  
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (error) {
      console.error('localStorage get error:', error)
      return defaultValue
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('localStorage remove error:', error)
    }
  },
  
  clear() {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('localStorage clear error:', error)
    }
  }
}

// 颜色工具
export const colorUtils = {
  // 十六进制转RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // RGB转十六进制
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }
}
