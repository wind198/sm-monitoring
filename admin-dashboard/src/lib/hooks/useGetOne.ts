import { removeNullFieldsFromObject } from '@/lib/helpers/others'
import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/lib/types/has-resource'
import type { IRecord } from '@/lib/types/record'
import { useQuery, type UseQueryOptions } from '@tanstack/vue-query'
import { stringify } from 'qs'
import { toValue, type Ref } from 'vue'

type IUseGetOneOptions = IHasResource & {
  id: string | Ref<string>
  populate?: string[] | Ref<string[]>
  queryOptions?: UseQueryOptions
}

export type IUseGetOneResult<T> = {
  data: T
}

export default function useGetOne<T extends IRecord = IRecord>(options: IUseGetOneOptions) {
  const { id, resource, resourcePlural = resource + 's', populate, ...others } = options

  const { $get } = useHttpClient()

  return useQuery({
    queryKey: ['get-one', { resourcePlural }, { id }, { populate }] as const,
    queryFn: async ({ queryKey }) => {
      const [_, { resourcePlural }, { id }, { populate }] = queryKey
      if (!id) {
        return { data: null }
      }
      const qsObject = removeNullFieldsFromObject({
        populate: toValue(populate),
      })
      const { data } = await $get<IUseGetOneResult<T>>(
        `/${resourcePlural}/${id}?${stringify(qsObject, { addQueryPrefix: false })}`,
      )
      return data
    },
    ...(others as Omit<UseQueryOptions, 'queryKey' | 'queryFn'>),
  })
}
