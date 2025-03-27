import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/types/has-resource'
import type { IRecord } from '@/types/record'
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { type Ref } from 'vue'

type IUseGetOneOptions = IHasResource & {
  id: string | Ref<string>
  queryOptions?: UseQueryOptions
}

export type IUseGetOneResult<T> = {
  data: T
}

export default function useGetOne<T extends IRecord = IRecord>(options: IUseGetOneOptions) {
  const { id, resource, resourcePlural = resource + 's', ...others } = options

  const { $get } = useHttpClient()

  return useQuery({
    queryKey: ['get-one', { resourcePlural }, { id }] as const,
    queryFn: async ({ queryKey }) => {
      const [_, { resourcePlural }, { id }] = queryKey
      if (!id) {
        return { data: null }
      }
      const { data } = await $get<IUseGetOneResult<T>>(`/${resourcePlural}/${id}`)
      return data
    },
    ...(others as Omit<UseQueryOptions, 'queryKey' | 'queryFn'>),
  })
}
