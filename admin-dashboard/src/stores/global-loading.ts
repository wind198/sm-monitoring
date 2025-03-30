import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalLoading = defineStore('global-loading', () => {
  const isGlobalLoading = ref(false)
  const setIsGlobalLoading = (v: boolean) => {
    isGlobalLoading.value = v
  }

  return { isGlobalLoading, setIsGlobalLoading }
})
