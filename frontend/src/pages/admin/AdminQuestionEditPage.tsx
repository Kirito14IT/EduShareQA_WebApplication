import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiChevronLeft, FiSave } from 'react-icons/fi'
import api from '../../api'
import type { QuestionCreate } from '../../types/api'

const AdminQuestionEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<File[]>([])
  const [form, setForm] = useState<Partial<QuestionCreate>>({
    title: '',
    content: '',
    courseId: undefined
  })

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  // Fetch question data
  const { data: question, isLoading } = useQuery({
    queryKey: ['admin-question-detail', id],
    queryFn: () => api.getQuestionById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (question) {
      setForm({
        title: question.title,
        content: question.content || '',
        courseId: question.courseId
      })
    }
  }, [question])

  const updateMutation = useMutation({
    mutationFn: ({ id, question, attachments }: { id: number; question: Partial<QuestionCreate>; attachments?: File[] }) =>
      api.adminUpdateQuestion(id, question, attachments),
    onSuccess: () => {
      toast.success('问题更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-question-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      navigate(`/admin/questions/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      await updateMutation.mutateAsync({
        id: Number(id),
        question: form,
        attachments: attachments.length > 0 ? attachments : undefined
      })
    } catch (error) {
      console.error('Submit error:', error)
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
      <header className="page-header">
        <div>
          <h1>编辑问题</h1>
          <p className="muted">修改问题的基本信息</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate(`/admin/questions/${id}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiChevronLeft /> 取消
        </motion.button>
      </header>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            标题 <span className="required">*</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>

          <label>
            所属课程 <span className="required">*</span>
            <select
              value={form.courseId || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, courseId: Number(e.target.value) }))}
              required
            >
              <option value="">请选择课程</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </label>

          <label>
            更新附件 (可选，上传新文件将替换旧文件)
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
            />
            {question?.attachments && question.attachments.length > 0 && (
              <div className="muted text-sm" style={{ marginTop: '0.5rem' }}>
                当前附件:
                <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {question.attachments.map(file => (
                    <li key={file.id}>{file.filePath.split('/').pop()}</li>
                  ))}
                </ul>
              </div>
            )}
          </label>

          <label className="full-width">
            内容
            <textarea
              value={form.content || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              rows={8}
            />
          </label>

          <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
            <motion.button
              type="submit"
              className="primary-button"
              disabled={updateMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSave /> {updateMutation.isPending ? '保存中...' : '保存更改'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}

export default AdminQuestionEditPage
