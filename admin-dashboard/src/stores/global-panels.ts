import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalPanels = defineStore('global-panels', () => {
  const isMainLeftPanelOpen = ref(true)
  const setMainLeftPanelOpen = (v: boolean) => {
    isMainLeftPanelOpen.value = v
  }

  return {isMainLeftPanelOpen, setMainLeftPanelOpen}
})
