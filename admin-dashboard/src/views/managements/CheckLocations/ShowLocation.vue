<script setup lang="ts">
import useGetOne from '@/lib/hooks/useGetOne.ts'
import useSyncGlobalLoading from '@/lib/hooks/useSyncGlobalLoading.ts'
import { get } from 'lodash-es'
import { NDescriptions, NDescriptionsItem } from 'naive-ui'
import { ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const state = history.state

const record = ref(get(state, 'record'))

const route = useRoute()

const id = ref(route.params.id as string)

const { data: trueRecord, isLoading } = useGetOne({
  resource: 'location',
  resourcePlural: 'locations',
  id,
})

watchEffect(() => {
  if (trueRecord.value) {
    record.value = get(trueRecord.value, 'data')
  }
})

useSyncGlobalLoading(isLoading)
</script>
<template>
  <NDescriptions v-if="record" :columns="3">
    <NDescriptionsItem>
      <template #label> Name </template>
      {{ get(record, 'name') }}
    </NDescriptionsItem>
    <NDescriptionsItem>
      <template #label> Code </template>
      {{ get(record, 'code') }}
    </NDescriptionsItem>
  </NDescriptions>
</template>
<style scoped></style>
