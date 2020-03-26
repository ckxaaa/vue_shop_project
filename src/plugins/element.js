import Vue from 'vue'
import {
  Message
} from 'element-ui'

import Timeline from './timeline/index.js'
import TimelineItem from './timeline-item/index'

Vue.use(Timeline)
Vue.use(TimelineItem)

Vue.prototype.$message = Message
