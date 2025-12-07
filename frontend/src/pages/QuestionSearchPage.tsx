import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { PagedQuestionList, QuestionQueryParams } from '../types/api'

const courses = [
  { id: 101, name: '线性代数' },
  { id: 102, name: '大学英语' },
  { id: 103, name: '概率统计' },
]

const teachers = [
  { id: 2, name: 'Bob Teacher' },
  { id: 3, name: 'Charlie Teacher' },
]

const QuestionSearchPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<QuestionQueryParams>({ page: 1, pageSize: 8 })

  const { data, isLoading } = useQuery<PagedQuestionList>({
    queryKey: ['questions', 'search', filters],
    queryFn: () => api.searchQuestions(filters),
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
          <h1>提问搜索</h1>
          <p className="muted">按学科、教师、关键字检索全站问答。</p>
        </div>
      </header>

      <div className="filters-row">
        <label>
          学科/课程
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
          教师
          <select
            value={filters.teacherId ?? ''}
            onChange={(e) =>
              handleFilterChange({ teacherId: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">全部</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          关键字
          <input
            placeholder="标题 / 内容"
            value={filters.keyword ?? ''}
            onChange={(e) => handleFilterChange({ keyword: e.target.value || undefined })}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="placeholder">正在搜索…</div>
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
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((question) => (
                <tr key={question.id}>
                  <td>
                    <div className="title-cell">{question.title}</div>
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
                  <td>
                    <motion.button
                      className="ghost-button small"
                      onClick={() => navigate(`/questions/${question.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      查看详情
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="placeholder">暂无匹配的提问</div>}
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
        </motion.div>
      )}
    </section>
  )
}

export default QuestionSearchPage

