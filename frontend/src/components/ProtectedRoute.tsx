import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  requiredRole?: string | string[]
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps = {}) => {
  const isAuthenticated = useAuthStore((state) => Boolean(state.tokens?.accessToken))
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRequiredRole = user?.roles?.some((role) => roles.includes(role)) ?? false
    if (!hasRequiredRole) {
      return <Navigate to="/resources" replace />
    }
  }

  return <Outlet />
}

export default ProtectedRoute
