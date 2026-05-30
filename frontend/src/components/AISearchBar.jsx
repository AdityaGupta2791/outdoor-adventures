import { forwardRef, useState } from 'react'
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react'
import { formatINR } from '../lib/format'

const EXAMPLE_QUERIES = [
  'beginner-friendly snow trek under ₹10k',
  'weekend camping near a river',
  'high-altitude expedition in Ladakh',
  '3-day hike for first-timers',
]

const difficultyLabel = {
  EASY: 'Easy',
  MODERATE: 'Moderate',
  DIFFICULT: 'Difficult',
  CHALLENGING: 'Challenging',
}

const AISearchBar = forwardRef(function AISearchBar(
  { value, onChange, onSubmit, onClear, result, isPending, error, autoFocus = false },
  ref,
) {
  const [hasFocus, setHasFocus] = useState(false)
  const hasResult = Boolean(result)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim().length < 3 || isPending) return
    onSubmit(value.trim())
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary">
          <Sparkles className="w-4 h-4" />
        </span>
        <div>
          <h3 className="font-semibold text-brand-text text-sm">Search with AI</h3>
          <p className="text-xs text-brand-muted">
            Describe what you want in your own words.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Sparkles
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
              hasFocus ? 'text-brand-primary' : 'text-brand-muted'
            }`}
          />
          <input
            ref={ref}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            autoFocus={autoFocus}
            placeholder="e.g. quiet 3-day trek near water, beginner-friendly, under ₹10k"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={value.trim().length < 3 || isPending}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-white text-sm font-semibold shadow-sm hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking…
            </>
          ) : (
            <>
              Search
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {!hasResult && !isPending && !error && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-brand-muted">Try:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                onChange(q)
                onSubmit(q)
              }}
              className="px-2.5 py-1 rounded-full bg-brand-cream text-xs text-brand-text hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {hasResult && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-sm text-brand-text leading-relaxed">
              <Sparkles className="inline w-3.5 h-3.5 mr-1 text-brand-primary -translate-y-px" />
              <span className="italic text-brand-muted">{result.filters.summary}</span>
            </p>
            <button
              type="button"
              onClick={onClear}
              className="shrink-0 inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-text transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip label="Category" value={titleCase(result.filters.category)} />
            <FilterChip
              label="Difficulty"
              value={difficultyLabel[result.filters.difficulty]}
            />
            <FilterChip
              label="Duration"
              value={formatDurationRange(
                result.filters.minDurationDays,
                result.filters.maxDurationDays,
              )}
            />
            <FilterChip
              label="Budget"
              value={formatPriceRange(
                result.filters.minPriceInRupees,
                result.filters.maxPriceInRupees,
              )}
            />
            <FilterChip label="Keyword" value={result.filters.locationOrKeyword} />
          </div>
        </div>
      )}
    </div>
  )
})

function FilterChip({ label, value }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
      <span className="text-brand-primary/70">{label}:</span>
      {value}
    </span>
  )
}

function titleCase(s) {
  if (!s) return null
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDurationRange(min, max) {
  if (min == null && max == null) return null
  if (min != null && max != null) {
    if (min === max) return `${min} day${min === 1 ? '' : 's'}`
    return `${min}–${max} days`
  }
  if (min != null) return `${min}+ days`
  return `up to ${max} days`
}

function formatPriceRange(min, max) {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${formatINR(min * 100)}–${formatINR(max * 100)}`
  if (max != null) return `under ${formatINR(max * 100)}`
  return `${formatINR(min * 100)}+`
}

export default AISearchBar
