import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/auth.hooks'

function AuthCallbackPage() {
  const { status } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard', { replace: true })
    } else if (status === 'unauthenticated') {
      navigate('/login?error=oauth', { replace: true })
    }
  }, [status, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
      <p className="text-sm text-brand-muted">Signing you in…</p>
    </div>
  )
}

export default AuthCallbackPage
