import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../api'
import type { NotificationCounts } from '../types/api'

const NotificationsPage = () => {
  const { data, isLoading, refetch } = useQuery<NotificationCounts>({
    queryKey: ['notifications', 'counts'],
    queryFn: () => api.getNotificationCounts(),
  })

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>通知中心</h1>
          <p className="muted">新回答提醒、待处理问题一目了然。</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => refetch()}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          刷新
        </motion.button>
      </header>

      {isLoading ? (
        <div className="placeholder">加载通知数据…</div>
      ) : (
        <div className="grid two-columns">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.1)' }}
          >
            <h2>老师新回答</h2>
            <motion.p
              className="notification-number"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {data?.newAnswers ?? 0}
            </motion.p>
            <p className="muted">提醒学生查看老师回复。</p>
          </motion.div>
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.1)' }}
          >
            <h2>待处理提问</h2>
            <motion.p
              className="notification-number"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {data?.pendingQuestions ?? 0}
            </motion.p>
            <p className="muted">仍在等待老师回答的问题数量。</p>
          </motion.div>
        </div>
      )}
    </section>
  )
}

export default NotificationsPage

