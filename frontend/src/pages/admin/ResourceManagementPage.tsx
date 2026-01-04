import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiTrash2, FiEdit2, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import type { ResourceQueryParams } from '../../types/api'

const ResourceManagementPage = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ResourceQueryParams>({ page: 1, pageSize: 10 })

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

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name ?? `课程${id}`
  }

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteResource,
    onSuccess: () => {
      toast.success('资源删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
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
                          onClick={() => navigate(`/admin/resources/${resource.id}`)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiEye /> 查看详情
                        </motion.button>
                        <motion.button
                          className="ghost-button small"
                          onClick={() => navigate(`/admin/resources/${resource.id}/edit`)}
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
    </section>
  )
}

export default ResourceManagementPage

