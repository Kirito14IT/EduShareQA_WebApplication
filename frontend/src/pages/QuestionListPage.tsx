import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { PagedQuestionList, QuestionQueryParams, PagedCourseList } from '../types/api'

const QuestionListPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<QuestionQueryParams>({ page: 1, pageSize: 8 })

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const { data, isLoading } = useQuery<PagedQuestionList>({
    queryKey: ['questions', filters],
    queryFn: () => api.getQuestions(filters),
    placeholderData: keepPreviousData,
  })

  const rows = useMemo(() => data?.items ?? [], [data])

  const handleFilterChange = (updated: Partial<QuestionQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...updated, page: 1 }))
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>我的提问</h1>
          <p className="muted">跟踪不同课程的问题进度与老师答复。</p>
        </div>
      </header>

      <div className="filters-row">
        <label>
          课程
          <select
            value={filters.courseId ?? ''}
            onChange={(e) =>
              handleFilterChange({ courseId: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">全部</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          状态
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              handleFilterChange({
                status: e.target.value ? (e.target.value as 'OPEN' | 'ANSWERED' | 'CLOSED') : undefined,
              })
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
        <div className="placeholder">正在加载提问…</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>课程</th>
                <th>状态</th>
                <th>回答数</th>
                <th>提问时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((question) => (
                <tr key={question.id}>
                  <td>
                    <motion.div
                      className="title-cell clickable"
                      onClick={() => navigate(`/questions/${question.id}`)}
                      whileHover={{ color: '#2563eb', cursor: 'pointer' }}
                      style={{ textDecoration: 'underline' }}
                    >
                      {question.title}
                    </motion.div>
                  </td>
                  <td>{courses.find((c) => c.id === question.courseId)?.name ?? question.courseId}</td>
                  <td>
                    {question.status === 'OPEN'
                      ? '待回答'
                      : question.status === 'ANSWERED'
                        ? '已回答'
                        : '已关闭'}
                  </td>
                  <td>{question.answerCount}</td>
                  <td>{new Date(question.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="placeholder">暂无提问</div>}
        </div>
      )}

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
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            下一页
          </motion.button>
        </motion.div>
      )}
    </section>
  )
}

export default QuestionListPage

