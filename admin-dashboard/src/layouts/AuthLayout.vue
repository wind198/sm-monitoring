<script setup lang="ts">
import { useThemeVars } from 'naive-ui'
import { RouterView } from 'vue-router'

const theme = useThemeVars()
</script>
<template>
  <div class="auth-layout flex w-full h-full items-stretch">
    <div class="left-box flex-1 bg-white"></div>
    <div
      class="right-box flex-1 flex flex-col justify-center items-start"
      :style="{ backgroundColor: theme.primaryColor }"
    >
      <RouterView></RouterView>
    </div>
  </div>
</template>
<style scoped></style>
