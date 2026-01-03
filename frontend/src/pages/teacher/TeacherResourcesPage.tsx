import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiTrash2, FiDownload, FiPlus } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import api from '../../api'
import type { PagedResourceList, ResourceQueryParams, PagedCourseList } from '../../types/api'

const TeacherResourcesPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ResourceQueryParams>({ page: 1, pageSize: 8 })

  // Fetch my resources
  const { data, isLoading, refetch, isFetching } = useQuery<PagedResourceList>({
    queryKey: ['teacher', 'resources', filters],
    queryFn: () => api.getMyResources(filters),
    placeholderData: keepPreviousData,
  })

  // Fetch courses for filtering
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const rows = useMemo(() => data?.items ?? [], [data])

  const handleFilterChange = (updated: Partial<ResourceQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...updated, page: 1 }))
  }

  const deleteMutation = useMutation({
    mutationFn: api.deleteResource,
    onSuccess: () => {
      toast.success('资源删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['teacher', 'resources'] })
      queryClient.invalidateQueries({ queryKey: ['teacher', 'dashboard', 'stats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个资源吗？此操作不可恢复！')) {
      deleteMutation.mutate(id)
    }
  }

  const handleDownload = (resource: any) => {
    // 使用API下载资源
    window.open(`/api/student/resources/${resource.id}/download`, '_blank')
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>我的资源</h1>
          <p className="muted">管理您上传的学习资料，查看下载统计。</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button
            className="ghost-button"
            onClick={() => refetch()}
            disabled={isFetching}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            刷新
          </motion.button>
          <motion.button
            className="primary-button"
            onClick={() => navigate('/resources/upload')}
            whileHover={{ scale: 1.05, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus /> 上传资源
          </motion.button>
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
          关键字
          <input
            placeholder="资源标题..."
            value={filters.keyword ?? ''}
            onChange={(e) => handleFilterChange({ keyword: e.target.value || undefined })}
            style={{ width: '200px' }}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="placeholder">加载资源中…</div>
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
                <th>标题</th>
                <th>课程</th>
                <th>可见范围</th>
                <th>下载次数</th>
                <th>上传时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <div className="title-cell">{resource.title}</div>
                  </td>
                  <td>{courses.find((c) => c.id === resource.courseId)?.name ?? resource.courseId}</td>
                  <td>{resource.visibility === 'PUBLIC' ? '全部可见' : '课程内可见'}</td>
                  <td>{resource.downloadCount}</td>
                  <td>{new Date(resource.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <motion.button
                        className="ghost-button small"
                        onClick={() => navigate(`/resources/${resource.id}/edit`)}
                        whileHover={{ scale: 1.1, color: '#2563eb' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button
                        className="ghost-button small"
                        onClick={() => handleDownload(resource)}
                        whileHover={{ scale: 1.1, color: '#059669' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiDownload />
                      </motion.button>
                      <motion.button
                        className="ghost-button small danger"
                        onClick={() => handleDelete(resource.id)}
                        whileHover={{ scale: 1.1, color: '#dc2626' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FiTrash2 />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="placeholder">暂无资源</div>}
        </motion.div>
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

export default TeacherResourcesPage
