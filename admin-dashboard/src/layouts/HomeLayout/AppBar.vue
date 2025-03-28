<script setup lang="ts">
import { APP_BAR_HEIGHT } from '@/lib/constants/sizes.ts'
import { useGlobalLoading } from '@/stores/global-loading.ts'
import { ArrowForwardFilled } from '@vicons/material'
import { max, min } from 'lodash-es'
import { NProgress } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'

const { isGlobalLoading } = storeToRefs(useGlobalLoading())

const fakeLoadingPercentage = ref(0)

const fakeLoadingTimer = ref<number | null>(null)

watchEffect((onCleanup) => {
  if (isGlobalLoading.value) {
    fakeLoadingPercentage.value = 30
    fakeLoadingTimer.value = setInterval(() => {
      fakeLoadingPercentage.value = min([80, fakeLoadingPercentage.value + 1])!
    }, 50)
  } else {
    setTimeout(() => {
      fakeLoadingPercentage.value = 0
    }, 1000)
  }
  onCleanup(() => {
    if (fakeLoadingTimer.value) {
      clearInterval(fakeLoadingTimer.value)
      fakeLoadingTimer.value = null
    }
  })
})
</script>
<template>
  <div
    class="app-bar shadow-md bg-white fixed top-0 left-0 w-full z-50"
    :style="{ height: APP_BAR_HEIGHT + 'px' }"
  >
    <NProgress
      :height="5"
      type="line"
      :show-indicator="false"
      :percentage="fakeLoadingPercentage"
      :color="{ stops: ['white', 'green'] }"
      class="global-loading-indicator absolute bottom-0 left-0 w-full transition-opacity !duration-300"
      :class="{
        'opacity-0': !isGlobalLoading,
      }"
    />
  </div>
</template>
<style scoped></style>
