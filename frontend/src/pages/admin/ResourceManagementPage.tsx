import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'
import api from '../../api'
import type { ResourceQueryParams } from '../../types/api'

const ResourceManagementPage = () => {
  const queryClient = useQueryClient()
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

  // Note: We can't easily fetch all users, so we might need to rely on what's available or fetch individually.
  // However, for admin list, ideally the backend should return names.
  // Assuming backend returns uploaderName in the list, if not we fallback to ID.
  // Looking at Resource interface in api.ts, it doesn't have uploaderName by default, only ResourceDetail has.
  // Let's check api.ts Resource interface again.
  // Yes, Resource interface extends ResourceMetadata, has uploaderId. ResourceDetail adds uploaderName.
  // If the admin list API returns Resource objects without names, we show IDs.
  // Let's try to find course name at least.

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name ?? `课程${id}`
  }

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteResource,
    onSuccess: () => {
      toast.success('资源删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
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
    </section>
  )
}

export default ResourceManagementPage

