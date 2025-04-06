import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/lib/types/has-resource'
import type { IRecord } from '@/lib/types/record'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

type IUseCreateOneOptions = IHasResource

export type IUseCreateOneResult<T> = {
  data: T
}

export default function useCreateOne<T extends IRecord = IRecord>(options: IUseCreateOneOptions) {
  const { resource, resourcePlural = resource + 's' } = options

  const { $post } = useHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-one', { resourcePlural }] as const,
    mutationFn: async (data: Partial<T>) => {
      const { data: res } = await $post<IUseCreateOneResult<T>>(`/${resourcePlural}`, data)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-list', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-many', { resourcePlural }] })
    },
  })
}
