import type { FormEvent } from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import api from '../../api'
import type { Course, CourseCreate, CourseQueryParams } from '../../types/api'

const CourseManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<CourseQueryParams>({ page: 1, pageSize: 10 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseCreate>({
    code: '',
    name: '',
    description: '',
    faculty: '',
    teacherIds: [],
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', filters],
    queryFn: () => api.getCourses(filters),
  })

  // Fetch teachers for assignment
  const { data: teachersData } = useQuery({
    queryKey: ['admin-teachers-list'],
    queryFn: () => api.getTeachers({ page: 1, pageSize: 1000 }),
  })
  const teachers = teachersData?.items ?? []

  const createMutation = useMutation({
    mutationFn: api.createCourse,
    onSuccess: () => {
      toast.success('课程创建成功！', { icon: '🎉' })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CourseCreate> }) =>
      api.updateCourse(id, payload),
    onSuccess: () => {
      toast.success('课程更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      setIsModalOpen(false)
      setEditingCourse(null)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteCourse,
    onSuccess: () => {
      toast.success('课程删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const resetForm = () => {
    setForm({ code: '', name: '', description: '', faculty: '', teacherIds: [] })
  }

  const handleOpenCreate = () => {
    setEditingCourse(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course)
    setForm({
      code: course.code,
      name: course.name,
      description: course.description ?? '',
      faculty: course.faculty,
      teacherIds: course.teacherIds ?? [],
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({ id: editingCourse.id, payload: form })
      } else {
        await createMutation.mutateAsync(form)
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个课程吗？此操作不可恢复！')) {
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
          <h1>课程管理</h1>
          <p className="muted">管理所有课程信息，包括课程名称、授课教师、课程描述和开课学院</p>
        </div>
        <motion.button
          className="primary-button"
          onClick={handleOpenCreate}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> 新建课程
        </motion.button>
      </motion.div>

      <div className="filters-row">
        <label>
          搜索
          <input
            placeholder="课程名称或编号"
            value={filters.keyword ?? ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value || undefined, page: 1 }))}
          />
        </label>
        <label>
          学院
          <input
            placeholder="开课学院"
            value={filters.faculty ?? ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, faculty: e.target.value || undefined, page: 1 }))}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="placeholder">加载中…</div>
      ) : (
        <motion.div
          className="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <table>
            <thead>
              <tr>
                <th>课程编号</th>
                <th>课程名称</th>
                <th>开课学院</th>
                <th>授课教师</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data?.items.map((course, index) => (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td>{course.code}</td>
                    <td>
                      <strong>{course.name}</strong>
                    </td>
                    <td>{course.faculty}</td>
                    <td>{course.teacherNames?.join(', ') || '未分配'}</td>
                    <td className="text-truncate">{course.description || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <motion.button
                          className="ghost-button small"
                          onClick={() => handleOpenEdit(course)}
                          whileHover={{ scale: 1.1, color: '#2563eb' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiEdit2 />
                        </motion.button>
                        <motion.button
                          className="ghost-button small danger"
                          onClick={() => handleDelete(course.id)}
                          whileHover={{ scale: 1.1, color: '#dc2626' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {data && data.items.length === 0 && <div className="placeholder">暂无课程</div>}
        </motion.div>
      )}

      {data && data.total > 0 && (
        <div className="pagination">
          <motion.button
            className="ghost-button"
            disabled={filters.page === 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            上一页
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
            下一页
          </motion.button>
        </div>
      )}

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{editingCourse ? '编辑课程' : '新建课程'}</h2>
                <motion.button
                  className="ghost-button"
                  onClick={() => setIsModalOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="form-grid">
                <label>
                  课程编号 <span className="required">*</span>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  课程名称 <span className="required">*</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  开课学院 <span className="required">*</span>
                  <input
                    value={form.faculty}
                    onChange={(e) => setForm((prev) => ({ ...prev, faculty: e.target.value }))}
                    required
                  />
                </label>
                <label className="full-width">
                  课程描述
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </label>
                
                <div className="full-width">
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>授课教师</label>
                  <div className="course-selection" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.5rem' }}>
                    {teachers.map((teacher) => (
                      <motion.label
                        key={teacher.id}
                        className="course-checkbox"
                        style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem', cursor: 'pointer' }}
                        whileHover={{ x: 2 }}
                      >
                        <input
                          type="checkbox"
                          checked={form.teacherIds?.includes(teacher.id) ?? false}
                          onChange={(e) => {
                            const currentIds = form.teacherIds ?? []
                            const newIds = e.target.checked
                              ? [...currentIds, teacher.id]
                              : currentIds.filter((id) => id !== teacher.id)
                            setForm((prev) => ({ ...prev, teacherIds: newIds }))
                          }}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <span>{teacher.fullName} ({teacher.username})</span>
                      </motion.label>
                    ))}
                    {teachers.length === 0 && <div className="muted small">暂无教师可选</div>}
                  </div>
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
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '100px'
                    }}
                  >
                    {createMutation.isPending || updateMutation.isPending ? '保存中…' : '保存'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default CourseManagementPage

