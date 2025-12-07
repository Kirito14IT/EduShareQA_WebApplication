import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../api'

const courses = [
  { id: 101, name: '线性代数' },
  { id: 102, name: '大学英语' },
  { id: 103, name: '概率统计' },
]

const ResourceUploadPage = () => {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    courseId: 101,
    visibility: 'COURSE_ONLY',
  })

  const { mutateAsync, isPending, error, isSuccess } = useMutation({
    mutationFn: api.uploadResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      setForm({
        title: '',
        summary: '',
        courseId: 101,
        visibility: 'COURSE_ONLY',
      })
      setFile(null)
      // 清空文件选择器
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync({
      metadata: {
        title: form.title,
        summary: form.summary,
        courseId: Number(form.courseId),
        visibility: form.visibility as 'PUBLIC' | 'COURSE_ONLY',
      },
      file,
    })
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>上传学习资源</h1>
          <p className="muted">支持单文件上传，填写标题、简介与所属课程。</p>
        </div>
      </header>

      <form className="form-grid card" onSubmit={handleSubmit}>
        <label>
          标题
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </label>
        <label>
          简介
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
          />
        </label>
        <label>
          所属课程
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
          可见范围
          <select
            value={form.visibility}
            onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}
          >
            <option value="COURSE_ONLY">课程内可见</option>
            <option value="PUBLIC">全校可见</option>
          </select>
        </label>
        <label>
          附件
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
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
            上传成功
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isPending ? '上传中…' : '提交'}
        </motion.button>
      </form>
    </section>
  )
}

export default ResourceUploadPage

