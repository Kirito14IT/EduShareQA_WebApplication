import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { FiUser, FiLock, FiSave } from 'react-icons/fi'
import api from '../api'
import { useAuthStore } from '../store/authStore'
import type { ProfileUpdate, PasswordChange } from '../types/api'

const ProfilePage = () => {
  const queryClient = useQueryClient()
  const setAuth = useAuthStore((state: { setAuth: (payload: { user: any; tokens: any }) => void }) => state.setAuth)
  const user = useAuthStore((state: { user: any }) => state.user)
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState<ProfileUpdate>({
    fullName: '',
    email: '',
    department: '',
  })
  const [passwordForm, setPasswordForm] = useState<PasswordChange>({
    oldPassword: '',
    newPassword: '',
  })

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  })

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.fullName,
        email: profile.email,
        department: profile.department ?? '',
      })
    }
  }, [profile])

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => {
      toast.success('资料更新成功！', { icon: '✨' })
      const tokens = useAuthStore.getState().tokens
      if (tokens) {
        setAuth({ user: data, tokens })
      }
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新失败')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success('密码修改成功！', { icon: '🔒' })
      setPasswordForm({ oldPassword: '', newPassword: '' })
    },
    onError: (error: Error) => {
      toast.error(error.message || '修改失败')
    },
  })

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少6位')
      return
    }
    changePasswordMutation.mutate(passwordForm)
  }

  if (isLoading) {
    return <div className="placeholder">加载中…</div>
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
          <h1>个人设置</h1>
          <p className="muted">修改个人资料和密码</p>
        </div>
      </motion.div>

      <div className="tabs">
        <motion.button
          className={activeTab === 'profile' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('profile')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiUser /> 个人资料
        </motion.button>
        <motion.button
          className={activeTab === 'password' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('password')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiLock /> 修改密码
        </motion.button>
      </div>

      {activeTab === 'profile' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleProfileSubmit} className="form-grid">
            <label>
              用户名
              <input value={(profile as { username?: string })?.username ?? user?.username ?? ''} disabled />
            </label>
            <label>
              姓名 <span className="required">*</span>
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((prev: ProfileUpdate) => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </label>
            <label>
              邮箱 <span className="required">*</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </label>
            <label>
              所属学院
              <input
                value={profileForm.department}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, department: e.target.value }))}
              />
            </label>
            <motion.button
              type="submit"
              className="primary-button"
              disabled={updateProfileMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSave /> {updateProfileMutation.isPending ? '保存中…' : '保存修改'}
            </motion.button>
          </form>
        </motion.div>
      )}

      {activeTab === 'password' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handlePasswordSubmit} className="form-grid">
            <label>
              旧密码 <span className="required">*</span>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm((prev: PasswordChange) => ({ ...prev, oldPassword: e.target.value }))}
                required
              />
            </label>
            <label>
              新密码 <span className="required">*</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
              />
            </label>
            <motion.button
              type="submit"
              className="primary-button"
              disabled={changePasswordMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLock /> {changePasswordMutation.isPending ? '修改中…' : '修改密码'}
            </motion.button>
          </form>
        </motion.div>
      )}
    </section>
  )
}

export default ProfilePage

