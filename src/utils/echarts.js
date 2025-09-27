/**
 * ECharts工具类和配置
 */

import * as echarts from 'echarts'

// 蓝色科技风主题
export const techBlueTheme = {
  color: [
    '#2196F3', '#21CBF3', '#03DAC6', '#4CAF50', '#8BC34A',
    '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: 12,
    color: '#ffffff'
  },
  title: {
    textStyle: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold'
    },
    subtextStyle: {
      color: '#cccccc'
    }
  },
  legend: {
    textStyle: {
      color: '#ffffff'
    }
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisTick: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: '#ffffff'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  },
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisTick: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.3)'
      }
    },
    axisLabel: {
      color: '#ffffff'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.1)'
      }
    }
  }
}

/**
 * 注册主题
 */
export function registerTheme() {
  echarts.registerTheme('techBlue', techBlueTheme)
}

/**
 * 创建图表实例
 */
export function createChart(container, theme = 'techBlue') {
  registerTheme()
  return echarts.init(container, theme)
}

/**
 * 中国地图配置
 */
export function getChinaMapOption(data = []) {
  return {
    title: {
      text: '全国景区热度分布',
      left: 'center',
      top: 20,
      textStyle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>{c}个景区'
    },
    visualMap: {
      min: 0,
      max: 100,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [
      {
        name: '景区数量',
        type: 'map',
        map: 'china',
        roam: false,
        data: data,
        emphasis: {
          label: {
            show: true
          }
        }
      }
    ]
  }
}

/**
 * 热度排行榜配置
 */
export function getHotRankingOption(data = []) {
  return {
    title: {
      text: '景区热度排行榜',
      textStyle: {
        color: '#ffffff',
        fontSize: 16
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    series: [
      {
        name: '访问量',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          borderRadius: [0, 5, 5, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#2196F3' },
            { offset: 1, color: '#21CBF3' }
          ])
        }
      }
    ]
  }
}

/**
 * 评分分布饼图配置
 */
export function getRatingPieOption(data = []) {
  return {
    title: {
      text: '评分分布',
      left: 'center',
      textStyle: {
        color: '#ffffff',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: {
        color: '#ffffff'
      }
    },
    series: [
      {
        name: '评分',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

/**
 * 趋势图配置
 */
export function getTrendLineOption(data = [], dates = []) {
  return {
    title: {
      text: '访问趋势',
      textStyle: {
        color: '#ffffff',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['访问量'],
      textStyle: {
        color: '#ffffff'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#ffffff'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        stack: '总量',
        data: data,
        smooth: true,
        lineStyle: {
          color: '#2196F3'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0.1)' }
          ])
        }
      }
    ]
  }
}

/**
 * 仪表盘配置
 */
export function getGaugeOption(value = 0, max = 100) {
  return {
    series: [
      {
        name: '指标',
        type: 'gauge',
        detail: { formatter: '{value}%' },
        data: [{ value: value, name: '完成率' }],
        max: max,
        axisLine: {
          lineStyle: {
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        }
      }
    ]
  }
}

/**
 * 响应式处理
 */
export function handleResize(chart) {
  if (chart) {
    chart.resize()
  }
}

/**
 * 销毁图表
 */
export function disposeChart(chart) {
  if (chart && !chart.isDisposed()) {
    chart.dispose()
  }
}
