<script setup lang="ts">
import ResourceAsyncTable from '@/lib/components/common/ResourceAsyncTable.vue'
import type { DataTableColumn } from 'naive-ui'

const columns: DataTableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'url', title: 'URL' },
]
</script>
<template>
  <ResourceAsyncTable
    resource="monitor"
    resource-plural="monitors"
    :columns="columns"
    default-search-field="name"
    :search-fields="[
      { label: 'Name', value: 'name' },
      { label: 'URL', value: 'url' },
    ]"
    has-create
  ></ResourceAsyncTable>
</template>
<style scoped></style>
