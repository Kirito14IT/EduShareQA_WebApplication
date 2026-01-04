import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiChevronLeft, FiEdit2, FiTrash2, FiDownload, FiMessageSquare, FiX, FiSave } from 'react-icons/fi'
import api from '../../api'
import { useAuthStore } from '../../store/authStore'
import { getFileUrl } from '../../utils/file'
import type { AnswerDetail, QuestionCreate } from '../../types/api'

const AdminQuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.tokens?.accessToken)

  const [isEditQuestionModalOpen, setIsEditQuestionModalOpen] = useState(false)
  const [isEditAnswerModalOpen, setIsEditAnswerModalOpen] = useState(false)
  const [editingAnswer, setEditingAnswer] = useState<AnswerDetail | null>(null)
  
  // Form states
  const [questionForm, setQuestionForm] = useState<Partial<QuestionCreate>>({
    title: '',
    content: '',
    courseId: undefined
  })
  const [answerContent, setAnswerContent] = useState('')

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['admin-question-detail', id],
    queryFn: () => api.getQuestionById(Number(id)),
    enabled: !!id,
  })

  // Fetch courses for edit dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
    enabled: isEditQuestionModalOpen
  })
  const courses = coursesData?.items ?? []

  // Mutations
  const deleteQuestionMutation = useMutation({
    mutationFn: api.adminDeleteQuestion,
    onSuccess: () => {
      toast.success('问题删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      navigate('/admin/questions')
    },
    onError: (error: Error) => toast.error(error.message || '删除失败')
  })

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, question }: { id: number; question: Partial<QuestionCreate> }) =>
      api.adminUpdateQuestion(id, question),
    onSuccess: () => {
      toast.success('问题更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-question-detail', id] })
      setIsEditQuestionModalOpen(false)
    },
    onError: (error: Error) => toast.error(error.message || '更新失败')
  })

  const deleteAnswerMutation = useMutation({
    mutationFn: api.adminDeleteAnswer,
    onSuccess: () => {
      toast.success('回答删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-question-detail', id] })
    },
    onError: (error: Error) => toast.error(error.message || '删除失败')
  })

  const updateAnswerMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      api.adminUpdateAnswer(id, content),
    onSuccess: () => {
      toast.success('回答更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-question-detail', id] })
      setIsEditAnswerModalOpen(false)
      setEditingAnswer(null)
      setAnswerContent('')
    },
    onError: (error: Error) => toast.error(error.message || '更新失败')
  })

  // Handlers
  const handleDeleteQuestion = () => {
    if (confirm('确定要删除这个问题吗？此操作不可恢复！')) {
      deleteQuestionMutation.mutate(Number(id))
    }
  }

  const handleOpenEditQuestion = () => {
    if (question) {
      setQuestionForm({
        title: question.title,
        content: question.content,
        courseId: question.courseId
      })
      setIsEditQuestionModalOpen(true)
    }
  }

  const handleDeleteAnswer = (answerId: number) => {
    if (confirm('确定要删除这个回答吗？')) {
      deleteAnswerMutation.mutate(answerId)
    }
  }

  const handleOpenEditAnswer = (answer: AnswerDetail) => {
    setEditingAnswer(answer)
    setAnswerContent(answer.content)
    setIsEditAnswerModalOpen(true)
  }

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question) {
      updateQuestionMutation.mutate({ id: question.id, question: questionForm })
    }
  }

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAnswer) {
      updateAnswerMutation.mutate({ id: editingAnswer.id, content: answerContent })
    }
  }

  if (isLoading) return <div className="placeholder">加载中...</div>
  if (error || !question) return (
    <div className="placeholder">
      <p>问题不存在或加载失败</p>
      <motion.button
        className="ghost-button"
        onClick={() => navigate('/admin/questions')}
      >
        返回列表
      </motion.button>
    </div>
  )

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>问题详情</h1>
          <p className="muted">查看并管理问题及回答</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            className="ghost-button"
            onClick={() => navigate('/admin/questions')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronLeft /> 返回列表
          </motion.button>
          <motion.button
            className="ghost-button"
            onClick={handleOpenEditQuestion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEdit2 /> 编辑问题
          </motion.button>
          <motion.button
            className="ghost-button danger"
            onClick={handleDeleteQuestion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrash2 /> 删除问题
          </motion.button>
        </div>
      </header>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="question-meta">
          <div className="meta-item">
            <strong>状态：</strong>
            <span className={`status-badge ${question.status.toLowerCase()}`}>
              {question.status === 'OPEN' ? '待回答' : question.status === 'ANSWERED' ? '已回答' : '已关闭'}
            </span>
          </div>
          <div className="meta-item">
            <strong>提问者：</strong> {question.studentName || `学生${question.studentId}`}
          </div>
          <div className="meta-item">
            <strong>时间：</strong> {new Date(question.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="question-content">
          <h3>{question.title}</h3>
          <p className="content-text">{question.content}</p>
        </div>

        {question.attachments && question.attachments.length > 0 && (
          <div className="attachments-section">
            <h3>附件</h3>
            <div className="attachments-list">
              {question.attachments.map((file) => (
                <a
                  key={file.id}
                  href={getFileUrl(file.filePath, token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-item"
                >
                  <FiDownload /> {file.filePath.split('/').pop()}
                </a>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div style={{ marginTop: '2rem' }}>
        <h2>回答列表 ({question.answers?.length || 0})</h2>
        <div className="answers-list">
          {question.answers && question.answers.length > 0 ? (
            question.answers.map((answer) => (
              <motion.div
                key={answer.id}
                className="answer-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="answer-header">
                  <span className="answer-author">{answer.teacherName || `教师${answer.teacherId}`}</span>
                  <span className="answer-time">{new Date(answer.createdAt).toLocaleString()}</span>
                </div>
                <div className="answer-content">{answer.content}</div>
                {answer.attachments && answer.attachments.length > 0 && (
                  <div className="attachments-list" style={{ marginTop: '1rem' }}>
                    {answer.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={getFileUrl(file.filePath, token)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-item"
                      >
                        <FiDownload /> {file.filePath.split('/').pop()}
                      </a>
                    ))}
                  </div>
                )}
                <div className="action-buttons" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
                  <motion.button
                    className="ghost-button small"
                    onClick={() => handleOpenEditAnswer(answer)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiEdit2 /> 编辑
                  </motion.button>
                  <motion.button
                    className="ghost-button small danger"
                    onClick={() => handleDeleteAnswer(answer.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiTrash2 /> 删除
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="placeholder">暂无回答</div>
          )}
        </div>
      </div>

      {/* Edit Question Modal */}
      <AnimatePresence>
        {isEditQuestionModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditQuestionModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>编辑问题</h3>
                <motion.button
                  className="ghost-button"
                  onClick={() => setIsEditQuestionModalOpen(false)}
                >
                  <FiX />
                </motion.button>
              </div>
              <form onSubmit={handleQuestionSubmit} className="form-grid">
                <label>
                  标题
                  <input
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  内容
                  <textarea
                    value={questionForm.content}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={5}
                  />
                </label>
                <label>
                  课程
                  <select
                    value={questionForm.courseId || ''}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, courseId: Number(e.target.value) }))}
                    required
                  >
                    <option value="">请选择课程</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsEditQuestionModalOpen(false)}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="primary-button"
                    disabled={updateQuestionMutation.isPending}
                  >
                    {updateQuestionMutation.isPending ? '保存中...' : '保存'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Answer Modal */}
      <AnimatePresence>
        {isEditAnswerModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditAnswerModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>编辑回答</h3>
                <motion.button
                  className="ghost-button"
                  onClick={() => setIsEditAnswerModalOpen(false)}
                >
                  <FiX />
                </motion.button>
              </div>
              <form onSubmit={handleAnswerSubmit} className="form-grid">
                <label>
                  回答内容
                  <textarea
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    rows={6}
                    required
                  />
                </label>
                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsEditAnswerModalOpen(false)}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="primary-button"
                    disabled={updateAnswerMutation.isPending}
                  >
                    {updateAnswerMutation.isPending ? '保存中...' : '保存'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default AdminQuestionDetailPage
