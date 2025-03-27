<script setup lang="ts">
import { NSelect, type SelectOption } from 'naive-ui'

const model = defineModel<string | number>()

const options: SelectOption[] = [
  {
    value: 'every_day',
    label: 'Every day',
  },
  {
    value: 'every_week',
    label: 'Every week',
  },
]
</script>
<template>
  <NSelect v-model:value="model" placeholder="" :options="options" />
</template>
<style scoped></style>
