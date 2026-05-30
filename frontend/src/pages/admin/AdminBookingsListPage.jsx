import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Pencil, X } from 'lucide-react'
import Button from '../../components/Button'
import {
  useAdminBookings,
  useAdminDeleteBooking,
  useAdminUpdateBookingStatus,
} from '../../features/admin/admin.hooks'
import { useDebounce } from '../../hooks/useDebounce'
import { formatINR, formatDateRange } from '../../lib/format'

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

// Allowed forward transitions; terminal statuses can't change.
const VALID_BOOKING_TRANSITIONS = {
  PENDING: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CONFIRMED', 'REFUNDED', 'CANCELLED'],
  CANCELLED: ['CANCELLED'],
  REFUNDED: ['REFUNDED'],
}

const STATUS_LABEL = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

const isTerminalStatus = (s) => s === 'CANCELLED' || s === 'REFUNDED'

function AdminBookingsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 300)
  const [page, setPage] = useState(1)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      ...(statusFilter && { status: statusFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
    }),
    [page, statusFilter, debouncedSearch],
  )

  const { data, isLoading, isError } = useAdminBookings(params)
  const deleteBooking = useAdminDeleteBooking()
  const [editingBooking, setEditingBooking] = useState(null)

  const handleDelete = (e, b) => {
    e.stopPropagation()
    const isPaid = b.status === 'CONFIRMED'
    const warn = isPaid
      ? `\n\n⚠ This booking was CONFIRMED (paid). Deleting will erase the financial record.`
      : ''
    if (
      !window.confirm(
        `Permanently delete ${b.bookingRef}? This cannot be undone.${warn}`,
      )
    ) {
      return
    }
    deleteBooking.mutate(b.id, {
      onError: (err) => {
        window.alert(err?.response?.data?.error?.message || 'Failed to delete booking')
      },
    })
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          All reservations across guests and registered users.
        </p>
      </header>

      <div className="mb-5 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search by ref, email, name…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {isError && <div className="text-center py-12 text-red-600">Failed to load bookings.</div>}

      <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/60 text-xs uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Reference</th>
                <th className="text-left px-5 py-3 font-semibold">Guest</th>
                <th className="text-left px-5 py-3 font-semibold">Trip</th>
                <th className="text-left px-5 py-3 font-semibold">Departure</th>
                <th className="text-center px-5 py-3 font-semibold">Seats</th>
                <th className="text-right px-5 py-3 font-semibold">Total</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.bookings.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      className="hover:bg-brand-cream/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs font-semibold text-brand-primary">
                          {b.bookingRef}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-brand-text">{b.guestName}</div>
                        <div className="text-xs text-brand-muted truncate max-w-[15rem]">
                          {b.guestEmail}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-brand-muted truncate max-w-[14rem]">
                        {b.departure.trip.title}
                      </td>
                      <td className="px-5 py-3 text-brand-muted text-xs">
                        {formatDateRange(b.departure.startDate, b.departure.endDate)}
                      </td>
                      <td className="px-5 py-3 text-center text-brand-muted">{b.seatCount}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-brand-primary">
                        {formatINR(b.totalAmountInPaise)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            statusStyles[b.status] ?? statusStyles.PENDING
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingBooking(b)
                            }}
                            disabled={isTerminalStatus(b.status)}
                            className="p-2 rounded-lg text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-muted"
                            title={
                              isTerminalStatus(b.status)
                                ? `${STATUS_LABEL[b.status]} is a final status`
                                : 'Change status'
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, b)}
                            disabled={deleteBooking.isPending}
                            className="p-2 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!isLoading && data?.bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-brand-muted">
                    No bookings match your filters.
                  </td>
                </tr>
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

      {editingBooking && (
        <StatusEditModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </div>
  )
}

function StatusEditModal({ booking, onClose }) {
  const [newStatus, setNewStatus] = useState(booking.status)
  const [error, setError] = useState(null)
  const updateStatus = useAdminUpdateBookingStatus()

  const handleSave = async () => {
    if (newStatus === booking.status) {
      onClose()
      return
    }
    setError(null)
    try {
      await updateStatus.mutateAsync({ id: booking.id, status: newStatus })
      onClose()
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to update status')
    }
  }

  const options = VALID_BOOKING_TRANSITIONS[booking.status] ?? [booking.status]
  const wasActive = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  const willBeActive = newStatus === 'PENDING' || newStatus === 'CONFIRMED'
  const seatHint =
    newStatus !== booking.status && wasActive && !willBeActive
      ? `Seats will be released back to the departure.`
      : null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl ring-1 ring-black/5 shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h3 className="font-semibold text-brand-text">Change booking status</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-cream transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
              Booking
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-brand-primary">
                {booking.bookingRef}
              </span>
              <span className="text-sm text-brand-muted">— {booking.guestName}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-text mb-1.5">
              New status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors"
            >
              {options.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                  {s === booking.status ? ' (current)' : ''}
                </option>
              ))}
            </select>
            {seatHint && (
              <p className="mt-2 text-xs text-brand-muted">{seatHint}</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 px-5 py-4 border-t border-black/5">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? 'Saving…' : 'Save'}
          </Button>
        </footer>
      </div>
    </div>
  )
}

export default AdminBookingsListPage
