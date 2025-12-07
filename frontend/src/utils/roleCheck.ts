import { useAuthStore } from '../store/authStore'

export const hasRole = (role: string): boolean => {
  const user = useAuthStore.getState().user
  return user?.roles?.includes(role) ?? false
}

export const isAdmin = (): boolean => hasRole('ADMIN')
export const isTeacher = (): boolean => hasRole('TEACHER')
export const isStudent = (): boolean => hasRole('STUDENT')

export const useRoleCheck = () => {
  const user = useAuthStore((state) => state.user)
  return {
    isAdmin: user?.roles?.includes('ADMIN') ?? false,
    isTeacher: user?.roles?.includes('TEACHER') ?? false,
    isStudent: user?.roles?.includes('STUDENT') ?? false,
    hasRole: (role: string) => user?.roles?.includes(role) ?? false,
  }
}

