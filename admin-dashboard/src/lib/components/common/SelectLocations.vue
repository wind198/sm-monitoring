<script setup lang="ts">
import useGetList from '@/lib/hooks/useGetList'
import { NSelect, type AutoCompleteOption } from 'naive-ui'
import { computed, ref, type ComputedRef } from 'vue'

const model = defineModel<string>()

const searchValue = ref('')

const handleSearch = (value: string) => {
  searchValue.value = value
}

const locationFilters = computed(() => {
  if (!searchValue.value) {
    return {}
  }

  return {
    $or: [{ name: { $regex: searchValue.value } }, { code: { $regex: searchValue.value } }],
  }
})

const { data: locationList, isLoading } = useGetList({
  filters: locationFilters,
  resource: 'location',
  resourcePlural: 'locations',
  pagination: { page: 1, pageSize: 50 } as any,
  sort: { field: 'name', order: 'ASC' },
})

const options: ComputedRef<AutoCompleteOption[]> = computed(() => {
  if (!locationList.value?.data) return []
  return locationList.value?.data.map(({ name, code }) => ({ value: code, label: name }))
})
</script>
<template>
  <NSelect
    v-model:value="model"
    multiple
    filterable
    remote
    :options="options"
    @search="handleSearch"
  />
</template>
<style scoped></style>
