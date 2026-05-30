import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth.hooks'
import FullPageLoader from '../FullPageLoader'

// Blocks authenticated users from auth-only pages (login/signup).
function GuestOnlyRoute({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullPageLoader />
  if (status === 'authenticated') {
    const dest = location.state?.from ?? '/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

export default GuestOnlyRoute
