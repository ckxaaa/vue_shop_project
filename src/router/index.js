import Vue from 'vue'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import Login from './../components/login.vue'
import Home from './../components/home.vue'
import Welcome from './../components/welcome.vue'
import Users from './../components/user/users.vue'
import Rights from './../components/power/rights.vue'
import Rolus from './../components/power/rolus.vue'
import Cate from './../components/goods/cate.vue'
import Params from './../components/goods/params.vue'
import goodsList from './../components/goods/list.vue'
import goodsAdd from './../components/goods/add.vue'
import Order from './../components/order/orders.vue'

Vue.use(VueRouter)
Vue.use(ElementUI)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Rolus },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: goodsList },
      { path: '/goods/add', component: goodsAdd },
      { path: '/orders', component: Order }
    ]
  }
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
