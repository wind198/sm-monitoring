<script setup lang="ts">
import { LinkOutlined, LocationOnOutlined, MonitorOutlined } from '@vicons/material'
import useMainLeftNavWidth from '@/layouts/HomeLayout/MainLeftNav/useMainLeftNavWidth'
import { NDrawer, NDrawerContent, NList, useThemeVars } from 'naive-ui'
import type { INavItem } from '@/layouts/HomeLayout/MainLeftNav/nav-item.type'
import NavItem from '@/layouts/HomeLayout/MainLeftNav/NavItem.vue'

const navList: INavItem[] = [
  {
    key: 'managements',
    label: 'Managements',
    children: [
      {
        key: 'check-locations',
        label: 'Check locations',
        to: '/check-locations',
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

const open = defineModel<boolean>({ default: true })

const { currentWidth } = useMainLeftNavWidth({ open })

const theme = useThemeVars()
</script>
<template>
  <NDrawer
    v-model:show="open"
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
          <n-el
            tag="span"
            :style="{ backgroundColor: theme.primaryColor }"
            class="aspect-square w-6 rounded"
          >
          </n-el>
          <div class="header-section__text font-bold">SM Monitor</div>
        </div>
      </template>
      <NList class="!ml-[-8px]">
        <NavItem v-for="i in navList" v-bind="i"></NavItem>
      </NList>
    </NDrawerContent>
  </NDrawer>
</template>
<style scoped></style>
