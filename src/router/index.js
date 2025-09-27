import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomePage.vue'),
    meta: {
      title: '首页 - 旅牛网',
      keepAlive: true
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestPage.vue'),
    meta: {
      title: '测试页面 - 旅牛网'
    }
  },
  {
    path: '/province/:provinceId',
    name: 'Province',
    component: () => import('@/views/ProvincePage.vue'),
    meta: {
      title: '省份详情 - 旅牛网'
    }
  },
  {
    path: '/scenic/:scenicId',
    name: 'ScenicDetail',
    component: () => import('@/views/ScenicDetailPage.vue'),
    meta: {
      title: '景区详情 - 旅牛网'
    }
  },
  {
    path: '/comments/:scenicId',
    name: 'Comments',
    component: () => import('@/views/CommentsPage.vue'),
    meta: {
      title: '景区评论 - 旅牛网'
    }
  },
  {
    path: '/recommend',
    name: 'Recommend',
    component: () => import('@/views/RecommendPage.vue'),
    meta: {
      title: '景区推荐 - 旅牛网'
    }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenterPage.vue'),
    meta: {
      title: '个人中心 - 旅牛网',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      title: '登录 - 旅牛网'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: {
      title: '注册 - 旅牛网'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: {
      title: '页面未找到 - 旅牛网'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  
  next()
})

export default router
