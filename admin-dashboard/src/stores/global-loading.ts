import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalLoading = defineStore('global-loading', () => {
  const isGlobalLoading = ref(false)
  const setIsGlobalLoading = (v: boolean) => {
    isGlobalLoading.value = v
  }

  return { isGlobalLoading, setIsGlobalLoading }
})
