const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://118.89.81.131:8080/api',
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? 'false') === 'true',
}

export default env

