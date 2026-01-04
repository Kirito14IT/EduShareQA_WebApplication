import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiChevronLeft, FiDownload, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import api from '../../api'
import { useAuthStore } from '../../store/authStore'
import { getFileUrl } from '../../utils/file'

const AdminResourceDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const token = useAuthStore((state) => state.tokens?.accessToken)
  const queryClient = useQueryClient()

  // Fetch courses
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-lookup'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 1000 }),
  })
  const courses = coursesData?.items ?? []

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['admin-resource-detail', id],
    queryFn: () => api.getResourceById(Number(id)),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteResource,
    onSuccess: () => {
      toast.success('资源删除成功！', { icon: '🗑️' })
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] })
      navigate('/admin/resources')
    },
    onError: (error: Error) => {
      toast.error(error.message || '删除失败')
    },
  })

  const downloadUrl = useMemo(() => {
    return getFileUrl(resource?.fileUrl, token)
  }, [resource, token])

  const handleDelete = () => {
    if (confirm('确定要删除这个资源吗？此操作不可恢复！')) {
      deleteMutation.mutate(Number(id))
    }
  }

  if (isLoading) {
    return <div className="placeholder">加载资源详情…</div>
  }

  if (error || !resource) {
    return (
      <div className="placeholder">
        <p>资源不存在或加载失败</p>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/admin/resources')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回资源管理
        </motion.button>
      </div>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>{resource.title}</h1>
          <p className="muted">资源详情信息</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <motion.button
            className="ghost-button"
            onClick={() => navigate('/admin/resources')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronLeft /> 返回列表
          </motion.button>
          <motion.button
            className="ghost-button"
            onClick={() => navigate(`/admin/resources/${id}/edit`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiEdit2 /> 编辑
          </motion.button>
          <motion.button
            className="ghost-button danger"
            onClick={handleDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiTrash2 /> 删除
          </motion.button>
        </div>
      </header>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="detail-grid">
          <div className="detail-item">
            <label>课程</label>
            <p>{courses.find((c) => c.id === resource.courseId)?.name ?? resource.courseId}</p>
          </div>
          <div className="detail-item">
            <label>上传者</label>
            <p>{resource.uploaderName ?? `用户${resource.uploaderId}`}</p>
          </div>
          <div className="detail-item">
            <label>下载次数</label>
            <p>{resource.downloadCount}</p>
          </div>
          <div className="detail-item">
            <label>可见范围</label>
            <p>{resource.visibility === 'PUBLIC' ? '全校' : '课程内'}</p>
          </div>
          <div className="detail-item">
            <label>发布时间</label>
            <p>{new Date(resource.createdAt).toLocaleString()}</p>
          </div>
          {resource.fileType && (
            <div className="detail-item">
              <label>文件类型</label>
              <p>{resource.fileType.toUpperCase()}</p>
            </div>
          )}
        </div>

        {resource.summary && (
          <div className="detail-section">
            <label>资源简介</label>
            <p className="summary-text">{resource.summary}</p>
          </div>
        )}

        {downloadUrl && (
          <div className="detail-section">
            <motion.a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiDownload /> 下载资源
            </motion.a>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default AdminResourceDetailPage
