import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css'
// 导入全局样式表
import './assets/css/global.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return config
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function (orginVal) {
  var mt = new Date(orginVal)
  // 获取年份
  var y = mt.getFullYear()
  // 获取月份 从0开始
  var m = (mt.getMonth() + 1).toString().padStart(2, '0')
  // 获取天数
  var d = mt.getDate()
  // 获取小时
  var h = mt.getHours().toString().padStart(2, '0')
  // 获取分钟
  var mi = mt.getMinutes().toString().padStart(2, '0')
  // 获取秒
  var s = mt.getSeconds().toString().padStart(2, '0')
  // 拼接为我们需要的各式
  return y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
