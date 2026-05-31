import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, Users, Ticket, MapPin, XCircle } from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/Button'
import { useAdminBooking, useAdminCancelBooking } from '../../features/admin/admin.hooks'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatINR, formatDateRange } from '../../lib/format'

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

function AdminBookingDetailPage() {
  const { id } = useParams()
  const { data: booking, isLoading, isError } = useAdminBooking(id)
  useDocumentTitle(booking ? `Admin · ${booking.bookingRef}` : 'Admin · Booking')
  const cancel = useAdminCancelBooking()
  const [error, setError] = useState(null)

  if (isLoading) return <div className="text-brand-muted">Loading booking…</div>
  if (isError || !booking) return <div className="text-red-600">Booking not found.</div>

  const handleCancel = async () => {
    if (!window.confirm(`Cancel ${booking.bookingRef}? Seats will be released.`)) return
    setError(null)
    try {
      await cancel.mutateAsync(booking.id)
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to cancel booking')
    }
  }

  const { trip } = booking.departure
  const cancellable = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/bookings"
        className="inline-flex items-center gap-1 mb-4 text-sm text-brand-muted hover:text-brand-text"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to bookings
      </Link>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xl font-semibold text-brand-primary">
              {booking.bookingRef}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                statusStyles[booking.status] ?? statusStyles.PENDING
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="mt-1 text-sm text-brand-muted">
            Created {new Date(booking.createdAt).toLocaleString('en-IN')}
          </div>
        </div>
        {cancellable && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleCancel}
            disabled={cancel.isPending}
          >
            <XCircle className="w-4 h-4" />
            {cancel.isPending ? 'Cancelling…' : 'Cancel booking'}
          </Button>
        )}
      </header>

      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5 sm:p-6 mb-5">
        <h2 className="font-semibold text-brand-text mb-4">Trip</h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          <img
            src={trip.coverImage}
            alt=""
            className="w-full sm:w-40 aspect-[4/3] sm:aspect-auto sm:h-32 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Link
              to={`/admin/trips/${trip.id}`}
              className="font-display text-xl font-semibold text-brand-text hover:text-brand-primary leading-tight"
            >
              {trip.title}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {trip.location}
              </span>
              {trip.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-medium">
                  {trip.category.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-black/5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <DetailRow
            icon={Calendar}
            label="Departure"
            value={formatDateRange(booking.departure.startDate, booking.departure.endDate)}
          />
          <DetailRow
            icon={Users}
            label="Seats"
            value={`${booking.seatCount} × ${formatINR(booking.totalAmountInPaise / booking.seatCount)}`}
          />
          <DetailRow icon={Ticket} label="Total" value={formatINR(booking.totalAmountInPaise)} />
        </div>
      </section>

      <section className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5 sm:p-6 mb-5">
        <h2 className="font-semibold text-brand-text mb-4">Customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <DetailRow icon={Mail} label="Email" value={booking.guestEmail} />
          <DetailRow icon={Phone} label="Phone" value={booking.guestPhone} />
          <DetailRow icon={Users} label="Guest name" value={booking.guestName} />
          <DetailRow
            icon={Users}
            label="User account"
            value={
              booking.user
                ? `${booking.user.name} (${booking.user.email})`
                : 'Guest booking (no account)'
            }
          />
        </div>
      </section>

      {booking.payment && (
        <section className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5 sm:p-6">
          <h2 className="font-semibold text-brand-text mb-4">Payment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                Status
              </div>
              <div className="mt-1 font-medium">{booking.payment.status}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                Razorpay Order
              </div>
              <div className="mt-1 font-mono text-xs break-all">
                {booking.payment.razorpayOrderId}
              </div>
            </div>
            {booking.payment.razorpayPaymentId && (
              <div className="sm:col-span-2">
                <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                  Razorpay Payment
                </div>
                <div className="mt-1 font-mono text-xs break-all">
                  {booking.payment.razorpayPaymentId}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
        {label}
      </div>
      <div className="mt-1 inline-flex items-center gap-1.5 text-brand-text">
        <Icon className="w-3.5 h-3.5 text-brand-primary" />
        {value}
      </div>
    </div>
  )
}

export default AdminBookingDetailPage
