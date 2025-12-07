import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import NotificationBadge from '../notifications/NotificationBadge'
import { useAuthStore } from '../../store/authStore'

const DashboardLayout = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="brand">EduShareQA</div>
          <div className="subtitle">学习资源与答疑平台</div>
        </div>
        <div className="header-right">
          <NotificationBadge />
          <div className="user-block">
            <span className="user-name">{user?.fullName ?? user?.username}</span>
            <motion.button
              className="ghost-button"
              onClick={handleLogout}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(37, 99, 235, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              退出
            </motion.button>
          </div>
        </div>
      </header>

      <div className="app-body">
        <nav className="side-nav">
          {/* 学生和管理员通用菜单 */}
          {(user?.roles?.includes('STUDENT') || user?.roles?.includes('ADMIN')) && (
            <>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/resources" end>
                  学习资源
                </NavLink>
              </motion.div>
              {user?.roles?.includes('STUDENT') && (
                <>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/resources/upload">资源上传</NavLink>
                  </motion.div>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/questions" end>
                      我的提问
                    </NavLink>
                  </motion.div>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/questions/new">我要提问</NavLink>
                  </motion.div>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/questions/search">提问搜索</NavLink>
                  </motion.div>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/notifications">通知中心</NavLink>
                  </motion.div>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <NavLink to="/profile">个人中心</NavLink>
                  </motion.div>
                </>
              )}
            </>
          )}

          {/* 教师菜单 */}
          {user?.roles?.includes('TEACHER') && (
            <>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/teacher/dashboard">工作台</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/teacher/questions">学生提问</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/resources/upload">发布资源</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/notifications">通知中心</NavLink>
              </motion.div>
            </>
          )}

          {/* 管理员菜单 */}
          {user?.roles?.includes('ADMIN') && (
            <>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/admin/courses">课程管理</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/admin/teachers">教师管理</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/admin/resources">资源管理</NavLink>
              </motion.div>
              <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <NavLink to="/admin/questions">问答管理</NavLink>
              </motion.div>
            </>
          )}

          {/* 通用菜单 */}
          <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
            <NavLink to="/settings">个人设置</NavLink>
          </motion.div>
        </nav>

        <main className="page-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

