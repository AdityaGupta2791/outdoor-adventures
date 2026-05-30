import { Link } from 'react-router-dom'
import { Mountain } from 'lucide-react'

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-primary">
            <Mountain className="w-7 h-7" strokeWidth={2.25} />
            <span className="font-display text-2xl font-semibold tracking-tight">
              Outdoor Adventures
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-7 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-brand-text text-center">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-brand-muted text-center">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm text-brand-muted">{footer}</div>}
      </div>
    </div>
  )
}

export default AuthShell
