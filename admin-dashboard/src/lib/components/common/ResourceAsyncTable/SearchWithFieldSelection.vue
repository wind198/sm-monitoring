<script setup lang="ts">
import { SearchOutlined } from '@vicons/material'
import { NIcon, NInput, NSelect, type SelectOption } from 'naive-ui'

type ISearchFieldWithSelectionProps = {
  searchFields: Pick<SelectOption, 'label' | 'value'>[]
}

const props = defineProps<ISearchFieldWithSelectionProps>()

const searchValue = defineModel('search-value', { default: '', required: true })

const searchField = defineModel<string>('search-field', { required: true })
</script>
<template>
  <NInput
    size="large"
    autosize
    class="w-64"
    type="text"
    placeholder="Search"
    v-model:value="searchValue"
  >
    <template #prefix>
      <NIcon>
        <SearchOutlined />
      </NIcon>
    </template>
    <template #suffix>
      <span class="pb-1 relative translate-x-1 z-10">@</span>
      <NSelect
        :bordered="false"
        class="!w-24 flex items-center"
        v-model:value="searchField"
        :options="props.searchFields"
      ></NSelect>
    </template>
  </NInput>
</template>
<style scoped></style>
