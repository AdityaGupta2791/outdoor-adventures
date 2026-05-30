import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Compass, Ticket } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import Button from '../components/Button'
import { useAuth } from '../features/auth/auth.hooks'
import { useMyBookings } from '../features/bookings/bookings.hooks'
import { formatINR, formatDateRange } from '../lib/format'

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

const statusLabel = {
  PENDING: 'Pending payment',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
}

function DashboardPage() {
  const { user } = useAuth()
  const { data: bookings, isLoading, isError } = useMyBookings()

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          eyebrow={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
          title="My Bookings"
          description="All your reservations and confirmed trips in one place."
          size="lg"
          className="mb-10"
        />

        {isLoading && <ListSkeleton />}

        {isError && (
          <div className="text-center py-16 text-red-600">
            Couldn't load your bookings. Please refresh.
          </div>
        )}

        {bookings && bookings.length === 0 && <EmptyState />}

        {bookings && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingRow({ booking }) {
  const { trip } = booking.departure
  return (
    <Link
      to={`/bookings/${booking.id}`}
      className="group flex flex-col sm:flex-row gap-4 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow p-4"
    >
      <img
        src={trip.coverImage}
        alt=""
        className="w-full sm:w-40 aspect-[4/3] sm:aspect-auto object-cover rounded-xl shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg font-semibold text-brand-text leading-tight group-hover:text-brand-primary transition-colors">
              {trip.title}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <MapPin className="w-3.5 h-3.5" />
              {trip.location}
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              statusStyles[booking.status] ?? statusStyles.PENDING
            }`}
          >
            {statusLabel[booking.status] ?? booking.status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-brand-muted">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            {formatDateRange(booking.departure.startDate, booking.departure.endDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-primary" />
            {booking.seatCount} seat{booking.seatCount === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-xs">
            <Ticket className="w-3.5 h-3.5 text-brand-primary" />
            {booking.bookingRef}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between">
          <span className="text-sm text-brand-muted">Total</span>
          <span className="font-bold tabular-nums text-brand-primary">
            {formatINR(booking.totalAmountInPaise)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20 px-6 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-5">
        <Compass className="w-7 h-7" />
      </div>
      <h2 className="font-display text-2xl font-semibold text-brand-text">No bookings yet</h2>
      <p className="mt-2 text-brand-muted max-w-md mx-auto">
        Your booked adventures will show up here. Ready to find your first one?
      </p>
      <Button to="/trips" variant="primary" size="md" className="mt-6">
        <Compass className="w-4 h-4" />
        Browse trips
      </Button>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 bg-white rounded-2xl ring-1 ring-black/5 p-4">
          <div className="w-40 h-28 bg-gray-200 rounded-xl animate-pulse shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardPage
