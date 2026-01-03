import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../api'
import type { NotificationCounts, NotificationDetail } from '../types/api'

const NotificationsPage = () => {
  const { data: counts, isLoading: countsLoading, refetch: refetchCounts } = useQuery<NotificationCounts>({
    queryKey: ['notifications', 'counts'],
    queryFn: () => api.getNotificationCounts(),
  })

  const { data: notifications, isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery<NotificationDetail[]>({
    queryKey: ['notifications', 'list'],
    queryFn: () => api.getNotifications(),
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
          onClick={() => {
            refetchCounts()
            refetchNotifications()
          }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          刷新
        </motion.button>
      </header>

      {(countsLoading || notificationsLoading) ? (
        <div className="placeholder">加载通知数据…</div>
      ) : (
        <>
          {/* 统计信息 */}
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
                {counts?.newAnswers ?? 0}
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
                {counts?.pendingQuestions ?? 0}
              </motion.p>
              <p className="muted">仍在等待老师回答的问题数量。</p>
            </motion.div>
          </div>

          {/* 通知列表 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2>通知详情</h2>
            {notifications && notifications.length > 0 ? (
              <div className="notification-list">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">
                        {new Date(notification.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="notification-actions">
                      {notification.type === 'QUESTION_REPLIED' && notification.questionId && (
                        <Link
                          to={`/questions/${notification.questionId}`}
                          className="button small"
                        >
                          查看回答
                        </Link>
                      )}
                      {notification.type === 'NEW_QUESTION' && notification.questionId && (
                        <Link
                          to={`/teacher/questions/${notification.questionId}`}
                          className="button small"
                        >
                          查看提问
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="muted">暂无通知</p>
            )}
          </motion.div>
        </>
      )}
    </section>
  )
}

export default NotificationsPage

