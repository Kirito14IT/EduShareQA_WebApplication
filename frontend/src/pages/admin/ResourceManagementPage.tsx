import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiTrash2, FiEdit2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import api from '../../api'
import type { Resource, ResourceQueryParams, ResourceMetadata } from '../../types/api'

const ResourceManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ResourceQueryParams>({ page: 1, pageSize: 10 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [form, setForm] = useState<Partial<ResourceMetadata>>({
    title: '',
    summary: '',
    courseId: undefined,
    visibility: 'PUBLIC'
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-resources', filters],
    queryFn: () => api.getAllResources(filters),
  })

  // Fetch courses and users for name lookup
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  // Note: We can't easily fetch all users, so we might need to rely on what's available or fetch individually.
  // However, for admin list, ideally the backend should return names.
  // Assuming backend returns uploaderName in the list, if not we fallback to ID.
  // Looking at Resource interface in api.ts, it doesn't have uploaderName by default, only ResourceDetail has.
  // Let's check api.ts Resource interface again.
  // Yes, Resource interface extends ResourceMetadata, has uploaderId. ResourceDetail adds uploaderName.
  // If the admin list API returns Resource objects without names, we show IDs.
  // Let's try to find course name at least.

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name ?? `课程${id}`
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, metadata }: { id: number; metadata: Partial<ResourceMetadata> }) =>
      api.adminUpdateResource(id, metadata),
    onSuccess: () => {
      toast.success('资源更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      setIsModalOpen(false)
      setEditingResource(null)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteResource,
    onSuccess: () => {
      toast.success('资源删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
    },
  })

  const resetForm = () => {
    setForm({ title: '', summary: '', courseId: undefined, visibility: 'PUBLIC' })
  }

  const handleOpenEdit = (resource: Resource) => {
    setEditingResource(resource)
    setForm({
      title: resource.title,
      summary: resource.summary || '',
      courseId: resource.courseId,
      visibility: resource.visibility || 'PUBLIC'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingResource) return

    try {
      await updateMutation.mutateAsync({
        id: editingResource.id,
        metadata: form
      })
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个资源吗？此操作不可恢复！')) {
      deleteMutation.mutate(id)
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
          <h1>学习资源管理</h1>
          <p className="muted">删除不合规或违规的资源，修改资源说明信息</p>
        </div>
      </motion.div>

      <div className="filters-row">
        <label>
          搜索
          <input
            placeholder="标题或简介"
            value={filters.keyword ?? ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value || undefined, page: 1 }))}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="placeholder">加载中…</div>
      ) : (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>上传者</th>
                <th>课程</th>
                <th>下载次数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data?.items.map((resource, index) => (
                  <motion.tr
                    key={resource.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{resource.title}</td>
                    <td>用户{resource.uploaderId}</td>
                    <td>{getCourseName(resource.courseId)}</td>
                    <td>{resource.downloadCount}</td>
                    <td>
                      <div className="action-buttons">
                        <motion.button
                          className="ghost-button small"
                          onClick={() => handleOpenEdit(resource)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiEdit2 /> 编辑
                        </motion.button>
                        <motion.button
                          className="ghost-button small danger"
                          onClick={() => handleDelete(resource.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 /> 删除
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {data && data.items.length === 0 && <div className="placeholder">暂无资源</div>}
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
                <h3>修改资源说明信息</h3>
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
                    简介
                    <textarea
                      value={form.summary || ''}
                      onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={3}
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

                <div className="form-group">
                  <label>
                    可见范围
                    <select
                      value={form.visibility}
                      onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as 'PUBLIC' | 'COURSE_ONLY' }))}
                    >
                      <option value="PUBLIC">公开</option>
                      <option value="COURSE_ONLY">仅本课程</option>
                    </select>
                  </label>
                </div>

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
                    disabled={updateMutation.isPending}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {updateMutation.isPending ? '保存中...' : '保存'}
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

export default ResourceManagementPage

