<script setup lang="ts">
import FormActions from '@/lib/components/common/FormActions.vue'
import SelectLocations from '@/lib/components/common/SelectLocations.vue'
import useCreateOne from '@/lib/hooks/useCreateOne'
import useGetOne from '@/lib/hooks/useGetOne'
import useSyncGlobalLoading from '@/lib/hooks/useSyncGlobalLoading.ts'
import useUpdateOne from '@/lib/hooks/useUpdateOne'
import SelectCheckFrequency from '@/views/managements/Monitors/SelectCheckFrequency.vue'
import { faker } from '@faker-js/faker'
import { get } from 'lodash-es'
import { NForm, NFormItem, NInput, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const formRef = ref<FormInst | null>(null)

const props = defineProps<{ isEdit?: boolean }>()

const state = history.state

const record = ref(get(state, 'record'))

const route = useRoute()

const id = ref(route.params.id as string)

const router = useRouter()

const formValue = ref(
  props.isEdit
    ? record
    : {
        name: '',
        url: '',
        settings: {
          locations: [],
          frequency: 'every_day',
        },
      },
)

const mockMonitor = () => {
  formValue.value = {
    name: 'Niteco',
    url: 'https://niteco.com',
    settings: {
      locations: ['us_east'],
      frequency: 'every_day',
    },
  }
}

const { data: trueRecord, isLoading } = useGetOne({
  resource: 'monitor',
  resourcePlural: 'monitors',
  id: route.params.id as string,
})

watchEffect(() => {
  if (props.isEdit && trueRecord.value?.data) {
    formValue.value = trueRecord.value.data
  }
})

useSyncGlobalLoading(isLoading)

const message = useMessage()

const rules: FormRules = {
  name: [
    {
      required: true,
      message: 'Name is required',
    },
  ],
  url: [
    {
      required: true,
      message: 'URL is required',
    },
  ],
  'settings.locations': [
    {
      required: true,
      message: 'Please select at least one location',
    },
  ],
}

const { mutateAsync: createMonitor } = useCreateOne({
  resource: 'monitor',
  resourcePlural: 'monitors',
})

const { mutateAsync: updateMonitor } = useUpdateOne({
  resource: 'monitor',
  resourcePlural: 'monitors',
  id: id,
})

const handleSumit = async (e: Event) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form inputs')
      return
    }
    const data = formValue.value
    if (!props.isEdit) {
      await createMonitor(data)
      message.success('Monitor created successfully')

      router.push('/monitors')
    } else if (id.value) {
      await updateMonitor(data)
      message.success('Monitor updated successfully')
      router.back()
    }
  })
}
</script>
<template>
  <NForm
    class="w-[600px] space-y-1"
    ref="formRef"
    :label-width="80"
    :model="formValue"
    :rules="rules"
    @submit="handleSumit"
  >
    <NFormItem label="Name" path="name">
      <NInput v-model:value="formValue.name" />
    </NFormItem>
    <NFormItem label="URL" path="url">
      <NInput v-model:value="formValue.url" placeholder="https://" />
    </NFormItem>
    <NFormItem label="Check locations" path="settings.locations">
      <SelectLocations v-model="formValue.settings.locations" />
    </NFormItem>
    <NFormItem label="Check frequency" path="settings.frequency">
      <SelectCheckFrequency v-model="formValue.settings.frequency" />
    </NFormItem>
    <FormActions @mock="mockMonitor" :is-edit="!!props.isEdit" />
  </NForm>
</template>
<style scoped></style>
