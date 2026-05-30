import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Mountain, Menu, X, LogIn, LogOut, LayoutDashboard, Shield, ChevronDown } from 'lucide-react'
import Button from './Button'
import { useAuth, useLogout } from '../features/auth/auth.hooks'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/trips', label: 'Trips' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [mobileOpen])

  const linkClass = ({ isActive }) => {
    const base =
      'relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors'
    return isActive
      ? `${base} text-brand-primary after:bg-brand-primary`
      : `${base} text-brand-text hover:text-brand-primary after:bg-transparent`
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md shadow-sm ring-1 ring-black/5">
      <div className="px-6">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2 text-brand-primary shrink-0">
            <Mountain className="w-6 h-6" strokeWidth={2.25} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Outdoor Adventures
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <UserMenu user={user} />
            ) : (
              <Button to="/login" variant="secondary" size="sm">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg text-brand-text hover:bg-brand-primary/10 transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-black/5 shadow-lg px-6 animate-slide-down">
          <nav className="max-w-7xl mx-auto py-3 flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'text-brand-text hover:bg-brand-primary/10'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <MobileAuthSection isAuthenticated={isAuthenticated} user={user} />
          </nav>
        </div>
      )}
    </header>
  )
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const logout = useLogout()

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full ring-1 ring-black/10 hover:bg-brand-cream transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center">
          {initial}
        </span>
        <ChevronDown className="w-4 h-4 text-brand-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl ring-1 ring-black/5 shadow-lg py-2 animate-slide-down">
          <div className="px-4 py-2 border-b border-black/5">
            <div className="text-sm font-semibold text-brand-text truncate">{user?.name}</div>
            <div className="text-xs text-brand-muted truncate">{user?.email}</div>
          </div>
          {user?.role === 'ADMIN' ? (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream transition-colors"
            >
              <Shield className="w-4 h-4 text-brand-muted" />
              Admin
            </Link>
          ) : (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-muted" />
              My Bookings
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-cream transition-colors"
          >
            <LogOut className="w-4 h-4 text-brand-muted" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function MobileAuthSection({ isAuthenticated, user }) {
  const navigate = useNavigate()
  const logout = useLogout()

  if (!isAuthenticated) {
    return (
      <Button to="/login" variant="secondary" size="md" fullWidth className="mt-2">
        <LogIn className="w-4 h-4" />
        Sign In
      </Button>
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="mt-2 pt-2 border-t border-black/5">
      <div className="px-4 py-2">
        <div className="text-sm font-semibold text-brand-text truncate">{user?.name}</div>
        <div className="text-xs text-brand-muted truncate">{user?.email}</div>
      </div>
      {user?.role === 'ADMIN' ? (
        <NavLink
          to="/admin"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-brand-text hover:bg-brand-primary/10"
        >
          <Shield className="w-4 h-4" />
          Admin
        </NavLink>
      ) : (
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-brand-text hover:bg-brand-primary/10"
        >
          <LayoutDashboard className="w-4 h-4" />
          My Bookings
        </NavLink>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-brand-text hover:bg-brand-primary/10"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  )
}

export default Navbar
