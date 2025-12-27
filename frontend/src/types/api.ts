export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

export interface UserProfile {
  id: number
  username: string
  email: string
  fullName: string
  department?: string
  roles: string[]
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  department?: string
  schoolId?: string
}

export interface ResourceMetadata {
  title: string
  summary?: string
  courseId: number
  visibility?: 'PUBLIC' | 'COURSE_ONLY'
}

export interface Resource extends ResourceMetadata {
  id: number
  uploaderId: number
  downloadCount: number
  fileType?: string
  fileSize?: number
  createdAt: string
}

export interface PagedResourceList {
  items: Resource[]
  page: number
  pageSize: number
  total: number
}

export interface ResourceQueryParams {
  page?: number
  pageSize?: number
  courseId?: number
  keyword?: string
}

export interface QuestionCreate {
  courseId: number
  title: string
  content: string
}

export interface Question extends QuestionCreate {
  id: number
  status: 'OPEN' | 'ANSWERED' | 'CLOSED'
  answerCount: number
  createdAt: string
}

export interface PagedQuestionList {
  items: Question[]
  page: number
  pageSize: number
  total: number
}

export interface QuestionQueryParams {
  page?: number
  pageSize?: number
  courseId?: number
  status?: 'OPEN' | 'ANSWERED' | 'CLOSED'
  keyword?: string
  teacherId?: number
}

export interface NotificationCounts {
  newAnswers: number
  pendingQuestions: number
}

export interface ApiLoginResponse {
  tokens: AuthTokens
  user: UserProfile
}

export interface Answer {
  id: number
  questionId: number
  teacherId: number
  teacherName?: string
  content: string
  createdAt: string
  updatedAt?: string
}

export interface QuestionDetail extends Question {
  studentId: number
  studentName?: string
  answers?: AnswerDetail[]
  attachments?: Array<{ id: number; filePath: string; fileType: string }>
}

export interface ResourceDetail extends Resource {
  uploaderName?: string
  fileUrl?: string
}

// 管理员模块类型
export interface Course {
  id: number
  code: string
  name: string
  description?: string
  faculty: string
  teacherIds?: number[]
  teacherNames?: string[]
  createdAt: string
  updatedAt?: string
}

export interface CourseCreate {
  code: string
  name: string
  description?: string
  faculty: string
  teacherIds?: number[]
}

export interface PagedCourseList {
  items: Course[]
  page: number
  pageSize: number
  total: number
}

export interface CourseQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  faculty?: string
}

export interface Teacher {
  id: number
  username: string
  email: string
  fullName: string
  department?: string
  title?: string
  bio?: string
  courseIds?: number[]
  courseNames?: string[]
  status: 'ACTIVE' | 'DISABLED'
  createdAt: string
  updatedAt?: string
}

export interface TeacherCreate {
  username: string
  email: string
  fullName: string
  password?: string
  department?: string
  title?: string
  bio?: string
  courseIds?: number[]
}

export interface PagedTeacherList {
  items: Teacher[]
  page: number
  pageSize: number
  total: number
}

export interface TeacherQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  department?: string
}

// 教师模块类型
export interface TeacherDashboardStats {
  pendingQuestions: number
  totalResources: number
  totalAnswers: number
  recentActivity?: Array<{ type: string; description: string; time: string }>
}

export interface TeacherQuestion extends Question {
  studentName?: string
  courseName?: string
}

export interface PagedTeacherQuestionList {
  items: TeacherQuestion[]
  page: number
  pageSize: number
  total: number
}

export interface AnswerCreate {
  questionId: number
  content: string
  attachments?: File[]
}

export interface AnswerDetail extends Answer {
  attachments?: Array<{ id: number; filePath: string; fileType: string }>
}

// 通用模块类型
export interface ProfileUpdate {
  fullName?: string
  email?: string
  department?: string
  avatarUrl?: string
}

export interface PasswordChange {
  oldPassword: string
  newPassword: string
}

