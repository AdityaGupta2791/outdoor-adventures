import { Compass, ArrowLeft } from 'lucide-react'
import Button from '../components/Button'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function NotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 bg-brand-cream">
      <div className="max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-primary/10 text-brand-primary mb-6">
          <Compass className="w-9 h-9" strokeWidth={1.75} />
        </div>
        <p className="font-mono text-sm font-semibold text-brand-accent uppercase tracking-wider">
          404 — Off the trail
        </p>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold text-brand-text leading-[1.1]">
          This page wandered off.
        </h1>
        <p className="mt-4 text-brand-muted leading-relaxed">
          The link may be broken, or the trip may have been archived. Head back to base
          and pick a fresh adventure.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button to="/" variant="primary" size="md">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Button>
          <Button to="/trips" variant="outline" size="md">
            Browse trips
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
