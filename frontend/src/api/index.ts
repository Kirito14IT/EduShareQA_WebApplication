import env from '../config/env'
import mockApi from './mockApi'
import realApi from './realApi'

const api = env.useMocks ? mockApi : realApi

export default api
export * from './realApi'

