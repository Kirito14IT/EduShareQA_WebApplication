import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import { useAuthStore } from '../store/authStore'

const RegisterPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    department: '',
    schoolId: '',
  })

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: api.register,
    onSuccess: ({ tokens, user }) => {
      setAuth({ tokens, user })
      navigate('/resources', { replace: true })
    },
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await mutateAsync(form)
  }

  return (
    <div className="auth-wrapper">
      <section className="auth-card">
        <h1>创建 EduShareQA 账号</h1>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            用户名
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </label>
          <label>
            姓名
            <input
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </label>
          <label>
            邮箱
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
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
          <label>
            院系
            <input
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
            />
          </label>
          <label>
            学号
            <input
              value={form.schoolId}
              onChange={(e) => setForm((prev) => ({ ...prev, schoolId: e.target.value }))}
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
            {isPending ? '创建账号…' : '注册'}
          </motion.button>
        </form>
        <p className="muted">
          已有账号？<Link to="/login">返回登录</Link>
        </p>
      </section>
    </div>
  )
}

export default RegisterPage

