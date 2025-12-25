import type { FormEvent } from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FiSend, FiX } from 'react-icons/fi'
import api from '../../api'
import type { AnswerCreate } from '../../types/api'

const TeacherAnswerPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const [answerContent, setAnswerContent] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSuccess, setIsSuccess] = useState(false)

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
                </div>
                <div className="answer-content">{answer.content}</div>
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

