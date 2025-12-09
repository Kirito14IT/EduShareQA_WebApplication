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

// 响应拦截器：解包ApiResponse格式
httpClient.interceptors.response.use(
  (response) => {
    // 如果响应数据是ApiResponse格式 {code, message, data}，则提取data
    if (response.data && typeof response.data === 'object' && 'code' in response.data && 'data' in response.data) {
      if (response.data.code === 0) {
        return { ...response, data: response.data.data }
      } else {
        return Promise.reject(new Error(response.data.message || '请求失败'))
      }
    }
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response?.data) {
      const errorData = error.response.data
      if (errorData.code !== undefined && errorData.message) {
        return Promise.reject(new Error(errorData.message))
      }
    }
    return Promise.reject(error)
  }
)

export default httpClient

