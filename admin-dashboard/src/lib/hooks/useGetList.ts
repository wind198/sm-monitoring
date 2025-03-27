import { removeNullFieldsFromObject } from '@/lib/helpers/others'
import useHttpClient from '@/lib/hooks/useHttpClient'
import type { IFilters } from '@/types/filters'
import type { IHasResource } from '@/types/has-resource'
import type { IPagination } from '@/types/pagination'
import type { IRecord } from '@/types/record'
import type { ISort } from '@/types/sort'
import { useQuery } from '@tanstack/vue-query'
import { get } from 'lodash-es'
import { stringify } from 'qs'
import { computed, isRef, toValue, watchEffect, type Ref } from 'vue'

type IUseGetListOptions = IHasResource & {
  pagination: IPagination | Ref<IPagination>
  sort?: ISort | Ref<ISort | undefined>
  filters?: IFilters | Ref<IFilters>
  populate?: string[] | Ref<string[]>
}

export type IUseGetListResult<T> = {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      total: number
    }
  }
}

export default function useGetList<T extends IRecord = IRecord>(options: IUseGetListOptions) {
  const { resource, resourcePlural = resource + 's', populate, pagination, sort, filters } = options

  const page = computed(() => toValue(pagination).page)
  const pageSize = computed(() => toValue(pagination).pageSize)

  const augmentedPagination = computed(() => ({
    page: toValue(page),
    pageSize: toValue(pageSize),
  }))

  const { $get } = useHttpClient()

  const res = useQuery({
    queryKey: [
      'get-list',
      { resourcePlural },
      { populate: populate, pagination: augmentedPagination, sort, filters },
    ] as const,
    queryFn: async ({ queryKey }) => {
      const [_, { resourcePlural }, { populate, pagination, sort, filters }] = queryKey

      const qsObject = removeNullFieldsFromObject({
        pagination: toValue(pagination),
        sort: toValue(sort),
        filters: toValue(filters),
        populate: toValue(populate),
      })

      const { data } = await $get<IUseGetListResult<T>>(
        `/${resourcePlural}?${stringify(qsObject, { addQueryPrefix: false })}`,
      )

      return data
    },
  })

  watchEffect(() => {
    const itemCount = get(res.data.value, ['meta', 'pagination', 'total'])
    if (itemCount !== undefined && isRef(pagination)) {
      pagination.value.itemCount = itemCount
    }
  })

  return res
}
