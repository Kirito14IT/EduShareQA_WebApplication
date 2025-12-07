import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import { useAuthStore } from '../store/authStore'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState({ username: 'student01', password: 'password123' })

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: api.login,
    onSuccess: ({ tokens, user }) => {
      setAuth({ tokens, user })
      const redirectPath = (location.state as { from?: Location })?.from?.pathname ?? '/resources'
      navigate(redirectPath, { replace: true })
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync(form)
  }

  return (
    <div className="auth-wrapper">
      <section className="auth-card">
        <h1>EduShareQA 登录</h1>
        <p>使用校园账号体验学习资源与问答平台。</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            用户名 / 邮箱
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </label>
          <label>
            密码
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-box"
            >
              {(error as Error).message}
            </motion.div>
          )}
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            {isPending ? '登录中…' : '登录'}
          </motion.button>
        </form>

        <p className="muted">
          还没有账号？<Link to="/register">立即注册</Link>
        </p>
        <div className="test-accounts">
          <p className="muted small">测试账号：</p>
          <div className="test-account-list">
            <div>学生：student01 / password123</div>
            <div>教师：teacher01 / password123</div>
            <div>管理员：admin01 / password123</div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LoginPage

