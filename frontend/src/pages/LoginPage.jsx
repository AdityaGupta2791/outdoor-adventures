import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthShell from '../components/auth/AuthShell'
import GoogleButton from '../components/auth/GoogleButton'
import Button from '../components/Button'
import { useLogin, useProviders } from '../features/auth/auth.hooks'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

function LoginPage() {
  useDocumentTitle('Sign in')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isPending, error, clearError } = useLogin()
  const providers = useProviders()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    clearError()
    try {
      const user = await login(values)
      const dest =
        location.state?.from ?? (user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
      navigate(dest, { replace: true })
    } catch {
      /* error surfaced via hook */
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to view your bookings and trip prep."
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/signup"
            state={location.state}
            className="font-semibold text-brand-primary hover:underline"
          >
            Sign up
          </Link>
        </>
      }
    >
      {providers.google && (
        <>
          <GoogleButton label="Sign in with Google" />
          <Divider />
        </>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Field label="Email address" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className={inputClass(errors.email)}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            {...register('password')}
            className={inputClass(errors.password)}
          />
        </Field>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="md" fullWidth disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-brand-muted uppercase tracking-wider">or</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-text mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full px-4 py-2.5 rounded-lg bg-white border ${
    error ? 'border-red-400' : 'border-gray-300'
  } focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors`
}

export default LoginPage
