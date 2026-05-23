import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Mountain, Menu, X, LogIn } from 'lucide-react'
import Button from './Button'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/trips', label: 'Trips' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

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
            <Button variant="secondary" size="sm">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
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
            <Button variant="secondary" size="md" fullWidth className="mt-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
