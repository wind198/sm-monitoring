import { get } from 'lodash-es'
import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IHasResource } from '@/lib/types/has-resource'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { toValue, type Ref } from 'vue'
import { removeNullFieldsFromObject } from '@/lib/helpers/others'
import { stringify } from 'qs'
import type { IRecord } from '@/lib/types/record'

type IUseDeleteManyOptions = IHasResource & { ids: string[] | Ref<string[]> }

export type IUseDeleteManyResult<T> = { data: string[] }

export default function useDeleteMany<T extends IRecord = IRecord>(options: IUseDeleteManyOptions) {
  const { ids, resource, resourcePlural = resource + 's' } = options

  const { $delete } = useHttpClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['delete-many', { resourcePlural, ids }] as const,
    mutationFn: async () => {
      const $ids = toValue(ids)
      if (!$ids.length) {
        return await Promise.resolve([] as string[])
      }
      const qsObject = removeNullFieldsFromObject({
        ids: $ids,
      })

      const { data: res } = await $delete<IUseDeleteManyResult<T>>(
        `/${resourcePlural}/delete-many?${stringify(qsObject, { addQueryPrefix: false })}}`,
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
