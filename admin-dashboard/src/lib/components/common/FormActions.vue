<script setup lang="ts">
import { IS_DEV } from '@/lib/constants/env'
import { NButton } from 'naive-ui'
import { useRouter } from 'vue-router'

const props = defineProps<{ isEdit?: boolean }>()

const emit = defineEmits(['reset', 'mock'])

const router = useRouter()

const handleClickCancel = () => {
  if (props.isEdit) {
    emit('reset')
  } else {
    router.back()
  }
}
</script>
<template>
  <div class="flex space-x-3">
    <div class="mock-btn-container" v-if="IS_DEV && !props.isEdit" @click="emit('mock')">
      <NButton>Mock</NButton>
    </div>
    <div class="submit-btn-container">
      <NButton type="primary" attr-type="submit">Create</NButton>
    </div>
    <div class="cancel-btn-container" @click="handleClickCancel">
      <NButton>Cancel</NButton>
    </div>
  </div>
</template>
<style scoped></style>
