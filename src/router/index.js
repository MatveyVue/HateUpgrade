import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/upgrade',
      name: 'upgrade',
      component: () => import('../views/UpgradeView.vue'),
    },
    {
      path: '/market',
      redirect: '/upgrade',
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/token',
      name: 'token',
      component: () => import('../views/TokenView.vue'),
    },
    {
      path: '/staking',
      name: 'staking',
      component: () => import('../views/StakingView.vue'),
    },
  ],
})

export default router
