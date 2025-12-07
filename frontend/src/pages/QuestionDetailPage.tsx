import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'

const courses = [
  { id: 101, name: '线性代数' },
  { id: 102, name: '大学英语' },
  { id: 103, name: '概率统计' },
]

const QuestionDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', id],
    queryFn: () => api.getQuestionById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="placeholder">加载问题详情…</div>
  }

  if (error || !question) {
    return (
      <div className="placeholder">
        <p>问题不存在或加载失败</p>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/questions')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回提问列表
        </motion.button>
      </div>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>{question.title}</h1>
          <p className="muted">问题详情与回答</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/questions')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回列表
        </motion.button>
      </header>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="detail-section">
          <div className="question-meta">
            <span className="meta-item">
              课程：{courses.find((c) => c.id === question.courseId)?.name ?? question.courseId}
            </span>
            <span className="meta-item">
              状态：
              {question.status === 'OPEN'
                ? '待回答'
                : question.status === 'ANSWERED'
                  ? '已回答'
                  : '已关闭'}
            </span>
            <span className="meta-item">提问时间：{new Date(question.createdAt).toLocaleString()}</span>
            {question.studentName && <span className="meta-item">提问者：{question.studentName}</span>}
          </div>

          <div className="question-content">
            <h3>问题描述</h3>
            <p className="content-text">{question.content}</p>
          </div>

          {question.attachments && question.attachments.length > 0 && (
            <div className="attachments-section">
              <h3>附件</h3>
              <div className="attachments-list">
                {question.attachments.map((att) => (
                  <motion.a
                    key={att.id}
                    href={att.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachment-item"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    📎 {att.fileType}
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {question.answers && question.answers.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2>老师回答 ({question.answers.length})</h2>
          <div className="answers-list">
            {question.answers.map((answer, index) => (
              <motion.div
                key={answer.id}
                className="answer-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="answer-header">
                  <span className="answer-author">{answer.teacherName ?? `教师${answer.teacherId}`}</span>
                  <span className="answer-time">{new Date(answer.createdAt).toLocaleString()}</span>
                </div>
                <div className="answer-content">{answer.content}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {(!question.answers || question.answers.length === 0) && question.status === 'OPEN' && (
        <div className="card">
          <p className="muted">暂无回答，等待老师回复…</p>
        </div>
      )}
    </section>
  )
}

export default QuestionDetailPage

