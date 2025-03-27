<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { NConfigProvider, NMessageProvider, lightTheme } from 'naive-ui'
import { RouterView } from 'vue-router'
</script>

<template>
  <NConfigProvider :theme="lightTheme">
    <NMessageProvider>
      <RouterView />
    </NMessageProvider>
    <VueQueryDevtools />
  </NConfigProvider>
</template>
