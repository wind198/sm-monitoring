import { DRAWER_SIZES } from '@/lib/constants/sizes'
import { computed, type Ref } from 'vue'

export default function useMainLeftNavWidth({ open }: { open: Ref<boolean> }) {
  const currentWidth = computed(() =>
    open.value ? DRAWER_SIZES.EXPANDED_WIDTH : DRAWER_SIZES.COLLAPSED_WIDTH,
  )

  return { currentWidth }
}
