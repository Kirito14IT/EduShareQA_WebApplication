import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiEye, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { PagedResourceList, PagedQuestionList, ResourceQueryParams, QuestionQueryParams, PagedCourseList } from '../types/api'

const StudentProfilePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'resources' | 'questions'>('resources')
  const [resourceFilters, setResourceFilters] = useState<ResourceQueryParams>({ page: 1, pageSize: 8 })
  const [questionFilters, setQuestionFilters] = useState<QuestionQueryParams>({ page: 1, pageSize: 8 })

  // Fetch courses
  const { data: coursesData } = useQuery<PagedCourseList>({
    queryKey: ['courses-list'],
    queryFn: () => api.getCourses({ page: 1, pageSize: 100 }),
  })
  const courses = coursesData?.items ?? []

  const { data: myResources, isLoading: resourcesLoading } = useQuery<PagedResourceList>({
    queryKey: ['my-resources', resourceFilters],
    queryFn: () => api.getMyResources(resourceFilters),
  })

  const { data: myQuestions, isLoading: questionsLoading } = useQuery<PagedQuestionList>({
    queryKey: ['my-questions', questionFilters],
    queryFn: () => api.getQuestions(questionFilters),
  })

  const deleteResourceMutation = useMutation({
    mutationFn: api.deleteResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resources'] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: api.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-questions'] })
      queryClient.invalidateQueries({ queryKey: ['questions'] })
    },
  })

  const handleDeleteResource = async (id: number) => {
    if (confirm('确定要删除这个资源吗？')) {
      await deleteResourceMutation.mutateAsync(id)
    }
  }

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('确定要删除这个问题吗？')) {
      await deleteQuestionMutation.mutateAsync(id)
    }
  }

  const handleEditResource = (id: number) => {
    navigate(`/resources/${id}/edit`)
  }

  const handleEditQuestion = (id: number) => {
    navigate(`/questions/${id}/edit`)
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <h1>学生个人中心</h1>
          <p className="muted">管理我的学习资源和提问</p>
        </div>
      </header>

      <div className="tabs">
        <motion.button
          className={activeTab === 'resources' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('resources')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          我的资源 ({myResources?.total ?? 0})
        </motion.button>
        <motion.button
          className={activeTab === 'questions' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('questions')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          我的提问 ({myQuestions?.total ?? 0})
        </motion.button>
      </div>

      {activeTab === 'resources' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {resourcesLoading ? (
            <div className="placeholder">加载中…</div>
          ) : (
            <div className="card">
              <table>
                <thead>
                  <tr>
                    <th>标题</th>
                    <th>课程</th>
                    <th>下载次数</th>
                    <th>发布时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(myResources?.items ?? []).map((resource) => (
                    <tr key={resource.id}>
                      <td>
                        <div className="title-cell">{resource.title}</div>
                        <div className="muted small">{resource.summary}</div>
                      </td>
                      <td>{courses.find((c) => c.id === resource.courseId)?.name ?? resource.courseId}</td>
                      <td>{resource.downloadCount}</td>
                      <td>{new Date(resource.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="action-buttons">
                          <motion.button
                            className="ghost-button small"
                            onClick={() => navigate(`/resources/${resource.id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEye /> 查看
                          </motion.button>
                          <motion.button
                            className="ghost-button small"
                            onClick={() => handleEditResource(resource.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEdit2 /> 编辑
                          </motion.button>
                          <motion.button
                            className="ghost-button small danger"
                            onClick={() => handleDeleteResource(resource.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2 /> 删除
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(myResources?.items?.length ?? 0) === 0 && <div className="placeholder">暂无资源</div>}
            </div>
          )}

          {myResources && myResources.total > 0 && (
            <div className="pagination">
              <motion.button
                className="ghost-button"
                disabled={resourceFilters.page === 1}
                onClick={() => setResourceFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronLeft /> 上一页
              </motion.button>
              <span className="pagination-info">
                第 {myResources.page} 页，共 {Math.ceil(myResources.total / myResources.pageSize)} 页
              </span>
              <motion.button
                className="ghost-button"
                disabled={myResources.page >= Math.ceil(myResources.total / myResources.pageSize)}
                onClick={() => setResourceFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                下一页 <FiChevronRight />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === 'questions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {questionsLoading ? (
            <div className="placeholder">加载中…</div>
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
                  {(myQuestions?.items ?? []).map((question) => (
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
                        <div className="action-buttons">
                          <motion.button
                            className="ghost-button small"
                            onClick={() => navigate(`/questions/${question.id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiEye /> 查看
                          </motion.button>
                          {question.status === 'OPEN' && (
                            <motion.button
                              className="ghost-button small"
                              onClick={() => handleEditQuestion(question.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiEdit2 /> 编辑
                            </motion.button>
                          )}
                          <motion.button
                            className="ghost-button small danger"
                            onClick={() => handleDeleteQuestion(question.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2 /> 删除
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(myQuestions?.items?.length ?? 0) === 0 && <div className="placeholder">暂无提问</div>}
            </div>
          )}

          {myQuestions && myQuestions.total > 0 && (
            <div className="pagination">
              <motion.button
                className="ghost-button"
                disabled={questionFilters.page === 1}
                onClick={() => setQuestionFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronLeft /> 上一页
              </motion.button>
              <span className="pagination-info">
                第 {myQuestions.page} 页，共 {Math.ceil(myQuestions.total / myQuestions.pageSize)} 页
              </span>
              <motion.button
                className="ghost-button"
                disabled={myQuestions.page >= Math.ceil(myQuestions.total / myQuestions.pageSize)}
                onClick={() => setQuestionFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                下一页 <FiChevronRight />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </section>
  )
}

export default StudentProfilePage

