import Vue from 'vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import Login from './../components/login.vue'
import Home from './../components/home.vue'

Vue.use(VueRouter)
Vue.use(ElementUI)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})
// 路由访问守卫控制访问功能
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from 代表从那个路径跳转而来
  // next 是一个函数，表示放行
  // next（） 直接放行 next（'/login'） 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
