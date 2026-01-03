import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../../api'
import type { PagedTeacherQuestionList } from '../../types/api'

const TeacherNotificationsPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['teacher', 'dashboard', 'stats'],
    queryFn: () => api.getTeacherDashboardStats(),
  })

  const { data: questions, isLoading: questionsLoading } = useQuery<PagedTeacherQuestionList>({
    queryKey: ['teacher', 'questions'],
    queryFn: () => api.getTeacherQuestions({ page: 1, pageSize: 10 }),
  })

  const pendingQuestions = questions?.items.filter(q => q.status === 'OPEN') ?? []

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>教师通知中心</h1>
          <p className="muted">查看未回答问题和系统通知。</p>
        </div>
      </header>

      {(statsLoading || questionsLoading) ? (
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
              <h2>未回答问题</h2>
              <motion.p
                className="notification-number"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {stats?.pendingQuestions ?? 0}
              </motion.p>
              <p className="muted">您所授课程的待回答问题数量。</p>
              <Link to="/teacher/questions" className="button small">
                查看问题
              </Link>
            </motion.div>

            <motion.div
              className="card clickable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.1)', cursor: 'pointer' }}
              onClick={() => window.location.href = '/teacher/resources'}
            >
              <h2>我的资源</h2>
              <motion.p
                className="notification-number"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {stats?.totalResources ?? 0}
              </motion.p>
              <p className="muted">我上传的学习资源数量。</p>
              <div className="card-footer">
                <span className="link-text">点击查看详情</span>
              </div>
            </motion.div>
          </div>

          {/* 最近未回答问题列表 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2>最近未回答问题</h2>
            {pendingQuestions.length > 0 ? (
              <div className="notification-list">
                {pendingQuestions.slice(0, 5).map((question, index) => (
                  <motion.div
                    key={question.id}
                    className="notification-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{question.title}</p>
                      <p className="notification-time">
                        {question.courseName} • {new Date(question.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="notification-actions">
                      <Link
                        to={`/teacher/questions/${question.id}`}
                        className="button small"
                      >
                        去回答
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="muted">暂无未回答问题</p>
            )}
          </motion.div>
        </>
      )}
    </section>
  )
}

export default TeacherNotificationsPage
