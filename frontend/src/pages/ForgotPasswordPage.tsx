import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import api from '../api'
import type { ForgotPasswordRequest, VerifyResetTokenRequest, ResetPasswordRequest } from '../types/api'

type Step = 'email' | 'verify' | 'reset'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const forgotPasswordMutation = useMutation({
    mutationFn: api.forgotPassword,
    onSuccess: () => {
      toast.success('验证码已发送到您的邮箱，请查看控制台')
      setStep('verify')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const verifyTokenMutation = useMutation({
    mutationFn: (data: VerifyResetTokenRequest) => api.verifyResetToken(data),
    onSuccess: () => {
      setStep('reset')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => api.resetPassword(data),
    onSuccess: () => {
      toast.success('密码重置成功')
      navigate('/login')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email) {
      toast.error('请输入邮箱')
      return
    }

    const payload: ForgotPasswordRequest = { email }
    forgotPasswordMutation.mutate(payload)
  }

  const handleVerifySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      toast.error('请输入验证码')
      return
    }

    const payload: VerifyResetTokenRequest = { email, token }
    verifyTokenMutation.mutate(payload)
  }

  const handleResetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newPassword) {
      toast.error('请输入新密码')
      return
    }
    if (newPassword.length < 6) {
      toast.error('密码长度至少6位')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    const payload: ResetPasswordRequest = { email, token, newPassword }
    resetPasswordMutation.mutate(payload)
  }

  const renderEmailStep = () => (
    <motion.form
      key="email"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleEmailSubmit}
      className="form-grid"
    >
      <h1>忘记密码</h1>
      <p>请输入您的邮箱地址，我们将发送验证码到您的邮箱</p>

      <label>
        邮箱地址
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />
      </label>

      <motion.button
        type="submit"
        disabled={forgotPasswordMutation.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {forgotPasswordMutation.isPending ? '发送中…' : '发送验证码'}
      </motion.button>

      <div className="form-footer">
        <p className="muted">
          <Link to="/login">返回登录</Link>
        </p>
      </div>
    </motion.form>
  )

  const renderVerifyStep = () => (
    <motion.form
      key="verify"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleVerifySubmit}
      className="form-grid"
    >
      <h1>验证邮箱</h1>
      <p>验证码已发送到 {email}，请查看控制台获取验证码</p>

      <label>
        验证码
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          placeholder="请输入6位验证码"
          maxLength={6}
          pattern="\d{6}"
        />
      </label>

      <motion.button
        type="submit"
        disabled={verifyTokenMutation.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {verifyTokenMutation.isPending ? '验证中…' : '验证验证码'}
      </motion.button>

      <motion.button
        type="button"
        onClick={() => setStep('email')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        style={{ marginTop: '0.5rem', backgroundColor: '#f5f5f5', color: '#666' }}
      >
        重新发送验证码
      </motion.button>

      <div className="form-footer">
        <p className="muted">
          <Link to="/login">返回登录</Link>
        </p>
      </div>
    </motion.form>
  )

  const renderResetStep = () => (
    <motion.form
      key="reset"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onSubmit={handleResetSubmit}
      className="form-grid"
    >
      <h1>设置新密码</h1>
      <p>为您的账号设置新密码</p>

      <label>
        新密码
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="请输入新密码"
          minLength={6}
        />
      </label>

      <label>
        确认新密码
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="请再次输入新密码"
          minLength={6}
        />
      </label>

      <motion.button
        type="submit"
        disabled={resetPasswordMutation.isPending}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {resetPasswordMutation.isPending ? '重置中…' : '重置密码'}
      </motion.button>

      <div className="form-footer">
        <p className="muted">
          <Link to="/login">返回登录</Link>
        </p>
      </div>
    </motion.form>
  )

  return (
    <div className="auth-wrapper">
      <section className="auth-card">
        {step === 'email' && renderEmailStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'reset' && renderResetStep()}
      </section>
    </div>
  )
}

export default ForgotPasswordPage
