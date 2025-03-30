<script setup lang="ts">
import AppBar from '@/layouts/HomeLayout/AppBar.vue'
import MainLeftNav from '@/layouts/HomeLayout/MainLeftNav.vue'
import useMainLeftNavWidth from '@/lib/hooks/useMainLeftNavWidth'
import { APP_BAR_HEIGHT } from '@/lib/constants/sizes.ts'
import useRouteMetaTitle from '@/lib/hooks/useRouteMetaTitle.ts'
import { NCard } from 'naive-ui'

const { currentWidth } = useMainLeftNavWidth()

const { routeTitle } = useRouteMetaTitle()
</script>
<template>
  <div class="main-layout">
    <MainLeftNav />
    <AppBar></AppBar>
    <div :style="{ marginTop: APP_BAR_HEIGHT + 'px', marginLeft: currentWidth + 'px' }">
      <main class="p-4">
        <NCard>
          <template #header>
            <div class="flex items-center justify-between page-title">
              <span class="page-title__text">
                {{ routeTitle }}
              </span>
              <div id="page-title-actions"></div>
            </div>
          </template>
          <RouterView />
        </NCard>
      </main>
    </div>
  </div>
</template>
<style scoped></style>
