<script setup lang="ts">
import type { INavItem } from '@/layouts/HomeLayout/MainLeftNav/nav-item.type'
import useClickOnInnerLink from '@/lib/hooks/useClickOnInnerLink.ts'
import { NIcon, NList, NListItem } from 'naive-ui'

const props = defineProps<INavItem>()

const { handleClickOnInnerLink } = useClickOnInnerLink()
</script>
<template>
  <NListItem
    class="!pl-2"
    :class="[...(props.to ? ['cursor-pointer', 'hover:text-blue-400'] : ['cursor-default'])]"
  >
    <template #prefix v-if="props.icon">
      <NIcon>
        <component :is="props.icon"></component>
      </NIcon>
    </template>
    <NList v-if="props.children?.length">
      <template #header>
        <span class="font-bold">{{ props.label }}</span>
      </template>
      <NavItem v-for="i in props.children" v-bind="i" />
    </NList>
    <div v-else @click="handleClickOnInnerLink">
      <RouterLink v-if="props.to" :to="props.to">{{ props.label }}</RouterLink>
      <span v-else>{{ props.label }}</span>
    </div>
  </NListItem>
</template>
<style scoped></style>
