import { useGlobalLoading } from '@/stores/global-loading'
import { watchEffect, type Ref } from 'vue'

export default function useSyncGlobalLoading(loadingRef: Ref<boolean>) {
  const { setIsGlobalLoading } = useGlobalLoading()
  watchEffect(async () => {
    setIsGlobalLoading(loadingRef.value)
  })
}
