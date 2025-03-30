<script setup lang="ts">
import useClickOnInnerLink from '@/lib/hooks/useClickOnInnerLink.ts'
import useGetOne from '@/lib/hooks/useGetOne.ts'
import useSyncGlobalLoading from '@/lib/hooks/useSyncGlobalLoading.ts'
import { EditOutlined } from '@vicons/material'
import { get, lowerCase, upperFirst } from 'lodash-es'
import { NDescriptions, NDescriptionsItem, NIcon, NTag } from 'naive-ui'
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const state = history.state

const record = ref(get(state, 'record'))

const route = useRoute()

const id = ref(route.params.id as string)

const { data: trueRecord, isLoading } = useGetOne({
  resource: 'monitor',
  resourcePlural: 'monitors',
  id,
  populate: ['settings.locations'],
})

watchEffect(() => {
  if (trueRecord.value) {
    record.value = get(trueRecord.value, 'data')
  }
})

useSyncGlobalLoading(isLoading)

const checkLocations = computed(() => {
  const raw = get(record.value, 'settings.locations')
  if (!raw) {
    return null
  }
  if (!raw.length) {
    return []
  }
  if (typeof raw[0] === 'string') {
    return null
  }

  return raw
})

const { handleClickOnInnerLink } = useClickOnInnerLink()
</script>
<template>
  <NDescriptions v-if="record" :columns="3">
    <Teleport to="#page-title-actions">
      <NButton type="primary" @click="handleClickOnInnerLink">
        <RouterLink :to="{ path: 'edit' }">
          <NIcon class="mr-2">
            <EditOutlined />
          </NIcon>
          Edit</RouterLink
        >
      </NButton>
    </Teleport>
    <NDescriptionsItem>
      <template #label> Name </template>
      {{ get(record, 'name') }}
    </NDescriptionsItem>
    <NDescriptionsItem>
      <template #label> URL </template>
      {{ get(record, 'name') }}
    </NDescriptionsItem>
    <NDescriptionsItem>
      <template #label> Check frequency </template>
      {{ upperFirst(lowerCase(get(record, 'settings.frequency'))) }}
    </NDescriptionsItem>
    <NDescriptionsItem :span="3">
      <template #label> Check locations </template>
      <div class="flex space-x-2 mt-1">
        <NTag
          @click="handleClickOnInnerLink"
          round
          :bordered="false"
          v-for="i in checkLocations"
          :key="i.code"
        >
          <RouterLink :to="'/locations/' + i._id" class="text-blue-500">
            {{ i.name }}
          </RouterLink>
        </NTag>
        <span v-if="checkLocations && !checkLocations.length"> No locations </span>
      </div>
    </NDescriptionsItem>
  </NDescriptions>
</template>
<style scoped></style>
