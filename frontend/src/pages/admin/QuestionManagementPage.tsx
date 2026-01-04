import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiTrash2, FiEdit2, FiX, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronRight as FiChevronRightIcon } from 'react-icons/fi'
import api from '../../api'
import type { QuestionQueryParams, Question, QuestionCreate, AnswerDetail, QuestionDetail } from '../../types/api'

const QuestionManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<QuestionQueryParams>({ page: 1, pageSize: 10 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [editingAnswer, setEditingAnswer] = useState<AnswerDetail | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
  const [form, setForm] = useState<Partial<QuestionCreate>>({
    title: '',
    content: '',
    courseId: undefined
  })
  const [answerContent, setAnswerContent] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', filters],
    queryFn: () => api.getAllQuestions(filters),
  })

  // Get details for expanded questions
  const expandedQuestionIds = Array.from(expandedQuestions)
  const questionDetailsQueries = useQuery({
    queryKey: ['admin-question-details', expandedQuestionIds],
    queryFn: () => Promise.all(expandedQuestionIds.map(id => api.getQuestionById(id))),
    enabled: expandedQuestionIds.length > 0,
  })

  // Fetch courses for name lookup
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name ?? `课程${id}`
  }

  const deleteQuestionMutation = useMutation({
    mutationFn: api.adminDeleteQuestion,
    onSuccess: () => {
      toast.success('问题删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    },
  })

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, question }: { id: number; question: Partial<QuestionCreate> }) =>
      api.adminUpdateQuestion(id, question),
    onSuccess: () => {
      toast.success('问题更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      setIsModalOpen(false)
      setEditingQuestion(null)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const updateAnswerMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      api.adminUpdateAnswer(id, content),
    onSuccess: () => {
      toast.success('回答更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      setIsModalOpen(false)
      setEditingAnswer(null)
      setAnswerContent('')
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const resetForm = () => {
    setForm({ title: '', content: '', courseId: undefined })
  }

  const toggleQuestionExpansion = (questionId: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const getQuestionDetail = (questionId: number): QuestionDetail | undefined => {
    if (!questionDetailsQueries.data) return undefined
    const index = expandedQuestionIds.indexOf(questionId)
    return index >= 0 ? questionDetailsQueries.data[index] : undefined
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个问题吗？此操作不可恢复！')) {
      deleteQuestionMutation.mutate(id)
    }
  }

  const handleOpenEditQuestion = (question: Question) => {
    setEditingQuestion(question)
    setEditingAnswer(null)
    setForm({
      title: question.title,
      content: question.content || '',
      courseId: question.courseId
    })
    setIsModalOpen(true)
  }

  const handleOpenEditAnswer = (answer: AnswerDetail) => {
    setEditingAnswer(answer)
    setEditingQuestion(null)
    setAnswerContent(answer.content)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingQuestion) {
      try {
        await updateQuestionMutation.mutateAsync({
          id: editingQuestion.id,
          question: form
        })
      } catch (error) {
        console.error('Submit error:', error)
      }
    } else if (editingAnswer) {
      try {
        await updateAnswerMutation.mutateAsync({
          id: editingAnswer.id,
          content: answerContent
        })
      } catch (error) {
        console.error('Submit error:', error)
      }
    }
  }

  return (
    <section>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1>问答内容管理</h1>
          <p className="muted">删除、修改任意学生提问和教师回答，管控错误或违规内容</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="placeholder">加载中…</div>
      ) : (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>课程</th>
                <th>状态</th>
                <th>回答数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data?.items.map((question, index) => {
                  const isExpanded = expandedQuestions.has(question.id)

                  return (
                    <motion.tr
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <motion.button
                            className="ghost-button small"
                            onClick={() => toggleQuestionExpansion(question.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ padding: '4px', minWidth: 'auto' }}
                          >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRightIcon />}
                          </motion.button>
                          {question.title}
                        </div>
                      </td>
                      <td>{getCourseName(question.courseId)}</td>
                      <td>
                        {question.status === 'OPEN'
                          ? '待回答'
                          : question.status === 'ANSWERED'
                            ? '已回答'
                            : '已关闭'}
                      </td>
                      <td>{question.answerCount}</td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="ghost-button small"
                            onClick={() => handleOpenEditQuestion(question)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiEdit2 /> 编辑问题
                          </motion.button>
                          <motion.button
                            className="ghost-button small danger"
                            onClick={() => handleDelete(question.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiTrash2 /> 删除
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>

              {/* Expanded answer rows */}
              <AnimatePresence>
                {data?.items.map((question) => {
                  const isExpanded = expandedQuestions.has(question.id)
                  const questionDetail = getQuestionDetail(question.id)
                  const isLoadingDetails = questionDetailsQueries.isLoading && expandedQuestionIds.includes(question.id)

                  if (!isExpanded) return null

                  // Show loading state while fetching details
                  if (isLoadingDetails) {
                    return (
                      <motion.tr
                        key={`loading-${question.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      >
                        <td colSpan={5} style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div>加载回答中...</div>
                        </td>
                      </motion.tr>
                    )
                  }

                  if (!questionDetail || !questionDetail.answers || questionDetail.answers.length === 0) {
                    return (
                      <motion.tr
                        key={`no-answers-${question.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      >
                        <td colSpan={5} style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div>暂无回答</div>
                        </td>
                      </motion.tr>
                    )
                  }

                  return questionDetail.answers.map((answer) => (
                    <motion.tr
                      key={`answer-${answer.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                      <td colSpan={5} style={{ padding: '12px 20px' }}>
                        <div style={{ borderLeft: '3px solid #007bff', paddingLeft: '12px' }}>
                          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                            <strong>教师回答 ({answer.teacherName || `教师${answer.teacherId}`}) - {new Date(answer.createdAt).toLocaleString()}</strong>
                          </div>
                          <div style={{ marginBottom: '8px', lineHeight: '1.5' }}>
                            {answer.content}
                          </div>
                          <motion.button
                            className="ghost-button small"
                            onClick={() => handleOpenEditAnswer(answer)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEdit2 /> 编辑回答
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {data && data.items.length === 0 && <div className="placeholder">暂无问题</div>}
        </motion.div>
      )}

      {/* 分页组件 */}
      {data && data.total > 0 && (
        <motion.div
          className="pagination"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.button
            className="ghost-button"
            disabled={filters.page === 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronLeft /> 上一页
          </motion.button>
          <span className="pagination-info">
            第 {data.page} 页，共 {Math.ceil(data.total / data.pageSize)} 页（共 {data.total} 条）
          </span>
          <motion.button
            className="ghost-button"
            disabled={data.page >= Math.ceil(data.total / data.pageSize)}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            下一页 <FiChevronRight />
          </motion.button>
        </motion.div>
      )}

      {/* 编辑模态框 */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingQuestion ? '修改问题' : '修改回答'}</h3>
                <motion.button
                  className="modal-close"
                  onClick={() => setIsModalOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit}>
                {editingQuestion && (
                  <>
                    <div className="form-group">
                      <label>
                        标题
                        <input
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        内容
                        <textarea
                          value={form.content || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                          rows={4}
                        />
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        所属课程
                        <select
                          value={form.courseId || ''}
                          onChange={(e) => setForm((prev) => ({ ...prev, courseId: Number(e.target.value) }))}
                          required
                        >
                          <option value="">请选择课程</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </>
                )}

                {editingAnswer && (
                  <div className="form-group">
                    <label>
                      回答内容
                      <textarea
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        rows={6}
                        required
                      />
                    </label>
                  </div>
                )}

                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsModalOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="primary-button"
                    disabled={updateQuestionMutation.isPending || updateAnswerMutation.isPending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {(updateQuestionMutation.isPending || updateAnswerMutation.isPending) ? '保存中...' : '保存'}
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

export default QuestionManagementPage

