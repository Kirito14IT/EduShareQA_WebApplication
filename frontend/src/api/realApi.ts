import httpClient from './httpClient'
import type {
  ApiLoginResponse,
  AuthTokens,
  LoginRequest,
  NotificationCounts,
  PagedQuestionList,
  PagedResourceList,
  Question,
  QuestionCreate,
  QuestionQueryParams,
  RegisterRequest,
  Resource,
  ResourceMetadata,
  ResourceQueryParams,
  UserProfile,
} from '../types/api'

export interface ResourceUploadPayload {
  metadata: ResourceMetadata
  file?: File | null
}

export interface QuestionCreatePayload extends QuestionCreate {
  attachments?: File[]
}

import type {
  AnswerCreate,
  AnswerDetail,
  Course,
  CourseCreate,
  CourseQueryParams,
  PagedCourseList,
  PasswordChange,
  PagedTeacherList,
  PagedTeacherQuestionList,
  ProfileUpdate,
  QuestionDetail,
  ResourceDetail,
  Teacher,
  TeacherCreate,
  TeacherDashboardStats,
  TeacherQueryParams,
} from '../types/api'

export interface RealApi {
  // 认证
  login(payload: LoginRequest): Promise<ApiLoginResponse>
  register(payload: RegisterRequest): Promise<ApiLoginResponse>
  // 学生资源
  getResources(params: ResourceQueryParams): Promise<PagedResourceList>
  getResourceById(id: number): Promise<ResourceDetail>
  uploadResource(payload: ResourceUploadPayload): Promise<Resource>
  updateResource(id: number, metadata: ResourceMetadata): Promise<Resource>
  deleteResource(id: number): Promise<void>
  getMyResources(params: ResourceQueryParams): Promise<PagedResourceList>
  // 学生问答
  getQuestions(params: QuestionQueryParams): Promise<PagedQuestionList>
  searchQuestions(params: QuestionQueryParams): Promise<PagedQuestionList>
  getQuestionById(id: number): Promise<QuestionDetail>
  createQuestion(payload: QuestionCreatePayload): Promise<Question>
  updateQuestion(id: number, payload: Partial<QuestionCreate>): Promise<Question>
  deleteQuestion(id: number): Promise<void>
  // 通知
  getNotificationCounts(): Promise<NotificationCounts>
  // 管理员 - 课程
  getCourses(params: CourseQueryParams): Promise<PagedCourseList>
  createCourse(payload: CourseCreate): Promise<Course>
  updateCourse(id: number, payload: Partial<CourseCreate>): Promise<Course>
  deleteCourse(id: number): Promise<void>
  // 管理员 - 教师
  getTeachers(params: TeacherQueryParams): Promise<PagedTeacherList>
  createTeacher(payload: TeacherCreate): Promise<Teacher>
  updateTeacher(id: number, payload: Partial<TeacherCreate>): Promise<Teacher>
  setTeacherCourses(teacherId: number, courseIds: number[]): Promise<void>
  deleteTeacher(id: number): Promise<void>
  // 管理员 - 内容管理
  getAllResources(params: ResourceQueryParams): Promise<PagedResourceList>
  adminDeleteResource(id: number): Promise<void>
  adminUpdateResource(id: number, metadata: Partial<ResourceMetadata>): Promise<Resource>
  getAllQuestions(params: QuestionQueryParams): Promise<PagedQuestionList>
  adminDeleteQuestion(id: number): Promise<void>
  adminDeleteAnswer(id: number): Promise<void>
  // 教师模块
  getTeacherDashboardStats(): Promise<TeacherDashboardStats>
  getTeacherQuestions(params: QuestionQueryParams): Promise<PagedTeacherQuestionList>
  getTeacherQuestionById(id: number): Promise<QuestionDetail>
  createAnswer(payload: AnswerCreate): Promise<AnswerDetail>
  updateAnswer(id: number, payload: Partial<AnswerCreate>): Promise<AnswerDetail>
  deleteAnswer(id: number): Promise<void>
  uploadTeacherResource(payload: ResourceUploadPayload): Promise<Resource>
  // 通用模块
  getProfile(): Promise<UserProfile>
  updateProfile(payload: ProfileUpdate): Promise<UserProfile>
  changePassword(payload: PasswordChange): Promise<void>
}

const realApi: RealApi = {
  async login(payload) {
    const { data: tokens } = await httpClient.post<AuthTokens>('/auth/login', payload)
    const { data: profile } = await httpClient.get<UserProfile>('/profile/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    })
    return { tokens, user: profile }
  },

  async register(payload) {
    await httpClient.post('/auth/register', payload)
    return realApi.login({ username: payload.username, password: payload.password })
  },

  async getResources(params) {
    const { data } = await httpClient.get<PagedResourceList>('/student/resources', { params })
    return data
  },

  async uploadResource({ metadata, file }) {
    const formData = new FormData()
    formData.append('metadata', JSON.stringify(metadata))
    if (file) {
      formData.append('file', file)
    }
    const { data } = await httpClient.post<Resource>('/student/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getQuestions(params) {
    const { data } = await httpClient.get<PagedQuestionList>('/student/questions', { params })
    return data
  },

  async createQuestion(payload) {
    const formData = new FormData()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { attachments, ...metadata } = payload
    formData.append('metadata', JSON.stringify(metadata))
    payload.attachments?.forEach((file) => {
      formData.append('attachments', file)
    })
    const { data } = await httpClient.post<Question>('/student/questions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getNotificationCounts() {
    const { data } = await httpClient.get<NotificationCounts>('/notifications/unread-count')
    return data
  },

  async getResourceById(id: number) {
    const { data } = await httpClient.get<ResourceDetail>(`/student/resources/${id}`)
    return data
  },

  async updateResource(id: number, metadata: ResourceMetadata) {
    const { data } = await httpClient.put<Resource>(`/student/resources/${id}`, metadata)
    return data
  },

  async deleteResource(id: number) {
    await httpClient.delete(`/student/resources/${id}`)
  },

  async getMyResources(params: ResourceQueryParams) {
    const { data } = await httpClient.get<PagedResourceList>('/student/resources/my', { params })
    return data
  },

  async searchQuestions(params: QuestionQueryParams) {
    const { data } = await httpClient.get<PagedQuestionList>('/student/questions/search', { params })
    return data
  },

  async getQuestionById(id: number) {
    const { data } = await httpClient.get<QuestionDetail>(`/student/questions/${id}`)
    return data
  },

  async updateQuestion(id: number, payload: Partial<QuestionCreate>) {
    const { data } = await httpClient.put<Question>(`/student/questions/${id}`, payload)
    return data
  },

  async deleteQuestion(id: number) {
    await httpClient.delete(`/student/questions/${id}`)
  },

  // 管理员模块
  async getCourses(params: CourseQueryParams) {
    const { data } = await httpClient.get<PagedCourseList>('/admin/courses', { params })
    return data
  },

  async createCourse(payload: CourseCreate) {
    const { data } = await httpClient.post<Course>('/admin/courses', payload)
    return data
  },

  async updateCourse(id: number, payload: Partial<CourseCreate>) {
    const { data } = await httpClient.put<Course>(`/admin/courses/${id}`, payload)
    return data
  },

  async deleteCourse(id: number) {
    await httpClient.delete(`/admin/courses/${id}`)
  },

  async getTeachers(params: TeacherQueryParams) {
    const { data } = await httpClient.get<PagedTeacherList>('/admin/teachers', { params })
    return data
  },

  async createTeacher(payload: TeacherCreate) {
    const { data } = await httpClient.post<Teacher>('/admin/teachers', payload)
    return data
  },

  async updateTeacher(id: number, payload: Partial<TeacherCreate>) {
    const { data } = await httpClient.put<Teacher>(`/admin/teachers/${id}`, payload)
    return data
  },

  async setTeacherCourses(teacherId: number, courseIds: number[]) {
    await httpClient.post(`/admin/teachers/${teacherId}/courses`, { courseIds })
  },

  async deleteTeacher(id: number) {
    await httpClient.delete(`/admin/teachers/${id}`)
  },

  async getStudents(params: StudentQueryParams) {
    const { data } = await httpClient.get<PagedStudentList>('/admin/students', { params })
    return data
  },

  async setStudentCourses(studentId: number, courseIds: number[]) {
    await httpClient.post(`/admin/students/${studentId}/courses`, { courseIds })
  },

  async getAllResources(params: ResourceQueryParams) {
    const { data } = await httpClient.get<PagedResourceList>('/admin/resources', { params })
    return data
  },

  async adminDeleteResource(id: number) {
    await httpClient.delete(`/admin/resources/${id}`)
  },

  async adminUpdateResource(id: number, metadata: Partial<ResourceMetadata>) {
    const { data } = await httpClient.put<Resource>(`/admin/resources/${id}`, metadata)
    return data
  },

  async getAllQuestions(params: QuestionQueryParams) {
    const { data } = await httpClient.get<PagedQuestionList>('/admin/questions', { params })
    return data
  },

  async adminDeleteQuestion(id: number) {
    await httpClient.delete(`/admin/questions/${id}`)
  },

  async adminDeleteAnswer(id: number) {
    await httpClient.delete(`/admin/answers/${id}`)
  },

  // 教师模块
  async getTeacherDashboardStats() {
    const { data } = await httpClient.get<TeacherDashboardStats>('/teacher/dashboard/stats')
    return data
  },

  async getTeacherQuestions(params: QuestionQueryParams) {
    const { data } = await httpClient.get<PagedTeacherQuestionList>('/teacher/questions', { params })
    return data
  },

  async getTeacherQuestionById(id: number) {
    const { data } = await httpClient.get<QuestionDetail>(`/teacher/questions/${id}`)
    return data
  },

  async createAnswer(payload: AnswerCreate) {
    const formData = new FormData()
    formData.append('metadata', JSON.stringify({ questionId: payload.questionId, content: payload.content }))
    payload.attachments?.forEach((file) => {
      formData.append('attachments', file)
    })
    const { data } = await httpClient.post<AnswerDetail>('/teacher/answers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async updateAnswer(id: number, payload: Partial<AnswerCreate>) {
    const { data } = await httpClient.put<AnswerDetail>(`/teacher/answers/${id}`, payload)
    return data
  },

  async deleteAnswer(id: number) {
    await httpClient.delete(`/teacher/answers/${id}`)
  },

  async uploadTeacherResource(payload: ResourceUploadPayload) {
    const formData = new FormData()
    formData.append('metadata', JSON.stringify(payload.metadata))
    if (payload.file) {
      formData.append('file', payload.file)
    }
    const { data } = await httpClient.post<Resource>('/teacher/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // 通用模块
  async getProfile() {
    const { data } = await httpClient.get<UserProfile>('/profile/me')
    return data
  },

  async updateProfile(payload: ProfileUpdate) {
    const { data } = await httpClient.put<UserProfile>('/profile/me', payload)
    return data
  },

  async changePassword(payload: PasswordChange) {
    await httpClient.put('/profile/password', payload)
  },
}

export default realApi

