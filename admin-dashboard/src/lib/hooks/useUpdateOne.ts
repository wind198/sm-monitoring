import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/types/has-resource'
import type { IRecord } from '@/types/record'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type Ref } from 'vue'

type IUseUpdateOneOptions = IHasResource & { id: string | Ref<string> }

type IUseUpdateOneResult<T> = { data: T }

export default function useUpdateOne<T extends IRecord = IRecord>(options: IUseUpdateOneOptions) {
  const { id, resource, resourcePlural = resource + 's' } = options

  const { $put } = useHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-one', { resourcePlural, id }] as const,
    mutationFn: (data: Partial<T>) =>
      $put<IUseUpdateOneResult<T>>(`/${resourcePlural}/${toValue(id)}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-list', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-many', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-one', { resourcePlural }, { id }] })
    },
  })
}
