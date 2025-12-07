import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { PagedResourceList, ResourceQueryParams } from '../types/api'

const courses = [
  { id: 101, name: '线性代数' },
  { id: 102, name: '大学英语' },
  { id: 103, name: '概率统计' },
]

// Mock uploader names - 实际应该从API获取
const getUploaderName = (uploaderId: number): string => {
  const names: Record<number, string> = {
    1: 'Alice Student',
    2: 'Bob Teacher',
  }
  return names[uploaderId] ?? `用户${uploaderId}`
}

const ResourceListPage = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ResourceQueryParams>({ page: 1, pageSize: 8 })

  const { data, isLoading, refetch, isFetching } = useQuery<PagedResourceList>({
    queryKey: ['resources', filters],
    queryFn: () => api.getResources(filters),
    placeholderData: keepPreviousData,
  })

  const rows = useMemo(() => data?.items ?? [], [data])

  const handleFilterChange = (updated: Partial<ResourceQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...updated, page: 1 }))
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>学习资源</h1>
          <p className="muted">按课程或关键字筛选，快速定位需要的资料。</p>
        </div>
        <motion.button
          className="ghost-button"
          onClick={() => refetch()}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isFetching ? '刷新中…' : '刷新'}
        </motion.button>
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
          关键字
          <input
            placeholder="标题 / 简介"
            value={filters.keyword ?? ''}
            onChange={(e) => handleFilterChange({ keyword: e.target.value || undefined })}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="placeholder">正在加载资源列表…</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>标题</th>
                <th>课程</th>
                <th>上传者</th>
                <th>下载次数</th>
                <th>可见范围</th>
                <th>发布时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <motion.div
                      className="title-cell clickable"
                      onClick={() => navigate(`/resources/${resource.id}`)}
                      whileHover={{ color: '#2563eb', cursor: 'pointer' }}
                      style={{ textDecoration: 'underline' }}
                    >
                      {resource.title}
                    </motion.div>
                    <div className="muted small">{resource.summary}</div>
                  </td>
                  <td>{courses.find((c) => c.id === resource.courseId)?.name ?? resource.courseId}</td>
                  <td>{getUploaderName(resource.uploaderId)}</td>
                  <td>{resource.downloadCount}</td>
                  <td>{resource.visibility === 'PUBLIC' ? '全校' : '课程内'}</td>
                  <td>{new Date(resource.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="placeholder">暂无数据</div>}
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

export default ResourceListPage

