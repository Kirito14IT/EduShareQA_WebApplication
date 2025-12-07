import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../api'

const NotificationBadge = () => {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => api.getNotificationCounts(),
    staleTime: 30 * 1000,
  })

  const newAnswersCount = data?.newAnswers ?? 0

  return (
    <motion.button
      className="ghost-button"
      onClick={() => navigate('/notifications')}
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
            key={newAnswersCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          >
            您有 {newAnswersCount} 条新回答
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export default NotificationBadge

