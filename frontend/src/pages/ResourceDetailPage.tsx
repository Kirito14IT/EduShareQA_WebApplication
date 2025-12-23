import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import type { PagedCourseList } from '../types/api'

const ResourceDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', id],
    queryFn: () => api.getResourceById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="placeholder">加载资源详情…</div>
  }

  if (error || !resource) {
    return (
      <div className="placeholder">
        <p>资源不存在或加载失败</p>
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/resources')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回资源列表
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
        <motion.button
          className="ghost-button"
          onClick={() => navigate('/resources')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          返回列表
        </motion.button>
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

        {resource.fileUrl && (
          <div className="detail-section">
            <motion.a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              下载资源
            </motion.a>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default ResourceDetailPage

