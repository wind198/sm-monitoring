import { DRAWER_SIZES } from '@/lib/constants/sizes'
import { useGlobalPanels } from '@/stores/global-panels'
import { computed, toRefs } from 'vue'

export default function useMainLeftNavWidth() {
  const { isMainLeftPanelOpen } = toRefs(useGlobalPanels())
  const currentWidth = computed(() =>
    isMainLeftPanelOpen.value ? DRAWER_SIZES.EXPANDED_WIDTH : DRAWER_SIZES.COLLAPSED_WIDTH,
  )

  return { currentWidth }
}
