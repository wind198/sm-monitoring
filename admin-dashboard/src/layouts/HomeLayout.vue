<script setup lang="ts">
import AppBar from '@/layouts/HomeLayout/AppBar.vue'
import MainLeftNav from '@/layouts/HomeLayout/MainLeftNav.vue'
import useMainLeftNavWidth from '@/layouts/HomeLayout/MainLeftNav/useMainLeftNavWidth'
import { APP_BAR_HEIGHT } from '@/lib/constants/sizes.ts'
import useRouteMetaTitle from '@/lib/hooks/useRouteMetaTitle.ts'
import { NCard } from 'naive-ui'
import { ref } from 'vue'

const open = ref(true)
const { currentWidth } = useMainLeftNavWidth({ open })

const { routeTitle } = useRouteMetaTitle()
</script>
<template>
  <div class="main-layout">
    <MainLeftNav v-model:open="open" />
    <AppBar></AppBar>
    <div :style="{ marginTop: APP_BAR_HEIGHT + 'px', marginLeft: currentWidth + 'px' }">
      <main class="p-4">
        <NCard>
          <template #header>{{ routeTitle }} </template>
          <RouterView />
        </NCard>
      </main>
    </div>
  </div>
</template>
<style scoped></style>
