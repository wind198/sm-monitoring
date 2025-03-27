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
  NIcon,
  NInput,
  NTooltip,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { InfoOutlined } from '@vicons/material'

const formRef = ref<FormInst | null>(null)

const formSubmited = ref(false)

const props = defineProps<{ record?: IRecord; isEdit?: boolean }>()

const route = useRoute()
const router = useRouter()

const formValue = ref(
  props.isEdit && props.record
    ? props.record
    : {
        name: '',
        code: '',
      },
)

const mockLocation = () => {
  formValue.value = {
    name: faker.lorem.words(2),
    code: faker.lorem.word(2),
  }
}

const { data: trueRecord } = useGetOne({
  resource: 'location',
  resourcePlural: 'locations',
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

const { mutateAsync: createLocation } = useCreateOne({
  resource: 'location',
  resourcePlural: 'locations',
})

const { mutateAsync: updateLocation } = useUpdateOne({
  resource: 'location',
  resourcePlural: 'locations',
  id: props.record?._id!,
})

const handleSumit = async (e: Event) => {
  formSubmited.value = true
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form inputs')
      return
    }
    const data = formValue.value
    if (!props.isEdit) {
      await createLocation(data)
      message.success('Location created successfully')

      router.push('/check-locations')
    } else if (props.record?._id) {
      await updateLocation(data)
      message.success('Location updated successfully')
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
    <NFormItem path="code">
      <template #label> Code </template>
      <NInput autofocus v-model:value="formValue.code" />
      <template v-if="!formSubmited" #feedback>
        You will not be able to edit this field after creation
      </template>
    </NFormItem>
    <NFormItem label="Name" path="name">
      <NInput v-model:value="formValue.name" />
    </NFormItem>
    <FormActions @mock="mockLocation" :is-edit="!!props.isEdit" />
  </NForm>
</template>
<style scoped></style>
