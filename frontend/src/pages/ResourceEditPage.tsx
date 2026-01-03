import type { FormEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import type { ResourceMetadata, PagedCourseList } from '../types/api'

const ResourceEditPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const [form, setForm] = useState<ResourceMetadata>({
    title: '',
    summary: '',
    courseId: 0,
    visibility: 'COURSE_ONLY',
  })

  // Set default course ID when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && form.courseId === 0) {
      setForm(prev => ({ ...prev, courseId: courses[0].id }))
    }
  }, [courses, form.courseId])

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => api.getResourceById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (resource) {
      setForm({
        title: resource.title,
        summary: resource.summary ?? '',
        courseId: resource.courseId,
        visibility: resource.visibility ?? 'COURSE_ONLY',
      })
    }
  }, [resource])

  const { mutateAsync, isPending, error, isSuccess } = useMutation({
    mutationFn: (data: { metadata: ResourceMetadata; file: File | null }) => 
      api.updateResource(Number(id!), data.metadata, data.file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['my-resources'] })
      setTimeout(() => navigate(`/resources/${id}`), 1000)
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync({ metadata: form, file })
  }

  if (isLoading) {
    return <div className="placeholder">加载资源信息…</div>
  }

  if (!resource) {
    return (
      <div className="placeholder">
        <p>资源不存在</p>
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
          <h1>编辑资源</h1>
          <p className="muted">修改资源信息</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate(`/resources/${id}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          取消
        </motion.button>
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
            onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'PUBLIC' | 'COURSE_ONLY' }))}
          >
            <option value="COURSE_ONLY">课程内可见</option>
            <option value="PUBLIC">全校可见</option>
          </select>
        </label>
        <label>
          更新附件 (可选)
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
          />
          {resource?.fileName && <span className="muted text-sm">当前文件: {resource.fileName}</span>}
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

export default ResourceEditPage
