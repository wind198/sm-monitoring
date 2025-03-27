<script setup lang="ts">
import MainLeftNav from '@/lib/components/MainLeftNav.vue'
import useMainLeftNavWidth from '@/lib/components/MainLeftNav/useMainLeftNavWidth.ts'
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
    <div
      class="app-bar shadow-md bg-white fixed top-0 left-0 w-full z-50"
      :style="{ height: APP_BAR_HEIGHT + 'px' }"
    ></div>
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
