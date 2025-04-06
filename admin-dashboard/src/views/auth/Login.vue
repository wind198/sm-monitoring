<script setup lang="ts">
import { USER_DATA_KEY } from '@/lib/constants/keys'
import useHttpClient from '@/lib/hooks/useHttpClient.ts'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const formValue = ref({ email: '', password: '' })

const formRef = ref<FormInst | null>(null)

const message = useMessage()

const router = useRouter()

const httpClient = useHttpClient()

const rules: FormRules = {
  email: [
    {
      required: true,
      message: 'Email is required',
    },
  ],
  password: [
    {
      required: true,
      message: 'Password is required',
    },
  ],
}

const sendLoginRequest = async (payload: { email: string; password: string }) => {
  const { data } = await httpClient.$post('auth/login', payload)

  message.success('Login successful')

  const {user} = data

  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))

  router.push('/')
}

const handleSumit = async (e: Event) => {
  e.preventDefault()
  formRef.value?.validate(async (errors) => {
    if (errors) {
      message.error('Invalid form inputs')
      return
    }
    const data = formValue.value
  
    await sendLoginRequest(data)
  })
}

const mockLogin = async () => {
  formValue.value.email = 'tuanbk1908@gmail.com'
  formValue.value.password = 'password'

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
    <NFormItem label="Email" path="email">
      <NInput v-model:value="formValue.email" />
    </NFormItem>
    <NFormItem label="Password" path="password">
      <NInput v-model:value="formValue.password"  />
    </NFormItem>
    <FormActions @mock="mockLogin" />
  </NForm>
</template>
<style scoped></style>
