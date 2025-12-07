import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResourceListPage from './pages/ResourceListPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
import ResourceUploadPage from './pages/ResourceUploadPage'
import ResourceEditPage from './pages/ResourceEditPage'
import QuestionListPage from './pages/QuestionListPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import QuestionEditPage from './pages/QuestionEditPage'
import QuestionSearchPage from './pages/QuestionSearchPage'
import QuestionCreatePage from './pages/QuestionCreatePage'
import NotificationsPage from './pages/NotificationsPage'
import StudentProfilePage from './pages/StudentProfilePage'
import ProfilePage from './pages/ProfilePage'
// 管理员模块
import CourseManagementPage from './pages/admin/CourseManagementPage'
import TeacherManagementPage from './pages/admin/TeacherManagementPage'
import ResourceManagementPage from './pages/admin/ResourceManagementPage'
import QuestionManagementPage from './pages/admin/QuestionManagementPage'
// 教师模块
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage'
import TeacherQuestionsPage from './pages/teacher/TeacherQuestionsPage'
import TeacherAnswerPage from './pages/teacher/TeacherAnswerPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/resources" replace />} />
          {/* 学生模块 */}
          <Route path="/resources" element={<ResourceListPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/resources/:id/edit" element={<ResourceEditPage />} />
          <Route path="/resources/upload" element={<ResourceUploadPage />} />
          <Route path="/questions" element={<QuestionListPage />} />
          <Route path="/questions/search" element={<QuestionSearchPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
          <Route path="/questions/:id/edit" element={<QuestionEditPage />} />
          <Route path="/questions/new" element={<QuestionCreatePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<StudentProfilePage />} />
          {/* 管理员模块 */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin/courses" element={<CourseManagementPage />} />
            <Route path="/admin/teachers" element={<TeacherManagementPage />} />
            <Route path="/admin/resources" element={<ResourceManagementPage />} />
            <Route path="/admin/questions" element={<QuestionManagementPage />} />
          </Route>
          {/* 教师模块 */}
          <Route element={<ProtectedRoute requiredRole={['TEACHER', 'ADMIN']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
            <Route path="/teacher/questions/:id" element={<TeacherAnswerPage />} />
          </Route>
          {/* 通用模块 */}
          <Route path="/settings" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/resources" replace />} />
    </Routes>
  )
}

export default App
