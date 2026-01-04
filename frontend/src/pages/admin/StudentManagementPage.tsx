import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiBook, FiX } from 'react-icons/fi'
import api from '../../api'
import type { Student, StudentQueryParams } from '../../types/api'

const StudentManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<StudentQueryParams>({ page: 1, pageSize: 10 })
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students', filters],
    queryFn: () => api.getStudents(filters),
  })

  const { data: courses } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })

  const setCoursesMutation = useMutation({
    mutationFn: ({ studentId, courseIds }: { studentId: number; courseIds: number[] }) =>
      api.setStudentCourses(studentId, courseIds),
    onSuccess: () => {
      toast.success('课程分配成功！', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['admin-students'] })
      setIsCourseModalOpen(false)
      setSelectedStudent(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || '分配失败')
    },
  })

  const handleOpenCourseModal = (student: Student) => {
    setSelectedStudent(student)
    setIsCourseModalOpen(true)
  }

  const handleSetCourses = (courseIds: number[]) => {
    if (selectedStudent) {
      setCoursesMutation.mutate({ studentId: selectedStudent.id, courseIds })
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
          <h1>学生管理</h1>
          <p className="muted">查看学生列表，管理学生选课信息</p>
        </div>
      </motion.div>

      <div className="filters-row">
        <label>
           搜索
          <input
            placeholder="姓名、用户名 or 邮箱"
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
                <th>所属学院</th>
                <th>已选课程</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {students?.items.map((student, index) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <td>
                      <strong>{student.fullName}</strong>
                    </td>
                    <td>{student.username}</td>
                    <td>{student.email}</td>
                    <td>{student.department || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {student.courseNames && student.courseNames.length > 0 ? (
                          student.courseNames.map((name) => (
                            <span key={name} className="tag">
                              {name}
                            </span>
                          ))
                        ) : (
                          <span className="muted">无课程</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(student.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <motion.button
                          className="ghost-button small"
                          onClick={() => handleOpenCourseModal(student)}
                          whileHover={{ scale: 1.1, color: '#10b981' }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiBook /> 分配课程
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {students && students.items.length === 0 && <div className="placeholder">暂无学生</div>}
        </motion.div>
      )}

      {students && students.total > 0 && (
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
            第 {students.page} 页，共 {Math.ceil(students.total / students.pageSize)} 页（共 {students.total} 条）
          </span>
          <motion.button
            className="ghost-button"
            disabled={students.page >= Math.ceil(students.total / students.pageSize)}
            onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            下一页
          </motion.button>
        </div>
      )}

      {/* 课程分配模态框 */}
      <AnimatePresence>
        {isCourseModalOpen && selectedStudent && (
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
                <h2>为 {selectedStudent.fullName} 分配课程</h2>
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
                  const isSelected = selectedStudent.courseIds?.includes(course.id) ?? false
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
                          const currentIds = selectedStudent.courseIds ?? []
                          const newIds = e.target.checked
                            ? [...currentIds, course.id]
                            : currentIds.filter((id) => id !== course.id)
                          setSelectedStudent({ ...selectedStudent, courseIds: newIds })
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
                  onClick={() => handleSetCourses(selectedStudent.courseIds ?? [])}
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

export default StudentManagementPage
