import { removeNullFieldsFromObject } from '@/lib/helpers/others'
import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/types/has-resource'
import type { IRecord } from '@/types/record'
import { useQuery } from '@tanstack/vue-query'
import { stringify } from 'qs'
import { type Ref } from 'vue'

type IUseGetManyOptions = IHasResource & {
  ids: string[] | Ref<string[]>
  populate?: string[] | Ref<string[]>
}

export type IUseGetManyResult<T> = {
  data: T[]
}
export default function useGetMany<T extends IRecord = IRecord>(options: IUseGetManyOptions) {
  const { populate, ids, resource, resourcePlural = resource + 's' } = options

  const { $get } = useHttpClient()

  return useQuery({
    queryKey: ['get-many', { resourcePlural }, { ids, populate }] as const,
    queryFn: async ({ queryKey }) => {
      const [_, { resourcePlural }, { ids, populate }] = queryKey
      if (!ids.length) {
        return await Promise.resolve([] as T[])
      }
      const qsObject = removeNullFieldsFromObject({
        populate: populate,
        ids: ids,
      })
      const { data } = await $get<IUseGetManyResult<T>>(
        `/${resourcePlural}?${stringify(qsObject, { addQueryPrefix: false })}`,
      )
      return data
    },
  })
}
