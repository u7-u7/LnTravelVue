<template>
  <div class="test-page">
    <h1>旅牛网前端项目测试页面</h1>
    <p>Vue 3 + Element Plus + ECharts 配置测试</p>
    
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Element Plus 组件测试</span>
        </div>
      </template>
      
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </el-card>
    
    <div class="chart-container" style="margin-top: 20px;">
      <div ref="chartRef" style="width: 100%; height: 300px;"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { createChart } from '@/utils/echarts'

export default {
  name: 'TestPage',
  setup() {
    const chartRef = ref(null)
    
    onMounted(() => {
      // 简单的测试图表
      const chart = createChart(chartRef.value)
      const option = {
        title: {
          text: 'ECharts 测试图表'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [{
          name: '销量',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20]
        }]
      }
      chart.setOption(option)
    })
    
    return {
      chartRef
    }
  }
}
</script>

<style lang="scss" scoped>
.test-page {
  padding: 20px;
  
  h1 {
    color: $primary-color;
    text-align: center;
  }
  
  p {
    text-align: center;
    color: $text-light;
    margin-bottom: 30px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
