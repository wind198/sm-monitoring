<script setup lang="ts">
import ResourceAsyncTable from '@/lib/components/common/ResourceAsyncTable.vue'
import type { DataTableColumn } from 'naive-ui'

const columns: DataTableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'code', title: 'Code' },
]
</script>
<template>
  <ResourceAsyncTable
    resource="location"
    resource-plural="locations"
    :columns="columns"
    default-search-field="name"
    :search-fields="[
      { label: 'Name', value: 'name' },
      { label: 'Code', value: 'code' },
    ]"
    has-create
  >
  </ResourceAsyncTable>
</template>
<style scoped></style>
