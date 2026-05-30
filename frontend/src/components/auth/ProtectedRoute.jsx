import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth.hooks'
import FullPageLoader from '../FullPageLoader'

function ProtectedRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export default ProtectedRoute
