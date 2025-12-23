import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import type { QuestionCreate, PagedCourseList } from '../types/api'

const QuestionEditPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const [form, setForm] = useState<QuestionCreate>({
    courseId: 0,
    title: '',
    content: '',
  })

  // Set default course ID when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && form.courseId === 0) {
      setForm(prev => ({ ...prev, courseId: courses[0].id }))
    }
  }, [courses, form.courseId])

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => api.getQuestionById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (question) {
      setForm({
        courseId: question.courseId,
        title: question.title,
        content: question.content,
      })
    }
  }, [question])

  const { mutateAsync, isPending, error, isSuccess } = useMutation({
    mutationFn: (payload: Partial<QuestionCreate>) => api.updateQuestion(Number(id!), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question', id] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      queryClient.invalidateQueries({ queryKey: ['my-questions'] })
      setTimeout(() => navigate(`/questions/${id}`), 1000)
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync(form)
  }

  if (isLoading) {
    return <div className="placeholder">加载问题信息…</div>
  }

  if (!question || (question as { status?: string }).status !== 'OPEN') {
    return (
      <div className="placeholder">
        <p>问题不存在或已被回答，无法编辑</p>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/profile')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回个人中心
        </motion.button>
      </div>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>编辑提问</h1>
          <p className="muted">修改问题内容</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate(`/questions/${id}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          取消
        </motion.button>
      </header>

      <form className="form-grid card" onSubmit={handleSubmit}>
        <label>
          课程
          <select
            value={form.courseId}
            onChange={(e) => setForm((prev) => ({ ...prev, courseId: Number(e.target.value) }))}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          标题
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </label>
        <label>
          问题描述
          <textarea
            rows={5}
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            required
          />
        </label>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-box"
          >
            {(error as Error).message}
          </motion.div>
        )}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="success-box"
          >
            更新成功，正在跳转…
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isPending ? '保存中…' : '保存修改'}
        </motion.button>
      </form>
    </section>
  )
}

export default QuestionEditPage

