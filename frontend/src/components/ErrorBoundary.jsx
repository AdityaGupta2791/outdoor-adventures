import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, info)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.assign('/')
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-brand-cream">
        <div className="max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-100 text-red-600 mb-6">
            <AlertTriangle className="w-9 h-9" strokeWidth={1.75} />
          </div>
          <p className="font-mono text-sm font-semibold text-red-600 uppercase tracking-wider">
            Something went wrong
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-brand-text leading-[1.1]">
            We hit a snag.
          </h1>
          <p className="mt-4 text-brand-muted leading-relaxed">
            An unexpected error stopped the page from loading. Try reloading — if it
            keeps happening, head back to the home page.
          </p>
          {import.meta.env.DEV && (
            <pre className="mt-6 p-3 rounded-lg bg-red-50 ring-1 ring-red-200 text-xs text-red-800 text-left overflow-auto max-h-40">
              {this.state.error?.message || String(this.state.error)}
            </pre>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold shadow-sm hover:bg-brand-primary-dark transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reload page
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-brand-text text-sm font-semibold ring-1 ring-gray-300 hover:ring-brand-primary hover:text-brand-primary transition-colors"
            >
              <Home className="w-4 h-4" />
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
