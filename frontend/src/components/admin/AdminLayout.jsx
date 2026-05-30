import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Mountain,
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  ExternalLink,
  LogOut,
} from 'lucide-react'
import { useAuth, useLogout } from '../../features/auth/auth.hooks'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/trips', label: 'Trips', icon: Map },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
]

function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const logout = useLogout()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-brand-primary-dark text-white flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2 text-white">
            <Mountain className="w-6 h-6" strokeWidth={2.25} />
            <span className="font-display text-lg font-semibold tracking-tight">
              Outdoor Adventures
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View site
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-white ring-1 ring-black/5 shadow-sm sticky top-0 z-30">
          <div className="px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2 text-brand-primary">
              <Mountain className="w-6 h-6" strokeWidth={2.25} />
              <span className="font-display text-lg font-semibold">Admin</span>
            </div>
            <div className="hidden lg:block text-xs uppercase tracking-wider text-brand-primary font-semibold">
              Admin
            </div>
            <AdminUserMenu user={user} onLogout={handleLogout} />
          </div>

          {/* Mobile nav */}
          <nav className="lg:hidden px-6 pb-3 flex gap-1 overflow-x-auto">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                  className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-cream text-brand-text hover:bg-brand-primary/10'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminUserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const initial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl ring-1 ring-black/5 shadow-lg py-2 z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-black/5">
            <div className="text-sm font-semibold text-brand-text truncate">{user?.name}</div>
            <div className="mt-0.5 text-xs text-brand-muted truncate">{user?.email}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
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

export default AdminLayout
