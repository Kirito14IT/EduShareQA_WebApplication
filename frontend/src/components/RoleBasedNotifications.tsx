import { useAuthStore } from '../store/authStore'
import NotificationsPage from '../pages/NotificationsPage'
import TeacherNotificationsPage from '../pages/teacher/TeacherNotificationsPage'

const RoleBasedNotifications = () => {
  const user = useAuthStore((state) => state.user)

  // 如果用户是教师，显示教师通知页面
  if (user?.roles?.includes('TEACHER')) {
    return <TeacherNotificationsPage />
  }

  // 否则显示学生通知页面
  return <NotificationsPage />
}

export default RoleBasedNotifications
