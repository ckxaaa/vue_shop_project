<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class='el-icon-arrow-right'>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >数据报表</el-breadcrumb-item>
      <el-breadcrumb-item>数据详情</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <!-- 为ECharts准备一个具备大小（宽高）的Dom -->
    <div id='main' style='width: 750px;height:400px;'></div>
  </div>
</template>

<script>
// 导入echarts组件
import echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  // 此时页面上的元素已经被渲染完毕，初始化echarts
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))
    // 准备数据和配置项
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取折线图失败')
    // 合并数据
    const result = _.merge(res.data, this.options)
    // 展示数据
    myChart.setOption(result)
  }
}
</script>
