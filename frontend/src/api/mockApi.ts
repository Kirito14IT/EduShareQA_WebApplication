import type {
  Answer,
  AnswerCreate,
  AnswerDetail,
  ApiLoginResponse,
  Course,
  CourseCreate,
  CourseQueryParams,
  ForgotPasswordRequest,
  LoginRequest,
  NotificationCounts,
  NotificationDetail,
  PagedCourseList,
  PagedQuestionList,
  PagedResourceList,
  PagedTeacherList,
  PagedTeacherQuestionList,
  PagedStudentList,
  PasswordChange,
  ProfileUpdate,
  Question,
  QuestionCreate,
  QuestionDetail,
  QuestionQueryParams,
  RegisterRequest,
  ResetPasswordRequest,
  Resource,
  ResourceDetail,
  ResourceMetadata,
  ResourceQueryParams,
  Student,
  StudentQueryParams,
  Teacher,
  TeacherCreate,
  TeacherDashboardStats,
  TeacherQueryParams,
  UserProfile,
  VerifyResetTokenRequest,
} from '../types/api'
import type { QuestionCreatePayload, RealApi, ResourceUploadPayload } from './realApi'
import { useAuthStore } from '../store/authStore'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

let resourceCounter = 3
let questionCounter = 3

const getUploaderName = (uploaderId: number): string => {
  const names: Record<number, string> = {
    1: 'Alice Student',
    2: 'Bob Teacher',
  }
  return names[uploaderId] ?? `用户${uploaderId}`
}

const users: Array<UserProfile & { password: string; courseIds?: number[]; courseNames?: string[]; status?: 'ACTIVE' | 'DISABLED'; createdAt?: string }> = [
  {
    id: 1,
    username: 'student01',
    password: 'password123',
    email: 'student01@campus.edu',
    fullName: 'Alice Student',
    department: 'Computer Science',
    roles: ['STUDENT'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    courseIds: [101],
    courseNames: ['线性代数'],
  },
  {
    id: 2,
    username: 'teacher01',
    password: 'password123',
    email: 'teacher01@campus.edu',
    fullName: 'Bob Teacher',
    department: 'Mathematics',
    roles: ['TEACHER'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    username: 'admin01',
    password: 'password123',
    email: 'admin01@campus.edu',
    fullName: 'Admin User',
    department: 'Administration',
    roles: ['ADMIN'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
]

const courses: Course[] = [
  {
    id: 101,
    code: 'MATH101',
    name: '线性代数',
    description: '矩阵运算、向量空间、特征值与特征向量',
    faculty: '数学学院',
    teacherIds: [2],
    teacherNames: ['Bob Teacher'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 102,
    code: 'ENG102',
    name: '大学英语',
    description: '英语听说读写综合训练',
    faculty: '外语学院',
    teacherIds: [],
    teacherNames: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 103,
    code: 'STAT103',
    name: '概率统计',
    description: '概率论基础、统计推断',
    faculty: '数学学院',
    teacherIds: [2],
    teacherNames: ['Bob Teacher'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const teachers: Teacher[] = [
  {
    id: 2,
    username: 'teacher01',
    email: 'teacher01@campus.edu',
    fullName: 'Bob Teacher',
    department: 'Mathematics',
    title: '教授',
    bio: '数学系教授，研究方向为线性代数和概率统计',
    courseIds: [101, 103],
    courseNames: ['线性代数', '概率统计'],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const resources: Resource[] = [
  {
    id: 1,
    title: '线性代数复习提纲',
    summary: '覆盖期末考试涉及的五大题型。',
    courseId: 101,
    visibility: 'COURSE_ONLY',
    uploaderId: 1,
    downloadCount: 42,
    fileType: 'pdf',
    fileSize: 240000,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '大学英语作文模板',
    summary: '常见六类题型模版与句式。',
    courseId: 102,
    visibility: 'PUBLIC',
    uploaderId: 1,
    downloadCount: 58,
    fileType: 'docx',
    fileSize: 120000,
    createdAt: new Date().toISOString(),
  },
]

const questions: Question[] = [
  {
    id: 1,
    courseId: 101,
    title: '矩阵对角化条件',
    content: '什么情况下实矩阵可以正交对角化？',
    status: 'ANSWERED',
    answerCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    courseId: 103,
    title: '概率统计复习范围',
    content: '需要掌握哪些分布推导？',
    status: 'OPEN',
    answerCount: 0,
    createdAt: new Date().toISOString(),
  },
]

const answers: Answer[] = [
  {
    id: 1,
    questionId: 1,
    teacherId: 2,
    teacherName: 'Bob Teacher',
    content: '实矩阵可以正交对角化的充要条件是：矩阵是对称矩阵。对称矩阵一定可以正交对角化。',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    questionId: 1,
    teacherId: 2,
    teacherName: 'Bob Teacher',
    content: '具体步骤：1) 求特征值 2) 求特征向量 3) 正交化特征向量 4) 单位化',
    createdAt: new Date().toISOString(),
  },
]

// teachers 已在后面定义

const paginate = <T,>(
  items: T[],
  page = 1,
  pageSize = 10,
): { slice: T[]; total: number } => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return { slice: items.slice(start, end), total: items.length }
}

const matchesKeyword = (value: string | undefined, keyword?: string) =>
  keyword ? value?.toLowerCase().includes(keyword.toLowerCase()) : true

const mockApi: RealApi = {
  async login(payload: LoginRequest): Promise<ApiLoginResponse> {
    await delay()
    const user = users.find(
      (u) =>
        (u.username === payload.username || u.email === payload.username) &&
        u.password === payload.password,
    )
    if (!user) {
      throw new Error('用户名或密码错误')
    }
    return {
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600,
      },
      user,
    }
  },

  async register(payload: RegisterRequest): Promise<ApiLoginResponse> {
    await delay()
    const exists = users.some((u) => u.username === payload.username || u.email === payload.email)
    if (exists) {
      throw new Error('用户名或邮箱已存在')
    }
    const newUser: UserProfile & { password: string } = {
      id: users.length + 1,
      username: payload.username,
      email: payload.email,
      fullName: payload.fullName,
      department: payload.department,
      roles: ['STUDENT'],
      password: payload.password,
    }
    users.push(newUser)
    return mockApi.login({ username: payload.username, password: payload.password })
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<void> {
    await delay()
    const user = users.find((u) => u.email === payload.email)
    if (!user) {
      throw new Error('邮箱不存在')
    }
    // 模拟发送验证码（在控制台输出）
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`忘记密码验证码发送到 ${payload.email}: ${code}`)
  },

  async verifyResetToken(payload: VerifyResetTokenRequest): Promise<void> {
    await delay()
    // 模拟验证码验证（这里简单通过）
    if (payload.token !== '123456') {
      throw new Error('验证码无效')
    }
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await delay()
    const user = users.find((u) => u.email === payload.email)
    if (!user) {
      throw new Error('邮箱不存在')
    }
    if (payload.token !== '123456') {
      throw new Error('验证码无效')
    }
    user.password = payload.newPassword
  },

  async getResources(params: ResourceQueryParams = {}): Promise<PagedResourceList> {
    await delay()
    const filtered = resources.filter(
      (resource) =>
        (params.courseId ? resource.courseId === params.courseId : true) &&
        (params.keyword
          ? matchesKeyword(resource.title, params.keyword) || matchesKeyword(resource.summary, params.keyword)
          : true),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return {
      items: slice,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total,
    }
  },

  async uploadResource({ metadata }: ResourceUploadPayload): Promise<Resource> {
    await delay()
    const resource: Resource = {
      id: resourceCounter++,
      uploaderId: 1,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      fileType: 'pdf',
      fileSize: 0,
      visibility: metadata.visibility ?? 'COURSE_ONLY',
      ...metadata,
    }
    resources.unshift(resource)
    return resource
  },

  async getQuestions(params: QuestionQueryParams = {}): Promise<PagedQuestionList> {
    await delay()
    const filtered = questions.filter(
      (question) =>
        (params.courseId ? question.courseId === params.courseId : true) &&
        (params.status ? question.status === params.status : true),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return {
      items: slice,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total,
    }
  },

  async searchQuestions(params: QuestionQueryParams = {}): Promise<PagedQuestionList> {
    await delay()
    const filtered = questions.filter(
      (question) =>
        (params.courseId ? question.courseId === params.courseId : true) &&
        (params.status ? question.status === params.status : true) &&
        (params.keyword
          ? matchesKeyword(question.title, params.keyword) || matchesKeyword(question.content, params.keyword)
          : true) &&
        (params.teacherId
          ? teachers.some((t) => t.id === params.teacherId && (t.courseIds || []).includes(question.courseId))
          : true),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return {
      items: slice,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total,
    }
  },

  async createQuestion(payload: QuestionCreatePayload): Promise<Question> {
    await delay()
    const question: Question = {
      id: questionCounter++,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      answerCount: 0,
      ...payload,
    }
    questions.unshift(question)
    return question
  },

  async getNotificationCounts(): Promise<NotificationCounts> {
    await delay()
    return {
      newAnswers: questions.filter((q) => q.status === 'ANSWERED').length,
      pendingQuestions: questions.filter((q) => q.status === 'OPEN').length,
    }
  },

  async markNotificationsAsRead(): Promise<void> {
    await delay()
    // Mock implementation - do nothing
  },

  async getNotifications(): Promise<NotificationDetail[]> {
    await delay()
    const mockNotifications: NotificationDetail[] = [
      {
        id: 1,
        type: 'QUESTION_REPLIED',
        message: '您的提问收到了新的回答',
        questionId: 1,
        answerId: 1,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'NEW_QUESTION',
        message: '您有一个新的提问待处理',
        questionId: 2,
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
    return mockNotifications
  },

  async getResourceById(id: number): Promise<ResourceDetail> {
    await delay()
    const resource = resources.find((r) => r.id === id)
    if (!resource) throw new Error('资源不存在')
    return {
      ...resource,
      uploaderName: getUploaderName(resource.uploaderId),
      fileUrl: `/api/files/${id}`,
    }
  },

  async updateResource(id: number, metadata: ResourceMetadata): Promise<Resource> {
    await delay()
    const index = resources.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('资源不存在')
    resources[index] = { ...resources[index], ...metadata }
    return resources[index]
  },

  async deleteResource(id: number): Promise<void> {
    await delay()
    const index = resources.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('资源不存在')
    resources.splice(index, 1)
  },

  async getMyResources(params: ResourceQueryParams = {}): Promise<PagedResourceList> {
    await delay()
    const myResources = resources.filter((r) => r.uploaderId === 1)
    const filtered = myResources.filter(
      (resource) =>
        (params.courseId ? resource.courseId === params.courseId : true) &&
        (params.keyword
          ? matchesKeyword(resource.title, params.keyword) || matchesKeyword(resource.summary, params.keyword)
          : true),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return {
      items: slice,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total,
    }
  },

  async getQuestionById(id: number): Promise<QuestionDetail> {
    await delay()
    const question = questions.find((q) => q.id === id)
    if (!question) throw new Error('问题不存在')
    const questionAnswers = answers.filter((a) => a.questionId === id)
    return {
      ...question,
      studentId: 1,
      studentName: 'Alice Student',
      answers: questionAnswers,
    }
  },

  async updateQuestion(id: number, payload: Partial<QuestionCreate>): Promise<Question> {
    await delay()
    const index = questions.findIndex((q) => q.id === id)
    if (index === -1) throw new Error('问题不存在')
    questions[index] = { ...questions[index], ...payload }
    return questions[index]
  },

  async deleteQuestion(id: number): Promise<void> {
    await delay()
    const index = questions.findIndex((q) => q.id === id)
    if (index === -1) throw new Error('问题不存在')
    questions.splice(index, 1)
    // 同时删除相关回答
    const answerIndices = answers.map((a, i) => (a.questionId === id ? i : -1)).filter((i) => i !== -1)
    answerIndices.reverse().forEach((i) => answers.splice(i, 1))
  },

  // 管理员模块 - 课程
  async getCourses(params: CourseQueryParams = {}): Promise<PagedCourseList> {
    await delay()
    const filtered = courses.filter(
      (course) =>
        (!params.keyword ||
          course.name.toLowerCase().includes(params.keyword.toLowerCase()) ||
          course.code.toLowerCase().includes(params.keyword.toLowerCase())) &&
        (!params.faculty || course.faculty === params.faculty),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return { items: slice, page: params.page ?? 1, pageSize: params.pageSize ?? 10, total }
  },

  async createCourse(payload: CourseCreate): Promise<Course> {
    await delay()
    const course: Course = {
      id: courses.length > 0 ? Math.max(...courses.map((c) => c.id)) + 1 : 101,
      ...payload,
      teacherNames: payload.teacherIds?.map((id) => teachers.find((t) => t.id === id)?.fullName || '') || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    courses.push(course)
    return course
  },

  async updateCourse(id: number, payload: Partial<CourseCreate>): Promise<Course> {
    await delay()
    const index = courses.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('课程不存在')
    courses[index] = {
      ...courses[index],
      ...payload,
      teacherNames: payload.teacherIds?.map((tid) => teachers.find((t) => t.id === tid)?.fullName || '') || courses[index].teacherNames,
      updatedAt: new Date().toISOString(),
    }
    return courses[index]
  },

  async deleteCourse(id: number): Promise<void> {
    await delay()
    const index = courses.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('课程不存在')
    courses.splice(index, 1)
  },

  // 管理员模块 - 教师
  async getTeachers(params: TeacherQueryParams = {}): Promise<PagedTeacherList> {
    await delay()
    const filtered = teachers.filter(
      (teacher) =>
        (!params.keyword ||
          teacher.fullName.toLowerCase().includes(params.keyword.toLowerCase()) ||
          teacher.username.toLowerCase().includes(params.keyword.toLowerCase()) ||
          teacher.email.toLowerCase().includes(params.keyword.toLowerCase())) &&
        (!params.department || teacher.department === params.department),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return { items: slice, page: params.page ?? 1, pageSize: params.pageSize ?? 10, total }
  },

  async createTeacher(payload: TeacherCreate): Promise<Teacher> {
    await delay()
    const teacher: Teacher = {
      id: teachers.length > 0 ? Math.max(...teachers.map((t) => t.id)) + 1 : 2,
      ...payload,
      courseNames: payload.courseIds?.map((cid) => courses.find((c) => c.id === cid)?.name || '') || [],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    teachers.push(teacher)
    return teacher
  },

  async updateTeacher(id: number, payload: Partial<TeacherCreate>): Promise<Teacher> {
    await delay()
    const index = teachers.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('教师不存在')
    teachers[index] = {
      ...teachers[index],
      ...payload,
      courseNames: payload.courseIds?.map((cid) => courses.find((c) => c.id === cid)?.name || '') || teachers[index].courseNames,
      updatedAt: new Date().toISOString(),
    }
    return teachers[index]
  },

  async setTeacherCourses(teacherId: number, courseIds: number[]): Promise<void> {
    await delay()
    const teacher = teachers.find((t) => t.id === teacherId)
    if (!teacher) throw new Error('教师不存在')
    teacher.courseIds = courseIds
    teacher.courseNames = courseIds.map((cid) => courses.find((c) => c.id === cid)?.name || '')
    teacher.updatedAt = new Date().toISOString()
  },

  async deleteTeacher(id: number): Promise<void> {
    await delay()
    const index = teachers.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('教师不存在')
    teachers.splice(index, 1)
  },

  // 管理员模块 - 学生
  async getStudents(params: StudentQueryParams = {}): Promise<PagedStudentList> {
    await delay()
    const studentUsers = users.filter((u) => u.roles.includes('STUDENT'))
    const filtered = studentUsers.filter(
      (student) =>
        (!params.keyword ||
          student.fullName.toLowerCase().includes(params.keyword.toLowerCase()) ||
          student.username.toLowerCase().includes(params.keyword.toLowerCase()) ||
          student.email.toLowerCase().includes(params.keyword.toLowerCase())) &&
        (!params.department || student.department === params.department),
    )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    
    const items: Student[] = slice.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      department: u.department,
      status: u.status || 'ACTIVE',
      courseIds: u.courseIds || [],
      courseNames: u.courseNames || [],
      createdAt: u.createdAt || new Date().toISOString(),
    }))

    return { items, page: params.page ?? 1, pageSize: params.pageSize ?? 10, total }
  },

  async setStudentCourses(studentId: number, courseIds: number[]): Promise<void> {
    await delay()
    const student = users.find((u) => u.id === studentId)
    if (!student) throw new Error('学生不存在')
    student.courseIds = courseIds
    student.courseNames = courseIds.map((cid) => courses.find((c) => c.id === cid)?.name || '')
  },

  // 管理员模块 - 内容管理
  async getAllResources(params: ResourceQueryParams = {}): Promise<PagedResourceList> {
    return mockApi.getResources(params)
  },

  async adminDeleteResource(id: number): Promise<void> {
    return mockApi.deleteResource(id)
  },

  async adminUpdateResource(id: number, metadata: Partial<ResourceMetadata>): Promise<Resource> {
    return mockApi.updateResource(id, metadata as ResourceMetadata)
  },

  async getAllQuestions(params: QuestionQueryParams = {}): Promise<PagedQuestionList> {
    return mockApi.getQuestions(params)
  },

  async adminDeleteQuestion(id: number): Promise<void> {
    return mockApi.deleteQuestion(id)
  },

  async adminDeleteAnswer(id: number): Promise<void> {
    await delay()
    const index = answers.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('回答不存在')
    answers.splice(index, 1)
  },

  async adminUpdateQuestion(id: number, question: Partial<QuestionCreate>): Promise<Question> {
    await delay()
    const index = questions.findIndex((q) => q.id === id)
    if (index === -1) throw new Error('问题不存在')
    const updatedQuestion = { ...questions[index], ...question }
    questions[index] = updatedQuestion
    return updatedQuestion
  },

  async adminUpdateAnswer(id: number, content: string): Promise<AnswerDetail> {
    await delay()
    const index = answers.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('回答不存在')
    const updatedAnswer = { ...answers[index], content }
    answers[index] = updatedAnswer
    return updatedAnswer
  },

  // 教师模块
  async getTeacherDashboardStats(): Promise<TeacherDashboardStats> {
    await delay()
    const teacherCourses = teachers.find((t) => t.id === 2)?.courseIds || []
    const pendingQuestions = questions.filter(
      (q) => teacherCourses.includes(q.courseId) && q.status === 'OPEN',
    ).length
    return {
      pendingQuestions,
      totalResources: resources.filter((r) => r.uploaderId === 2).length,
      totalAnswers: answers.filter((a) => a.teacherId === 2).length,
    }
  },

  async getTeacherQuestions(params: QuestionQueryParams = {}): Promise<PagedTeacherQuestionList> {
    await delay()
    const teacherCourses = teachers.find((t) => t.id === 2)?.courseIds || []
    const filtered = questions
      .filter((q) => teacherCourses.includes(q.courseId))
      .filter(
        (q) =>
          (!params.status || q.status === params.status) &&
          (!params.courseId || q.courseId === params.courseId),
      )
    const { slice, total } = paginate(filtered, params.page, params.pageSize)
    return {
      items: slice.map((q) => ({
        ...q,
        studentName: 'Alice Student',
        courseName: courses.find((c) => c.id === q.courseId)?.name,
      })),
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      total,
    }
  },

  async getTeacherQuestionById(id: number): Promise<QuestionDetail> {
    return mockApi.getQuestionById(id)
  },

  async createAnswer(payload: AnswerCreate): Promise<AnswerDetail> {
    await delay()
    const answer: Answer = {
      id: answers.length > 0 ? Math.max(...answers.map((a) => a.id)) + 1 : 1,
      questionId: payload.questionId,
      teacherId: 2,
      teacherName: 'Bob Teacher',
      content: payload.content,
      createdAt: new Date().toISOString(),
    }
    answers.push(answer)
    const question = questions.find((q) => q.id === payload.questionId)
    if (question) {
      question.status = 'ANSWERED'
      question.answerCount = (question.answerCount || 0) + 1
    }
    return answer as AnswerDetail
  },

  async updateAnswer(id: number, payload: Partial<AnswerCreate>): Promise<AnswerDetail> {
    await delay()
    const index = answers.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('回答不存在')
    answers[index] = { ...answers[index], ...payload, updatedAt: new Date().toISOString() }
    return answers[index] as AnswerDetail
  },

  async deleteAnswer(id: number): Promise<void> {
    await delay()
    const index = answers.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('回答不存在')
    answers.splice(index, 1)
  },

  async uploadTeacherResource(payload: ResourceUploadPayload): Promise<Resource> {
    return mockApi.uploadResource(payload)
  },

  // 通用模块
  async getProfile(): Promise<UserProfile> {
    await delay()
    const user = useAuthStore.getState().user
    if (!user) throw new Error('未登录')
    return users.find((u) => u.id === user.id) || user
  },

  async updateProfile(payload: ProfileUpdate): Promise<UserProfile> {
    await delay()
    const user = useAuthStore.getState().user
    if (!user) throw new Error('未登录')
    const index = users.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users[index] = { ...users[index], ...payload }
    }
    return { ...user, ...payload }
  },

  async changePassword(payload: PasswordChange): Promise<void> {
    await delay()
    const user = useAuthStore.getState().user
    if (!user) throw new Error('未登录')
    const userData = users.find((u) => u.id === user.id)
    if (!userData || userData.password !== payload.oldPassword) {
      throw new Error('旧密码错误')
    }
    userData.password = payload.newPassword
  },
}

export default mockApi

