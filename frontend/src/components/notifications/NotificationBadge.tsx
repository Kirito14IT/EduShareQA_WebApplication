import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import api from '../../api'

const NotificationBadge = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => api.getNotificationCounts(),
    staleTime: 30 * 1000,
  })

  // 根据用户角色显示不同的通知内容
  const isTeacher = user?.roles?.includes('TEACHER')
  const notificationCount = isTeacher ? (data?.pendingQuestions ?? 0) : (data?.newAnswers ?? 0)
  const notificationText = isTeacher ? `未回答问题` : `新回答`

  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: () => api.markNotificationsAsRead(),
    onSuccess: () => {
      // 清除通知计数缓存
      queryClient.invalidateQueries({ queryKey: ['notifications', 'counts'] })
    },
  })

  const handleClick = async () => {
    // 如果有未读通知，先标记为已读
    if (notificationCount > 0) {
      await markAsRead()
    }
    // 然后跳转到通知页面
    navigate('/notifications')
  }

  return (
    <motion.button
      className="ghost-button"
      onClick={handleClick}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            加载中…
          </motion.span>
        ) : (
          <motion.span
            key={notificationCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            您有 {notificationCount} 条{notificationText}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default NotificationBadge

