import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/lib/types/has-resource'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type Ref } from 'vue'
import type { IRecord } from '@/lib/types/record'

type IUseDeleteOneOptions = IHasResource & { id: string | Ref<string> }

export type IUseDeleteOneResult<T> = {
  data: T
}

export default function useDeleteOne<T extends IRecord = IRecord>(options: IUseDeleteOneOptions) {
  const { id, resource, resourcePlural = resource + 's' } = options

  const { $delete } = useHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['delete-one', { resourcePlural }, { id }] as const,
    mutationFn: () => $delete<IUseDeleteOneResult<T>>(`/${resourcePlural}/${toValue(id)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-list', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-many', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-one', { resourcePlural }, { id }] })
    },
  })
}
