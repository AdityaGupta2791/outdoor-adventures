import { useParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  Copy,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import { useBooking } from '../features/bookings/bookings.hooks'
import { useRazorpayCheckout } from '../features/bookings/payments.hooks'
import { formatINR, formatDateRange } from '../lib/format'

function BookingConfirmationPage() {
  const { id } = useParams()
  const { data: booking, isLoading, isError } = useBooking(id)
  const { startCheckout, isProcessing, error, clearError } = useRazorpayCheckout()

  if (isLoading) return <ConfirmationSkeleton />

  if (isError || !booking) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-semibold text-brand-text">
            Booking not found
          </h1>
          <p className="mt-3 text-brand-muted">
            The booking reference you opened doesn't exist or has been removed.
          </p>
          <Button to="/trips" variant="primary" size="md" className="mt-6">
            Browse trips
          </Button>
        </div>
      </div>
    )
  }

  const { trip } = booking.departure
  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                isConfirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {isConfirmed ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary">
              {isConfirmed ? 'Booking confirmed' : 'Reservation received'}
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold text-brand-text leading-tight">
            {isConfirmed
              ? `You're all set, ${booking.guestName.split(' ')[0]}!`
              : `Almost there, ${booking.guestName.split(' ')[0]}.`}
          </h1>
          <p className="mt-4 text-brand-muted max-w-xl mx-auto">
            {isConfirmed
              ? "Your payment was successful and your spot is confirmed. We've emailed your booking details."
              : 'Your seat is being held. Complete payment below to confirm your booking.'}
          </p>
        </div>

        {!isConfirmed && (
          <div className="mt-8 bg-white rounded-2xl ring-1 ring-brand-accent/30 shadow-sm p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand-text font-semibold">
                  <CreditCard className="w-5 h-5 text-brand-accent" />
                  Complete your payment
                </div>
                <p className="mt-1 text-sm text-brand-muted">
                  Pay securely via Razorpay to confirm your {booking.seatCount}-seat reservation.
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-bold tabular-nums text-brand-primary tracking-tight">
                  {formatINR(booking.totalAmountInPaise)}
                </div>
                <div className="text-xs text-brand-muted">total payable</div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-5"
              disabled={isProcessing}
              onClick={() => {
                clearError()
                startCheckout(booking)
              }}
            >
              {isProcessing ? 'Opening secure checkout…' : `Pay ${formatINR(booking.totalAmountInPaise)}`}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-muted">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secured by Razorpay · UPI, cards, net banking
            </p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 border-b border-black/5">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                Booking reference
              </div>
              <BookingRef value={booking.bookingRef} />
            </div>
            <StatusBadge status={booking.status} />
          </div>

          <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-black/5">
            <img
              src={trip.coverImage}
              alt=""
              className="w-full sm:col-span-1 aspect-[4/3] rounded-xl object-cover"
            />
            <div className="sm:col-span-2 min-w-0">
              <div className="font-display text-xl font-semibold text-brand-text leading-tight">
                <Link to={`/trips/${trip.slug}`} className="hover:text-brand-primary transition-colors">
                  {trip.title}
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
                <MapPin className="w-3.5 h-3.5" />
                {trip.location}
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <DetailRow
                  icon={Calendar}
                  label="Departure"
                  value={formatDateRange(booking.departure.startDate, booking.departure.endDate)}
                />
                <DetailRow
                  icon={Users}
                  label="Travellers"
                  value={`${booking.seatCount} seat${booking.seatCount === 1 ? '' : 's'}`}
                />
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-black/5">
            <DetailRow icon={Mail} label="Email" value={booking.guestEmail} />
            <DetailRow icon={Phone} label="Phone" value={booking.guestPhone} />
          </div>

          <div className="px-6 sm:px-8 py-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                Total
              </div>
              <div className="mt-1 text-xs text-brand-muted">
                {booking.seatCount} × {formatINR(booking.departure.priceInPaise)}
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums text-brand-primary tracking-tight">
              {formatINR(booking.totalAmountInPaise)}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-brand-primary/5 ring-1 ring-brand-primary/20 rounded-2xl p-5 sm:p-6 text-sm text-brand-text">
          <h3 className="font-semibold mb-2">What happens next</h3>
          <ul className="space-y-1.5 text-brand-muted">
            {isConfirmed ? (
              <>
                <li>• A confirmation has been sent to <strong className="text-brand-text">{booking.guestEmail}</strong>.</li>
                <li>• Our team will share a packing checklist and trip prep guidance soon.</li>
                <li>• Keep your reference <strong className="text-brand-text">{booking.bookingRef}</strong> handy.</li>
              </>
            ) : (
              <>
                <li>• Complete payment above to lock in your seat{booking.seatCount === 1 ? '' : 's'}.</li>
                <li>• Your seat is held while your reservation is pending.</li>
                <li>• Save your reference <strong className="text-brand-text">{booking.bookingRef}</strong> for any queries.</li>
              </>
            )}
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <Button to="/trips" variant={isConfirmed ? 'primary' : 'light'} size="md">
            Browse more trips
          </Button>
          <Button to="/" variant="light" size="md">
            Back to home
          </Button>
        </div>
      </div>
    </div>
  )
}

function BookingRef({ value }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="mt-1 inline-flex items-center gap-2 font-mono text-xl font-semibold text-brand-primary tracking-wide hover:opacity-80 transition-opacity"
      title="Copy booking reference"
    >
      {value}
      <Copy className="w-4 h-4" />
      {copied && <span className="text-xs text-green-600">Copied</span>}
    </button>
  )
}

function StatusBadge({ status }) {
  const map = {
    PENDING: { label: 'Pending payment', cls: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Confirmed', cls: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-800' },
    REFUNDED: { label: 'Refunded', cls: 'bg-gray-100 text-gray-800' },
  }
  const cfg = map[status] ?? map.PENDING
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
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

function ConfirmationSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mx-auto" />
          <div className="mt-6 h-8 bg-gray-200 rounded animate-pulse w-2/3 mx-auto" />
        </div>
        <div className="mt-10 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmationPage
