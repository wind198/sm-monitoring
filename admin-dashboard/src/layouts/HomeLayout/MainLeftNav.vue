<script setup lang="ts">
import {
  DashboardOutlined,
  LinkOutlined,
  LocationOnOutlined,
  MonitorOutlined,
} from '@vicons/material'
import useMainLeftNavWidth from '@/lib/hooks/useMainLeftNavWidth'
import { NDrawer, NDrawerContent, NList, useThemeVars } from 'naive-ui'
import type { INavItem } from '@/layouts/HomeLayout/MainLeftNav/nav-item.type'
import NavItem from '@/layouts/HomeLayout/MainLeftNav/NavItem.vue'
import { useGlobalPanels } from '../../stores/global-panels.js'
import { toRefs } from 'vue'

const navList: INavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    to: '/',
    icon: DashboardOutlined,
  },
  {
    key: 'managements',
    label: 'Managements',
    children: [
      {
        key: 'locations',
        label: 'Check locations',
        to: '/locations',
        icon: LocationOnOutlined,
      },
      {
        key: 'monitors',
        label: 'Monitors',
        to: '/monitors',
        icon: LinkOutlined,
      },
      {
        key: 'check-agents',
        label: 'Check agents',
        to: '/check-agents',
        icon: MonitorOutlined,
      },
    ],
  },
]

const { currentWidth } = useMainLeftNavWidth()

const { isMainLeftPanelOpen } = toRefs(useGlobalPanels())
const { setMainLeftPanelOpen } = useGlobalPanels()

const theme = useThemeVars()
</script>
<template>
  <NDrawer
    :show="isMainLeftPanelOpen"
    @update:show="setMainLeftPanelOpen"
    class="main-left-nav"
    placement="left"
    :close-on-esc="false"
    :mask-closable="false"
    :show-mask="false"
    :width="currentWidth"
    :block-scroll="false"
  >
    <NDrawerContent>
      <template #header>
        <div class="main-left-nav__header-section flex items-center space-x-2">
          <div
            tag="span"
            :style="{ backgroundColor: theme.primaryColor }"
            class="aspect-square w-6 rounded"
          ></div>
          <div class="header-section__text font-bold">SM Monitor</div>
        </div>
      </template>
      <NList class="!ml-[-8px]">
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <NavItem v-for="i in navList" v-bind="i"></NavItem>
      </NList>
    </NDrawerContent>
  </NDrawer>
</template>
<style scoped></style>
