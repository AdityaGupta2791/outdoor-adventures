import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth.hooks'
import FullPageLoader from '../FullPageLoader'

function AdminRoute({ children }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }
  return children
}

export default AdminRoute
