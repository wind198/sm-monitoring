import HomeLayout from '@/layouts/HomeLayout.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeLayout,
      children: [
        {
          name: 'check-locations',
          path: '/check-locations',
          component: () => import('@/views/managements/CheckLocations.vue'),
          meta: {
            title: {
              text: 'Check Locations',
            },
          },
        },
        {
          name: 'create-check-location',
          path: '/check-locations/create',
          component: () => import('@/views/managements/CheckLocations/CreateCheckLocation.vue'),
          meta: {
            title: {
              text: 'Create Check Location',
            },
          },
        },
        {
          name: 'monitors',
          path: '/monitors',
          component: () => import('@/views/managements/Monitors.vue'),
          meta: {
            title: {
              text: 'Monitors',
            },
          },
        },
        {
          name: 'create-monitor',
          path: '/monitors/create',
          component: () => import('@/views/managements/Monitors/CreateMonitor.vue'),
          meta: {
            title: {
              text: 'Monitors',
            },
          },
        },
      ],
    },
  ],
})

export default router
