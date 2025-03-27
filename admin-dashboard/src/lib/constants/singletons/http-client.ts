import { WEB_SERVER_URL } from '@/lib/constants/env'
import axios from 'axios'

export const HttpClient = axios.create({
  baseURL: WEB_SERVER_URL,
})
