import { HttpClient } from '@/lib/constants/singletons/http-client'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { useMessage } from 'naive-ui'
import type { IRecord } from '../types/record'

const extractMsgFromAxiosError = (e: AxiosError) => {
  let output: any
  if (e.response) {
    // @ts-expect-error
    output = e?.response?.data?.message || e?.response?.data?.error || e?.message
  } else {
    output = e?.message
  }
  if (typeof output === 'string') {
    return output
  }
  if (Array.isArray(output)) {
    return output.join(',')
  }
  return output.toString()
}

export default function useHttpClient() {
  const message = useMessage()

  const $get = <T = IRecord>(url: string, config?: AxiosRequestConfig) =>
    HttpClient.get<T>(url, config)
      .then((res) => res)
      .catch((err) => {
        message.error(extractMsgFromAxiosError(err))
        throw err
      })

  const $post = <T = IRecord>(url: string, data: unknown, config?: AxiosRequestConfig) =>
    HttpClient.post<T>(url, data, config)
      .then((res) => res)
      .catch((err) => {
        message.error(extractMsgFromAxiosError(err))
        throw err
      })

  const $put = <T = IRecord>(url: string, data: unknown, config?: AxiosRequestConfig) =>
    HttpClient.put<T>(url, data, config)
      .then((res) => res)
      .catch((err) => {
        message.error(extractMsgFromAxiosError(err))
        throw err
      })
  const $delete = <T = IRecord>(url: string, config?: AxiosRequestConfig) =>
    HttpClient.delete<T>(url, config)
      .then((res) => res)
      .catch((err) => {
        message.error(extractMsgFromAxiosError(err))
        throw err
      })

  return {
    $get,
    $post,
    $put,
    $delete,
  }
}
