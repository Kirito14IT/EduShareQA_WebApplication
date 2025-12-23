import type { FormEvent } from 'react'
import { useRef, useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../api'
import type { PagedCourseList } from '../types/api'

const QuestionCreatePage = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  
  const courses = coursesData?.items ?? []

  const [form, setForm] = useState({
    courseId: 0,
    title: '',
    content: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])

  // Set default course ID when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && form.courseId === 0) {
      setForm(prev => ({ ...prev, courseId: courses[0].id }))
    }
  }, [courses, form.courseId])

  const { mutateAsync, isPending, error, isSuccess } = useMutation({
    mutationFn: api.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      setForm({ courseId: courses[0]?.id ?? 0, title: '', content: '' })
      setAttachments([])
      // 清空文件选择器
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync({
      courseId: form.courseId,
      title: form.title,
      content: form.content,
      attachments,
    })
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>我要提问</h1>
          <p className="muted">补充图片或截图有助于老师快速定位问题。</p>
        </div>
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
        <label>
          图片/附件
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files ?? []))}
            accept="image/*"
          />
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="muted small"
            >
              已选择 {attachments.length} 个附件
            </motion.div>
          )}
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
            提交成功，等待老师回答
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isPending ? '提交中…' : '提交问题'}
        </motion.button>
      </form>
    </section>
  )
}

export default QuestionCreatePage

