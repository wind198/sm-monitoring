import { get } from 'lodash-es'
import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/types/has-resource'
import type { IRecord } from '@/types/record'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type Ref } from 'vue'
import { removeNullFieldsFromObject } from '@/lib/helpers/others'
import { stringify } from 'qs'

type IUseUpdateManyOptions = IHasResource & { ids: string[] | Ref<string[]> }

export type IUseUpdateManyResult<T> = { data: string[] }

export default function useUpdateMany<T extends IRecord = IRecord>(options: IUseUpdateManyOptions) {
  const { ids, resource, resourcePlural = resource + 's' } = options

  const { $put } = useHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-many', { resourcePlural, ids }] as const,
    mutationFn: async (data: Partial<T>) => {
      const $ids = toValue(ids)
      if (!$ids.length) {
        return await Promise.resolve([] as string[])
      }
      const qsObject = removeNullFieldsFromObject({
        ids: $ids,
      })

      const { data: res } = await $put<IUseUpdateManyResult<T>>(
        `/${resourcePlural}/update-many?${stringify(qsObject, { addQueryPrefix: false })}}`,
        data,
      )
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-list', { resourcePlural }] })
      queryClient.invalidateQueries({ queryKey: ['get-many', { resourcePlural }] })
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === 'get-one' &&
            get(query.queryKey[1], 'resourcePlural') === resourcePlural &&
            toValue(ids).includes(toValue(get(query.queryKey[1], 'id') as any))
          )
        },
      })
    },
  })
}
