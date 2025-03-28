<script setup lang="ts">
import SearchWithFieldSelection from '@/lib/components/common/ResourceAsyncTable/SearchWithFieldSelection.vue'
import Spacer from '@/lib/components/common/Spacer.vue'
import useClickOnInnerLink from '@/lib/hooks/useClickOnInnerLink'
import useGetList from '@/lib/hooks/useGetList.ts'
import type { IFilters } from '@/types/filters.ts'
import type { IHasResource } from '@/types/has-resource.ts'
import type { IRecord } from '@/types/record.ts'
import type { ISort } from '@/types/sort.ts'
import { AddOutlined } from '@vicons/material'
import { cloneDeep, set, unset } from 'lodash-es'
import {
  NButton,
  NDataTable,
  NIcon,
  type DataTableColumn,
  type DataTableSortState,
  type PaginationProps,
  type SelectOption,
} from 'naive-ui'
import { computed, ref, toRaw, toRefs, useAttrs, type HTMLAttributes, type Ref } from 'vue'
import { useRoute, useRouter, type HistoryState } from 'vue-router'

type IProps = IHasResource & {
  columns: DataTableColumn[]
  searchFields: Pick<SelectOption, 'label' | 'value'>[]
  defaultSearchField: string
  hasCreate?: boolean
}

const props = defineProps<IProps>()

const currentRoue = useRoute()

const router = useRouter()

const createRoute = computed(() => {
  if (!props.hasCreate) return
  return currentRoue.path.replace(/\$/, '').concat('/create')
})
const { resource, resourcePlural, columns } = toRefs(props)

const { handleClickOnInnerLink } = useClickOnInnerLink()

const rowKey = (row: IRecord) => row._id

const getRowProps = (rowData: object, rowIndex: number) =>
  ({
    onClick: (e: MouseEvent) => {
      e.preventDefault()
      const record = toRaw(rowData)
      router.push({
        path: `${resourcePlural.value}/${rowKey(rowData as IRecord)}`,
        // @ts-expect-error
        state: { record },
      })
    },
  }) as HTMLAttributes

const attrs = useAttrs()

const currentSearchField = ref<string>(props.defaultSearchField)

const pagination: Ref<PaginationProps> = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  prefix: (params) => {
    if (!params) return ''
    const { startIndex, endIndex, itemCount } = params

    if (!itemCount) {
      return `Total ${itemCount} ${resource.value}`
    }

    return `${startIndex + 1}-${endIndex + 1} of ${itemCount} ${itemCount > 1 ? resourcePlural.value : resource.value}`
  },
})

const sort: Ref<ISort | undefined> = ref()

const filters = ref<IFilters>({})

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleSorterChange = (sortState: DataTableSortState | DataTableSortState[] | null) => {
  if (sortState === null) {
    sort.value = undefined
    return
  }
  if (Array.isArray(sortState)) {
    console.warn('Multiple sort is not supported yet')
    return
  }
  sort.value = {
    field: sortState.columnKey as string,
    order: sortState.order === 'ascend' ? 'ASC' : 'DESC',
  }
}

const handleFiltersChange = (paths: string[] | string, value: any) => {
  if (!Array.isArray(paths)) {
    paths = [paths]
  }
  const newFilters = cloneDeep(filters.value)

  if (value === null) {
    unset(newFilters, paths)
    filters.value = newFilters
    return
  }
  set(newFilters, paths, value)
  filters.value = newFilters
}

const realFilters = computed(() => {
  const { q, ...others } = filters.value
  if (!q) return others
  return {
    ...others,
    [currentSearchField.value]: { $regex: q },
  }
})

const { data, isLoading } = useGetList({
  resource: resource.value,
  resourcePlural: resourcePlural.value,
  filters: realFilters,
  pagination: pagination as any,
  sort,
})
</script>
<template>
  <div class="resource-async-table">
    <div class="toolbar flex space-x-4 items-center mb-4">
      <div class="filters">
        <slot name="filters-prefix"></slot>

        <SearchWithFieldSelection
          v-model:search-field="currentSearchField"
          :search-fields="props.searchFields"
          v-model:search-value="filters['q']"
        />
        <slot name="filters-suffix"></slot>
      </div>
      <Spacer />
      <div class="actions">
        <slot name="actions-prefix"></slot>
        <NButton v-if="!!createRoute" type="primary" @click="handleClickOnInnerLink">
          <template #icon>
            <NIcon>
              <AddOutlined />
            </NIcon>
          </template>
          <RouterLink :to="createRoute"> Create </RouterLink>
        </NButton>

        <slot name="actions-suffix"></slot>
      </div>
    </div>
    <n-data-table
      remote
      ref="table"
      :columns="columns"
      :data="data?.data"
      :loading="isLoading"
      :pagination="pagination"
      :row-key="rowKey"
      @update:sorter="handleSorterChange"
      @update:page="handlePageChange"
      v-bind="attrs"
      :row-props="getRowProps"
    >
    </n-data-table>
  </div>
</template>
<style scoped></style>
