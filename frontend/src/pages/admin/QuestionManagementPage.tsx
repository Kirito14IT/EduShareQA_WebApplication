import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'
import api from '../../api'
import type { QuestionQueryParams } from '../../types/api'

const QuestionManagementPage = () => {
  const queryClient = useQueryClient()
  const [filters] = useState<QuestionQueryParams>({ page: 1, pageSize: 10 })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', filters],
    queryFn: () => api.getAllQuestions(filters),
  })

  // Fetch courses for name lookup
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name ?? `课程${id}`
  }

  const deleteQuestionMutation = useMutation({
    mutationFn: api.adminDeleteQuestion,
    onSuccess: () => {
      toast.success('问题删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    },
  })

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个问题吗？此操作不可恢复！')) {
      deleteQuestionMutation.mutate(id)
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
          <h1>问答内容管理</h1>
          <p className="muted">删除、修改任意学生提问和教师回答，管控错误或违规内容</p>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="placeholder">加载中…</div>
      ) : (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>课程</th>
                <th>状态</th>
                <th>回答数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data?.items.map((question, index) => (
                  <motion.tr
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>{question.title}</td>
                    <td>{getCourseName(question.courseId)}</td>
                    <td>
                      {question.status === 'OPEN'
                        ? '待回答'
                        : question.status === 'ANSWERED'
                          ? '已回答'
                          : '已关闭'}
                    </td>
                    <td>{question.answerCount}</td>
                    <td>
                      <motion.button
                        className="ghost-button small danger"
                        onClick={() => handleDelete(question.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 /> 删除
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {data && data.items.length === 0 && <div className="placeholder">暂无问题</div>}
        </motion.div>
      )}
    </section>
  )
}

export default QuestionManagementPage

