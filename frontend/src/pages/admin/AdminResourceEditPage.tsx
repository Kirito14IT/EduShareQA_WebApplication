import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiChevronLeft, FiSave } from 'react-icons/fi'
import api from '../../api'
import type { ResourceMetadata } from '../../types/api'

const AdminResourceEditPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState<Partial<ResourceMetadata>>({
    title: '',
    summary: '',
    courseId: undefined,
    visibility: 'PUBLIC'
  })

  // Fetch courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  // Fetch resource data
  const { data: resource, isLoading } = useQuery({
    queryKey: ['admin-resource-detail', id],
    queryFn: () => api.getResourceById(Number(id)),
    enabled: !!id,
  })

  useEffect(() => {
    if (resource) {
      setForm({
        title: resource.title,
        summary: resource.summary || '',
        courseId: resource.courseId,
        visibility: resource.visibility || 'PUBLIC'
      })
    }
  }, [resource])

  const updateMutation = useMutation({
    mutationFn: ({ id, metadata, file }: { id: number; metadata: Partial<ResourceMetadata>; file: File | null }) =>
      api.adminUpdateResource(id, metadata, file),
    onSuccess: () => {
      toast.success('资源更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-resource-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      navigate(`/admin/resources/${id}`)
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
        metadata: form,
        file: file
      })
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  if (isLoading) {
    return <div className="placeholder">加载中…</div>
  }

  if (!resource) {
    return <div className="placeholder">资源不存在</div>
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>编辑资源</h1>
          <p className="muted">修改资源的基本信息</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => navigate(`/admin/resources/${id}`)}
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
            可见范围
            <select
              value={form.visibility}
              onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'PUBLIC' | 'COURSE_ONLY' }))}
            >
              <option value="PUBLIC">公开（全校可见）</option>
              <option value="COURSE_ONLY">私有（仅课程内可见）</option>
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

          <label className="full-width">
            简介
            <textarea
              value={form.summary || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              rows={5}
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

export default AdminResourceEditPage
