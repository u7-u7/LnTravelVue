/**
 * 高德地图工具类
 */

import AMapLoader from '@amap/amap-jsapi-loader'

// 高德地图配置
const AMAP_CONFIG = {
  key: '你的高德地图API密钥', // 需要替换为实际的API密钥
  version: '2.0',
  plugins: [
    'AMap.Scale',
    'AMap.ToolBar',
    'AMap.MouseTool',
    'AMap.HeatMap',
    'AMap.MarkerCluster',
    'AMap.Geocoder',
    'AMap.Geolocation'
  ]
}

let AMap = null

/**
 * 初始化地图
 */
export async function initAMap() {
  if (AMap) return AMap
  
  try {
    AMap = await AMapLoader.load(AMAP_CONFIG)
    return AMap
  } catch (error) {
    console.error('高德地图加载失败:', error)
    throw error
  }
}

/**
 * 创建地图实例
 */
export async function createMap(container, options = {}) {
  const AMap = await initAMap()
  
  const defaultOptions = {
    center: [116.397428, 39.90923], // 北京
    zoom: 10,
    mapStyle: 'amap://styles/blue',
    viewMode: '3D',
    pitch: 50,
    rotation: 0,
    animateEnable: true,
    jogEnable: false,
    scrollWheel: true,
    keyboardEnable: true,
    doubleClickZoom: true
  }
  
  const map = new AMap.Map(container, { ...defaultOptions, ...options })
  
  // 添加控件
  map.addControl(new AMap.Scale())
  map.addControl(new AMap.ToolBar())
  
  return map
}

/**
 * 创建热力图
 */
export async function createHeatMap(map, data) {
  const AMap = await initAMap()
  
  const heatMap = new AMap.HeatMap(map, {
    radius: 25,
    opacity: [0, 0.8],
    gradient: {
      0.4: 'blue',
      0.65: 'lime',
      0.85: 'yellow',
      1.0: 'red'
    }
  })
  
  heatMap.setDataSet({
    data: data,
    max: Math.max(...data.map(item => item.count))
  })
  
  return heatMap
}

/**
 * 创建标记点
 */
export async function createMarker(map, position, options = {}) {
  const AMap = await initAMap()
  
  const defaultOptions = {
    position: position,
    anchor: 'bottom-center'
  }
  
  const marker = new AMap.Marker({ ...defaultOptions, ...options })
  map.add(marker)
  
  return marker
}

/**
 * 创建信息窗口
 */
export async function createInfoWindow(content, options = {}) {
  const AMap = await initAMap()
  
  const defaultOptions = {
    content: content,
    anchor: 'bottom-center',
    offset: new AMap.Pixel(0, -30)
  }
  
  return new AMap.InfoWindow({ ...defaultOptions, ...options })
}

/**
 * 地理编码（地址转坐标）
 */
export async function geocode(address) {
  const AMap = await initAMap()
  
  return new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder()
    geocoder.getLocation(address, (status, result) => {
      if (status === 'complete' && result.geocodes.length) {
        resolve(result.geocodes[0].location)
      } else {
        reject(new Error('地理编码失败'))
      }
    })
  })
}

/**
 * 逆地理编码（坐标转地址）
 */
export async function regeocode(lnglat) {
  const AMap = await initAMap()
  
  return new Promise((resolve, reject) => {
    const geocoder = new AMap.Geocoder()
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.regeocode) {
        resolve(result.regeocode)
      } else {
        reject(new Error('逆地理编码失败'))
      }
    })
  })
}

/**
 * 获取当前位置
 */
export async function getCurrentPosition() {
  const AMap = await initAMap()
  
  return new Promise((resolve, reject) => {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
    
    geolocation.getCurrentPosition((status, result) => {
      if (status === 'complete') {
        resolve(result.position)
      } else {
        reject(new Error('定位失败: ' + result.message))
      }
    })
  })
}

/**
 * 计算两点间距离
 */
export async function calculateDistance(point1, point2) {
  const AMap = await initAMap()
  return AMap.GeometryUtil.distance(point1, point2)
}

/**
 * 创建标记聚合
 */
export async function createMarkerCluster(map, markers, options = {}) {
  const AMap = await initAMap()
  
  const defaultOptions = {
    gridSize: 80,
    maxZoom: 14,
    averageCenter: true,
    styles: [{
      url: '/marker-cluster.png',
      size: new AMap.Size(32, 32),
      offset: new AMap.Pixel(-16, -16)
    }]
  }
  
  const markerCluster = new AMap.MarkerCluster(map, markers, { ...defaultOptions, ...options })
  return markerCluster
}

/**
 * 创建中国地图
 */
export function createChinaMapData() {
  return [
    { name: '北京', value: [116.46, 39.92] },
    { name: '上海', value: [121.48, 31.22] },
    { name: '深圳', value: [114.07, 22.62] },
    { name: '广州', value: [113.23, 23.16] },
    { name: '杭州', value: [120.19, 30.26] },
    { name: '南京', value: [118.78, 32.04] },
    { name: '成都', value: [104.06, 30.67] },
    { name: '西安', value: [108.95, 34.27] },
    { name: '武汉', value: [114.31, 30.52] },
    { name: '天津', value: [117.2, 39.13] },
    { name: '重庆', value: [106.54, 29.59] },
    { name: '苏州', value: [120.62, 31.32] },
    { name: '长沙', value: [113, 28.21] },
    { name: '沈阳', value: [123.38, 41.8] },
    { name: '青岛', value: [120.33, 36.07] },
    { name: '宁波', value: [121.56, 29.86] },
    { name: '东莞', value: [113.75, 23.04] },
    { name: '大连', value: [121.62, 38.92] },
    { name: '厦门', value: [118.1, 24.46] },
    { name: '无锡', value: [120.29, 31.59] },
    { name: '福州', value: [119.3, 26.08] },
    { name: '济南', value: [117, 36.65] },
    { name: '昆明', value: [102.73, 25.04] },
    { name: '哈尔滨', value: [126.63, 45.75] },
    { name: '长春', value: [125.35, 43.88] },
    { name: '南昌', value: [115.89, 28.68] },
    { name: '合肥', value: [117.27, 31.86] },
    { name: '石家庄', value: [114.48, 38.03] },
    { name: '贵阳', value: [106.71, 26.57] },
    { name: '太原', value: [112.53, 37.87] },
    { name: '南宁', value: [108.33, 22.84] },
    { name: '兰州', value: [103.73, 36.03] },
    { name: '乌鲁木齐', value: [87.68, 43.77] },
    { name: '银川', value: [106.27, 38.47] },
    { name: '西宁', value: [101.74, 36.56] },
    { name: '海口', value: [110.35, 20.02] },
    { name: '呼和浩特', value: [111.65, 40.82] },
    { name: '拉萨', value: [91.11, 29.97] }
  ]
}
