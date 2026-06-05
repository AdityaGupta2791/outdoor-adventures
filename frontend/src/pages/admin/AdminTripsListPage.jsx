import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, X, Map } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../../components/Button'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import {
  useAdminTrips,
  useAdminDeleteTrip,
  useAdminCategories,
} from '../../features/admin/admin.hooks'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatINR, difficultyLabel } from '../../lib/format'

const statusStyles = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-amber-100 text-amber-800',
}

function AdminTripsListPage() {
  useDocumentTitle('Admin · Trips')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(statusFilter && { status: statusFilter }),
      ...(categoryFilter && { category: categoryFilter }),
      ...(difficultyFilter && { difficulty: difficultyFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, statusFilter, categoryFilter, difficultyFilter, debouncedSearch],
  )

  const { data, isLoading, isError } = useAdminTrips(params)
  const { data: categories } = useAdminCategories()
  const deleteTrip = useAdminDeleteTrip()

  const hasFilters = Boolean(
    statusFilter || categoryFilter || difficultyFilter || debouncedSearch,
  )

  const clearAll = () => {
    setStatusFilter('')
    setCategoryFilter('')
    setDifficultyFilter('')
    setSearchInput('')
    setPage(1)
  }

  const handleDelete = (trip) => {
    if (
      !window.confirm(
        `Permanently delete "${trip.title}"? This cannot be undone.\n\nTip: if this trip has bookings, archive it instead via Edit → Status.`,
      )
    ) {
      return
    }
    deleteTrip.mutate(trip.id, {
      onSuccess: () => toast.success(`Deleted "${trip.title}"`),
      onError: (err) =>
        toast.error(err?.response?.data?.error?.message || 'Failed to delete trip'),
    })
  }

  return (
    <div>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">
            Trips
          </h1>
          <p className="mt-1 text-sm text-brand-muted">Manage your catalog.</p>
        </div>
        <Button to="/admin/trips/new" variant="primary" size="md">
          <Plus className="w-4 h-4" />
          New trip
        </Button>
      </header>

      <div className="mb-5 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search by title, slug, location…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => {
            setDifficultyFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
        >
          <option value="">All levels</option>
          <option value="EASY">Easy</option>
          <option value="MODERATE">Moderate</option>
          <option value="DIFFICULT">Difficult</option>
          <option value="CHALLENGING">Challenging</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-sm text-brand-muted hover:text-brand-text hover:bg-brand-cream transition-colors"
            title="Clear all filters"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {isError && <div className="text-center py-12 text-red-600">Failed to load trips.</div>}

      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/60 text-xs uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Trip</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">Difficulty</th>
                <th className="text-right px-5 py-3 font-semibold">Price</th>
                <th className="text-center px-5 py-3 font-semibold">Departures</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-brand-cream/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={trip.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-brand-text truncate max-w-[20rem]">
                              {trip.title}
                            </div>
                            <div className="text-xs text-brand-muted truncate max-w-[20rem]">
                              {trip.location} · {trip.durationDays} days
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-brand-muted">{trip.category.name}</td>
                      <td className="px-5 py-3 text-brand-muted">
                        {difficultyLabel(trip.difficulty)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-primary">
                        {formatINR(trip.basePriceInPaise)}
                      </td>
                      <td className="px-5 py-3 text-center text-brand-muted">
                        {trip._count.departures}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            statusStyles[trip.status] ?? statusStyles.DRAFT
                          }`}
                        >
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/trips/${trip.id}`}
                            className="p-2 rounded-lg hover:bg-brand-primary/10 text-brand-muted hover:text-brand-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(trip)}
                            disabled={deleteTrip.isPending}
                            className="p-2 rounded-lg hover:bg-red-50 text-brand-muted hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete (only trips without bookings)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && data?.trips.length === 0 && (
                <AdminEmptyState
                  icon={Map}
                  colSpan={7}
                  hasFilters={hasFilters}
                  firstRun={{
                    heading: 'No trips yet',
                    body: 'Add your first trip to start building the catalog. You can publish it now or save as a draft.',
                    cta: { to: '/admin/trips/new', label: 'Add your first trip', icon: Plus },
                  }}
                  filtered={{
                    heading: 'No trips match these filters',
                    body: 'Try clearing some filters or adjusting your search.',
                    onClear: clearAll,
                  }}
                />
              )}
            </tbody>
          </table>
        </div>
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/5 text-sm">
            <span className="text-brand-muted">
              Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total}{' '}
              total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTripsListPage
