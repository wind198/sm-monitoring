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
          path: '',
          component: () => import('@/views/Dashboard.vue'),
          meta: {
            title: {
              text: 'Dashboard',
            },
          },
        },
        {
          name: 'locations',
          path: '/locations',
          component: () => import('@/views/managements/CheckLocations.vue'),
          meta: {
            title: {
              text: 'Check Locations',
            },
          },
        },
        {
          name: 'show-location',
          path: '/locations/:id',
          component: () => import('@/views/managements/CheckLocations/ShowLocation.vue'),
          meta: {
            title: {
              text: 'Show Location',
            },
          },
        },
        {
          name: 'edit-location',
          path: '/locations/:id/edit',
          component: () => import('@/views/managements/CheckLocations/EditCheckLocation.vue'),
          meta: {
            title: {
              text: 'Edit Location',
            },
          },
        },
        {
          name: 'create-location',
          path: '/locations/create',
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
          name: 'show-monitor',
          path: '/monitors/:id',
          component: () => import('@/views/managements/Monitors/ShowMonitor.vue'),
          meta: {
            title: {
              text: 'Monitor detail',
            },
          },
        },
        {
          name: 'edit-monitor',
          path: '/monitors/:id/edit',
          component: () => import('@/views/managements/Monitors/EditMonitor.vue'),
          meta: {
            title: {
              text: 'Edit monitor',
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
