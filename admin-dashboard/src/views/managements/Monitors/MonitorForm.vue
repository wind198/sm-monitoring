<script setup lang="ts">
import { faker } from '@faker-js/faker'
import FormActions from '@/lib/components/common/FormActions.vue'
import useCreateOne from '@/lib/hooks/useCreateOne'
import useGetOne from '@/lib/hooks/useGetOne'
import useUpdateOne from '@/lib/hooks/useUpdateOne'
import type { IRecord } from '@/types/record'
import {
  NForm,
  NFormItem,
  NInput,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SelectLocations from '@/lib/components/common/SelectLocations.vue'
import SelectCheckFrequency from '@/views/managements/Monitors/SelectCheckFrequency.vue'

const formRef = ref<FormInst | null>(null)

const props = defineProps<{ record?: IRecord; isEdit?: boolean }>()

const route = useRoute()
const router = useRouter()

const formValue = ref(
  props.isEdit && props.record
    ? props.record
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
    name: faker.lorem.words(2),
    url: faker.internet.url(),
    settings: {
      locations: [],
      frequency: 'every_day',
    },
  }
}

const { data: trueRecord } = useGetOne({
  resource: 'monitor',
  resourcePlural: 'monitors',
  id: route.params.id as string,
  queryOptions: {
    initialData: props.record,
  } as any,
})

watchEffect(() => {
  if (props.isEdit && trueRecord.value?.data) {
    formValue.value = trueRecord.value.data
  }
})

const message = useMessage()

const rules: FormRules = {
  name: [
    {
      required: true,
    },
  ],
  code: [
    {
      required: true,
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
  id: props.record?._id!,
})

const handleSumit = async (e: Event) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (errors) {
      message.error('Invalid form inputs')
      return
    }
  })
  const data = formValue.value
  if (!props.isEdit) {
    await createMonitor(data)
    message.success('Monitor created successfully')

    router.push('/check-monitors')
  } else if (props.record?._id) {
    await updateMonitor(data)
    message.success('Monitor updated successfully')
    router.back()
  }
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
      <NInput v-model:value="formValue.name" placeholder="Monitor name" />
    </NFormItem>
    <NFormItem label="URL" path="url">
      <NInput v-model:value="formValue.url" placeholder="Monitor URL" />
    </NFormItem>
    <NFormItem label="Check locations" path="settings.locations">
      <SelectLocations placeholder="Select check locations" v-model="formValue.settings.locations" />
    </NFormItem>
    <NFormItem label="Check frequency" path="settings.frequency">
      <SelectCheckFrequency v-model="formValue.settings.frequency" />
    </NFormItem>
    <FormActions @mock="mockMonitor" :is-edit="!!props.isEdit" />
  </NForm>
</template>
<style scoped></style>
