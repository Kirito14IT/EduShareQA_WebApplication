import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiFileText, FiCheckCircle, FiClock } from 'react-icons/fi'
import api from '../../api'

const TeacherDashboardPage = () => {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacher-dashboard-stats'],
    queryFn: () => api.getTeacherDashboardStats(),
  })

  const statCards = [
    {
      title: '待回答问题',
      value: stats?.pendingQuestions ?? 0,
      icon: FiClock,
      color: '#f59e0b',
      onClick: () => navigate('/teacher/questions?status=OPEN'),
    },
    {
      title: '已发布资源',
      value: stats?.totalResources ?? 0,
      icon: FiFileText,
      color: '#3b82f6',
      onClick: () => navigate('/teacher/resources'),
    },
    {
      title: '已回答问题',
      value: stats?.totalAnswers ?? 0,
      icon: FiCheckCircle,
      color: '#10b981',
      onClick: () => navigate('/teacher/questions?status=ANSWERED'),
    },
  ]

  return (
    <section>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1>教师工作台</h1>
          <p className="muted">您所上课程有 {stats?.pendingQuestions ?? 0} 条未回答问题</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="placeholder">加载中…</div>
      ) : (
        <div className="stats-grid">
          {statCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.title}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={card.onClick}
              >
                <div className="stat-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                  <Icon size={32} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-title">{card.title}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default TeacherDashboardPage

