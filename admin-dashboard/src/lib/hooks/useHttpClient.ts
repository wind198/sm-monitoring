import { HttpClient } from '@/lib/constants/singletons/http-client'
import type { AxiosRequestConfig } from 'axios'

export default function useHttpClient() {
  const $get = <T>(url: string, config?: AxiosRequestConfig) => HttpClient.get<T>(url, config)

  const $post = <T>(url: string, data: unknown, config?: AxiosRequestConfig) =>
    HttpClient.post<T>(url, data, config)
  const $put = <T>(url: string, data: unknown, config?: AxiosRequestConfig) =>
    HttpClient.put<T>(url, data, config)
  const $delete = <T>(url: string, config?: AxiosRequestConfig) => HttpClient.delete<T>(url, config)

  return {
    $get,
    $post,
    $put,
    $delete,
  }
}
