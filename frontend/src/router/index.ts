import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/user/auth';

/**
 * 路由配置
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/user/:mid',
      name: 'user',
      component: () => import('../views/User.vue')
    },
    {
      path: '/favorite/:id',
      name: 'favorite',
      component: () => import('../views/Favorite.vue')
    },
    {
      path: '/season/:id',
      name: 'season',
      component: () => import('../views/Season.vue')
    },
    {
      path: '/series/:id',
      name: 'series',
      component: () => import('../views/Series.vue')
    },
    {
      path: '/search/:keyword',
      name: 'search',
      component: () => import('../views/Search.vue')
    },
  ]
});

/**
 * 全局前置守卫
 * - 已登录时访问登录页，自动跳转到首页
 */
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.isLoggedIn && to.path === '/login') {
    next('/');
  } else {
    next();
  }
});

export default router;