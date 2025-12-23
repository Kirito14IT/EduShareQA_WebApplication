import type { FormEvent } from 'react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBook } from 'react-icons/fi'
import api from '../../api'
import type { Teacher, TeacherCreate, TeacherQueryParams } from '../../types/api'

const TeacherManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<TeacherQueryParams>({ page: 1, pageSize: 10 })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherCreate>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    department: '',
    title: '',
    bio: '',
    courseIds: [],
  })

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['admin-teachers', filters],
    queryFn: () => api.getTeachers(filters),
  })

  const { data: courses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })

  const createMutation = useMutation({
    mutationFn: api.createTeacher,
    onSuccess: () => {
      toast.success('教师创建成功！', { icon: '🎉' })
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TeacherCreate> }) =>
      api.updateTeacher(id, payload),
    onSuccess: () => {
      toast.success('教师信息更新成功！', { icon: '✨' })
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
      setIsModalOpen(false)
      setEditingTeacher(null)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteTeacher,
    onSuccess: () => {
      toast.success('教师删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const setCoursesMutation = useMutation({
    mutationFn: ({ teacherId, courseIds }: { teacherId: number; courseIds: number[] }) =>
      api.setTeacherCourses(teacherId, courseIds),
    onSuccess: () => {
      toast.success('课程分配成功！', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['admin-teachers'] })
      setIsCourseModalOpen(false)
      setSelectedTeacher(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || '分配失败')
    },
  })

  const resetForm = () => {
    setForm({ username: '', email: '', fullName: '', password: '', department: '', title: '', bio: '', courseIds: [] })
  }

  const handleOpenCreate = () => {
    setEditingTeacher(null)
    resetForm()
    setIsModalOpen(true)
  }

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setForm({
      username: teacher.username,
      email: teacher.email,
      fullName: teacher.fullName,
      department: teacher.department ?? '',
      title: teacher.title ?? '',
      bio: teacher.bio ?? '',
      courseIds: teacher.courseIds ?? [],
    })
    setIsModalOpen(true)
  }

  const handleOpenCourseModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsCourseModalOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Manual validation
    if (!form.username?.trim()) {
      toast.error('请输入用户名')
      return
    }
    if (!form.email?.trim()) {
      toast.error('请输入邮箱')
      return
    }
    if (!form.fullName?.trim()) {
      toast.error('请输入姓名')
      return
    }
    if (!editingTeacher && !form.password?.trim()) {
      toast.error('请输入密码')
      return
    }

    console.log('Submitting form:', form)
    try {
      if (editingTeacher) {
        await updateMutation.mutateAsync({ id: editingTeacher.id, payload: form })
      } else {
        await createMutation.mutateAsync(form)
      }
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleSetCourses = (courseIds: number[]) => {
    if (selectedTeacher) {
      setCoursesMutation.mutate({ teacherId: selectedTeacher.id, courseIds })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个教师吗？此操作不可恢复！')) {
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
          <h1>教师管理</h1>
          <p className="muted">管理教师信息，设置教师讲授课程、简介和职称</p>
        </div>
        <motion.button
          className="primary-button"
          onClick={handleOpenCreate}
          whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus /> 新建教师
        </motion.button>
      </motion.div>

      <div className="filters-row">
        <label>
          搜索
          <input
            placeholder="姓名、用户名或邮箱"
            value={filters.keyword ?? ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value || undefined, page: 1 }))}
          />
        </label>
        <label>
          学院
          <input
            placeholder="所属学院"
            value={filters.department ?? ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value || undefined, page: 1 }))}
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
                <th>姓名</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>职称</th>
                <th>所属学院</th>
                <th>负责课程</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {teachers?.items.map((teacher, index) => (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td>
                      <strong>{teacher.fullName}</strong>
                    </td>
                    <td>{teacher.username}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.title || '-'}</td>
                    <td>{teacher.department || '-'}</td>
                    <td>{teacher.courseNames?.join(', ') || '未分配'}</td>
                    <td>
                      <div className="action-buttons">
                        <motion.button
                          className="ghost-button small"
                          onClick={() => handleOpenEdit(teacher)}
                          whileHover={{ scale: 1.1, color: '#2563eb' }}
                          whileTap={{ scale: 0.9 }}
                          title="编辑"
                        >
                          <FiEdit2 />
                        </motion.button>
                        <motion.button
                          className="ghost-button small"
                          onClick={() => handleOpenCourseModal(teacher)}
                          whileHover={{ scale: 1.1, color: '#10b981' }}
                          whileTap={{ scale: 0.9 }}
                          title="分配课程"
                        >
                          <FiBook />
                        </motion.button>
                        <motion.button
                          className="ghost-button small danger"
                          onClick={() => handleDelete(teacher.id)}
                          whileHover={{ scale: 1.1, color: '#dc2626' }}
                          whileTap={{ scale: 0.9 }}
                          title="删除"
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
          {teachers && teachers.items.length === 0 && <div className="placeholder">暂无教师</div>}
        </motion.div>
      )}

      {teachers && teachers.total > 0 && (
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
            第 {teachers.page} 页，共 {Math.ceil(teachers.total / teachers.pageSize)} 页（共 {teachers.total} 条）
          </span>
          <motion.button
            className="ghost-button"
            disabled={teachers.page >= Math.ceil(teachers.total / teachers.pageSize)}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            下一页
          </motion.button>
        </div>
      )}

      {/* 教师编辑/创建模态框 */}
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
                <h2>{editingTeacher ? '编辑教师' : '新建教师'}</h2>
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
                  姓名 <span className="required">*</span>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ flex: 1 }}>
                    用户名 <span className="required">*</span>
                    <input
                      value={form.username}
                      onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                      required
                      disabled={!!editingTeacher}
                      style={{ width: '100%' }}
                    />
                  </label>
                  <label style={{ flex: 1 }}>
                    邮箱 <span className="required">*</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ width: '100%' }}
                    />
                  </label>
                </div>
                {!editingTeacher && (
                  <label>
                    密码 <span className="required">*</span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="初始登录密码"
                    />
                  </label>
                )}
                <label>
                  职称
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="如：教授、副教授"
                  />
                </label>
                <label>
                  所属学院
                  <input
                    value={form.department}
                    onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </label>
                <label className="full-width">
                  简介
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                  />
                </label>
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

      {/* 课程分配模态框 */}
      <AnimatePresence>
        {isCourseModalOpen && selectedTeacher && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCourseModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>为 {selectedTeacher.fullName} 分配课程</h2>
                <motion.button
                  className="ghost-button"
                  onClick={() => setIsCourseModalOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX />
                </motion.button>
              </div>
              <div className="course-selection">
                {courses?.items.map((course) => {
                  const isSelected = selectedTeacher.courseIds?.includes(course.id) ?? false
                  return (
                    <motion.label
                      key={course.id}
                      className="course-checkbox"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = selectedTeacher.courseIds ?? []
                          const newIds = e.target.checked
                            ? [...currentIds, course.id]
                            : currentIds.filter((id) => id !== course.id)
                          setSelectedTeacher({ ...selectedTeacher, courseIds: newIds })
                        }}
                      />
                      <span>{course.name}</span>
                    </motion.label>
                  )
                })}
              </div>
              <div className="modal-actions">
                <motion.button
                  type="button"
                  className="ghost-button"
                  onClick={() => setIsCourseModalOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  取消
                </motion.button>
                <motion.button
                  type="button"
                  className="primary-button"
                  onClick={() => handleSetCourses(selectedTeacher.courseIds ?? [])}
                  disabled={setCoursesMutation.isPending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {setCoursesMutation.isPending ? '保存中…' : '保存'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default TeacherManagementPage

