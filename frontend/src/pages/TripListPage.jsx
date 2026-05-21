import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SearchX } from 'lucide-react'
import { useTrips, useCategories } from '../features/trips/trips.hooks'
import { useDebounce } from '../hooks/useDebounce'
import TripCard from '../components/TripCard'
import { TripCardSkeletonGrid } from '../components/TripCardSkeleton'
import SectionHeader from '../components/SectionHeader'
import Button from '../components/Button'

const difficulties = [
  { value: '', label: 'All levels' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'DIFFICULT', label: 'Difficult' },
  { value: 'CHALLENGING', label: 'Challenging' },
]

function TripListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const category = searchParams.get('category') ?? ''
  const difficulty = searchParams.get('difficulty') ?? ''
  const searchParam = searchParams.get('search') ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  const [searchInput, setSearchInput] = useState(searchParam)
  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    if (debouncedSearch === searchParam) return
    const next = new URLSearchParams(searchParams)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    next.delete('page')
    setSearchParams(next, { replace: true })
  }, [debouncedSearch])

  useEffect(() => {
    if (searchParam !== searchInput) setSearchInput(searchParam)
  }, [searchParam])

  const queryParams = useMemo(() => {
    const p = { page, limit: 12 }
    if (category) p.category = category
    if (difficulty) p.difficulty = difficulty
    if (debouncedSearch) p.search = debouncedSearch
    return p
  }, [page, category, difficulty, debouncedSearch])

  const { data, isLoading, isError, isFetching } = useTrips(queryParams)
  const { data: categories } = useCategories()

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const clearAll = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = Boolean(category || difficulty || debouncedSearch)

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Browse trips"
          title="Discover your next adventure"
          description="Curated treks, camps and hikes across India — handpicked for every skill level."
          size="lg"
          className="mb-10"
        />

        <div className="mb-8 p-4 bg-white rounded-2xl shadow-sm ring-1 ring-black/5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="search"
                placeholder="Search trips by name or location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
              />
            </div>

            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
            >
              <option value="">All categories</option>
              {categories?.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c._count.trips})
                </option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => updateParam('difficulty', e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
            >
              {difficulties.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {hasFilters && (
              <Button variant="ghost" size="md" onClick={clearAll}>
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading && <TripCardSkeletonGrid count={6} />}

        {isError && (
          <div className="text-center py-16 text-red-600">
            Something went wrong loading trips. Please refresh.
          </div>
        )}

        {data && data.trips.length === 0 && (
          <EmptyState hasFilters={hasFilters} onClear={clearAll} />
        )}

        {data && data.trips.length > 0 && (
          <>
            <div className="mb-4 text-sm text-brand-muted">
              Showing {data.trips.length} of {data.pagination.total} trips
              {isFetching && <span className="ml-2 opacity-60">updating...</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={data.pagination.totalPages}
                onChange={(p) => updateParam('page', String(p))}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-5">
        <SearchX className="w-7 h-7" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">
        No trips match your search
      </h2>
      <p className="mt-2 text-brand-muted max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your filters or clearing them to see more options.'
          : 'Check back soon — new trips are added regularly.'}
      </p>
      {hasFilters && (
        <Button variant="primary" size="md" onClick={onClear} className="mt-6">
          <X className="w-4 h-4" />
          Clear all filters
        </Button>
      )}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="mt-10 flex justify-center items-center gap-2">
      <Button
        variant="outline"
        size="md"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <span className="px-4 text-sm text-brand-muted">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="md"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}

export default TripListPage
