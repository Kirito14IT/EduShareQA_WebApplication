import axios from 'axios'
import env from '../config/env'
import { useAuthStore } from '../store/authStore'

const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default httpClient

