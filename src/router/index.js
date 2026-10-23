import { createRouter } from 'vue-router'
//引入路由器模式
import { createWebHistory } from 'vue-router'
import home from '@/components/TheWelcome.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/home',
      component: home,
    },
    {
      path: '/talk',
      component: () => import('@/views/chartRoom/index.vue'),
    },
    {
      path: '/map',
      component: () => import('@/views/mapCharts/index.vue'),
    },
    {
      path: '/book',
      component: () => import('@/views/amcharts/index.vue'),
    },
    {
      path: '/upload',
      component: () => import('@/views/upload/index.vue'),
    },
  ],
})

export default router
