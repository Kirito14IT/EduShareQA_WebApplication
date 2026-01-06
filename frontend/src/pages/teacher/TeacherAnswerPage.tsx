import type { FormEvent } from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiSend, FiX, FiEdit2, FiTrash2, FiCheck, FiX as FiXCancel } from 'react-icons/fi'
import api from '../../api'
import type { AnswerCreate } from '../../types/api'

const TeacherAnswerPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [answerContent, setAnswerContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')

  const { data: question, isLoading } = useQuery({
    queryKey: ['teacher-question', id],
    queryFn: () => api.getTeacherQuestionById(Number(id)),
    enabled: !!id,
  })

  const createAnswerMutation = useMutation({
    mutationFn: (payload: AnswerCreate) => api.createAnswer(payload),
    onSuccess: () => {
      toast.success('回答提交成功！', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['teacher-question', id] })
      queryClient.invalidateQueries({ queryKey: ['teacher-questions'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard-stats'] })
      setAnswerContent('')
      setAttachments([])
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    },
    onError: (error: Error) => {
      toast.error(error.message || '提交失败')
    },
  })

  const updateAnswerMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      api.updateAnswer(id, { content }),
    onSuccess: () => {
      toast.success('回答修改成功！', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['teacher-question', id] })
      setEditingAnswerId(null)
      setEditingContent('')
    },
    onError: (error: Error) => {
      toast.error(error.message || '修改失败')
    },
  })

  const deleteAnswerMutation = useMutation({
    mutationFn: (answerId: number) => api.deleteAnswer(answerId),
    onSuccess: () => {
      toast.success('回答删除成功！', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['teacher-question', id] })
      queryClient.invalidateQueries({ queryKey: ['teacher-questions'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard-stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id || !answerContent.trim()) {
      toast.error('请输入回答内容')
      return
    }
    createAnswerMutation.mutate({
      questionId: Number(id),
      content: answerContent,
      attachments,
    })
  }

  const handleEditAnswer = (answerId: number, currentContent: string) => {
    setEditingAnswerId(answerId)
    setEditingContent(currentContent)
  }

  const handleSaveEdit = () => {
    if (!editingAnswerId || !editingContent.trim()) {
      toast.error('请输入回答内容')
      return
    }
    updateAnswerMutation.mutate({
      id: editingAnswerId,
      content: editingContent,
    })
  }

  const handleCancelEdit = () => {
    setEditingAnswerId(null)
    setEditingContent('')
  }

  const handleDeleteAnswer = (answerId: number) => {
    if (window.confirm('确定要删除这个回答吗？此操作不可撤销。')) {
      deleteAnswerMutation.mutate(answerId)
    }
  }

  if (isLoading) {
    return <div className="placeholder">加载中…</div>
  }

  if (!question) {
    return <div className="placeholder">问题不存在</div>
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
          <h1>回答问题</h1>
          <p className="muted">{question.title}</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/teacher/questions')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiX /> 返回
        </motion.button>
      </motion.div>

      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="question-content">
          <h3>问题描述</h3>
          <p>{question.content}</p>
        </div>

        {question.answers && question.answers.length > 0 && (
          <div className="answers-list">
            <h3>已有回答</h3>
            {question.answers.map((answer) => (
              <div key={answer.id} className="answer-item">
                <div className="answer-header">
                  <span className="answer-author">{answer.teacherName ?? '教师'}</span>
                  <span className="answer-time">{new Date(answer.createdAt).toLocaleString()}</span>
                  <div className="answer-actions">
                    {editingAnswerId === answer.id ? (
                      <>
                        <motion.button
                          className="action-button save"
                          onClick={handleSaveEdit}
                          disabled={updateAnswerMutation.isPending}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiCheck /> {updateAnswerMutation.isPending ? '保存中…' : '保存'}
                        </motion.button>
                        <motion.button
                          className="action-button cancel"
                          onClick={handleCancelEdit}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiXCancel /> 取消
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          className="action-button edit"
                          onClick={() => handleEditAnswer(answer.id, answer.content)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiEdit2 /> 编辑
                        </motion.button>
                        <motion.button
                          className="action-button delete"
                          onClick={() => handleDeleteAnswer(answer.id)}
                          disabled={deleteAnswerMutation.isPending}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 /> {deleteAnswerMutation.isPending ? '删除中…' : '删除'}
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
                {editingAnswerId === answer.id ? (
                  <textarea
                    className="edit-answer-textarea"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={4}
                    placeholder="请输入回答内容..."
                  />
                ) : (
                  <div className="answer-content">{answer.content}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="answer-form">
          <label>
            回答内容 <span className="required">*</span>
            <textarea
              rows={6}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="请输入您的回答..."
              required
            />
          </label>
          <label>
            附件（可选）
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
            />
          </label>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-box"
              style={{ marginBottom: '1rem' }}
            >
              回答已成功提交！
            </motion.div>
          )}
          <motion.button
            type="submit"
            className="primary-button"
            disabled={createAnswerMutation.isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiSend /> {createAnswerMutation.isPending ? '提交中…' : '提交回答'}
          </motion.button>
        </form>
      </motion.div>
    </section>
  )
}

export default TeacherAnswerPage

