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
      path: '/playlist/:type/:id',
      name: 'playlist',
      component: () => import('../views/Songlist.vue')
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
