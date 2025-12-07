import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiMessageSquare } from 'react-icons/fi'
import api from '../../api'
import type { QuestionQueryParams } from '../../types/api'

const TeacherQuestionsPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<QuestionQueryParams>({ page: 1, pageSize: 10, status: 'OPEN' })

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-questions', filters],
    queryFn: () => api.getTeacherQuestions(filters),
  })

  return (
    <section>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1>学生提问</h1>
          <p className="muted">查看所上课程的全部学生提问，回答问题</p>
        </div>
      </motion.div>

      <div className="filters-row">
        <label>
          状态
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value ? (e.target.value as 'OPEN' | 'ANSWERED' | 'CLOSED') : undefined,
                page: 1,
              }))
            }
          >
            <option value="">全部</option>
            <option value="OPEN">待回答</option>
            <option value="ANSWERED">已回答</option>
            <option value="CLOSED">已关闭</option>
          </select>
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
                <th>课程</th>
                <th>提问学生</th>
                <th>状态</th>
                <th>回答数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((question, index) => (
                <motion.tr
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td>{question.title}</td>
                  <td>{question.courseName ?? `课程${question.courseId}`}</td>
                  <td>{question.studentName ?? '学生'}</td>
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
                      className="ghost-button small"
                      onClick={() => navigate(`/teacher/questions/${question.id}`)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiMessageSquare /> 查看/回答
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {data && data.items.length === 0 && <div className="placeholder">暂无问题</div>}
        </motion.div>
      )}
    </section>
  )
}

export default TeacherQuestionsPage

