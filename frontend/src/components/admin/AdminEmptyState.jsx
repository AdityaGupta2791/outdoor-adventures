import { Link } from 'react-router-dom'
import { FilterX } from 'lucide-react'

/**
 * Branded empty state for admin tables.
 * Distinguishes between "no data ever" (first-run) and "filters returned nothing".
 *
 * Props:
 *   icon: lucide icon component
 *   hasFilters: whether any filter is active (chooses copy + CTA)
 *   firstRun: { heading, body, cta? }  — shown when hasFilters is false
 *   filtered: { heading, body, onClear }  — shown when hasFilters is true
 *   colSpan: column-span when rendered inside a <td>
 */
function AdminEmptyState({ icon: Icon, hasFilters, firstRun, filtered, colSpan = 1 }) {
  const content = hasFilters ? (
    <FilteredEmpty heading={filtered.heading} body={filtered.body} onClear={filtered.onClear} />
  ) : (
    <FirstRunEmpty Icon={Icon} heading={firstRun.heading} body={firstRun.body} cta={firstRun.cta} />
  )

  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12">
        {content}
      </td>
    </tr>
  )
}

function FirstRunEmpty({ Icon, heading, body, cta }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary mb-4">
        <Icon className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-xl font-semibold text-brand-text">{heading}</h3>
      <p className="mt-1.5 text-sm text-brand-muted">{body}</p>
      {cta && (
        <Link
          to={cta.to}
          className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold shadow-sm hover:bg-brand-primary-dark transition-colors"
        >
          {cta.icon && <cta.icon className="w-4 h-4" />}
          {cta.label}
        </Link>
      )}
    </div>
  )
}

function FilteredEmpty({ heading, body, onClear }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-brand-muted mb-3">
        <FilterX className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <h3 className="font-semibold text-brand-text">{heading}</h3>
      <p className="mt-1 text-sm text-brand-muted">{body}</p>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 text-sm font-semibold text-brand-primary hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

export default AdminEmptyState
