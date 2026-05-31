import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Minus,
  Plus,
} from 'lucide-react'
import Button from '../components/Button'
import { useTrip } from '../features/trips/trips.hooks'
import { useCreateBooking } from '../features/bookings/bookings.hooks'
import { useRazorpayCheckout } from '../features/bookings/payments.hooks'
import { loadRazorpayScript } from '../features/bookings/payments.api'
import { formatINR, formatDateRange, difficultyLabel } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const schema = z.object({
  guestName: z.string().trim().min(2, 'Please enter your full name').max(100),
  guestEmail: z.string().trim().toLowerCase().email('Enter a valid email address'),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  seatCount: z.coerce.number().int().min(1).max(10),
})

function BookingPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const departureId = searchParams.get('departureId')
  const navigate = useNavigate()

  const { data: trip, isLoading } = useTrip(slug)
  useDocumentTitle(trip ? `Book — ${trip.title}` : 'Book your trip')
  const createBooking = useCreateBooking()
  const { startCheckout, isProcessing, error: paymentError } = useRazorpayCheckout()
  const [pendingBooking, setPendingBooking] = useState(null)

  const departure = useMemo(
    () => trip?.departures?.find((d) => d.id === departureId),
    [trip, departureId],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guestName: '', guestEmail: '', guestPhone: '', seatCount: 1 },
  })

  const seatCount = Number(watch('seatCount')) || 1
  const maxSeats = Math.min(10, departure?.availableSeats ?? 10)

  useEffect(() => {
    if (seatCount > maxSeats) setValue('seatCount', maxSeats)
  }, [maxSeats, seatCount, setValue])

  useEffect(() => {
    loadRazorpayScript()
  }, [])

  if (isLoading) return <PageSkeleton />

  if (!trip) {
    return (
      <FallbackMessage
        title="Trip not found"
        body="The trip you tried to book doesn't exist anymore."
        ctaLabel="Browse all trips"
        ctaTo="/trips"
      />
    )
  }

  if (!departure) {
    return (
      <FallbackMessage
        title="Departure unavailable"
        body="This departure is no longer available. Please pick another date from the trip page."
        ctaLabel="Back to trip"
        ctaTo={`/trips/${slug}`}
      />
    )
  }

  const totalAmount = (departure.priceInPaise ?? 0) * seatCount

  const onSubmit = async (values) => {
    try {
      // Reuse the already-created booking on retry so we never double-book / double-decrement seats
      let booking = pendingBooking
      if (!booking) {
        booking = await createBooking.mutateAsync({
          departureId,
          ...values,
          seatCount: Number(values.seatCount),
        })
        setPendingBooking(booking)
      }

      const result = await startCheckout(booking)
      if (result?.status === 'confirmed') {
        navigate(`/bookings/${booking.id}`, { replace: true })
      }
      // dismissed / failed → stay here; button becomes "Retry payment", paymentError shows
    } catch (err) {
      const apiMessage = err?.response?.data?.error?.message
      setError('root.serverError', {
        type: 'server',
        message: apiMessage || 'Something went wrong creating your booking. Please try again.',
      })
    }
  }

  const serverError = errors.root?.serverError?.message || paymentError
  const busy = createBooking.isPending || isProcessing

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <Link
          to={`/trips/${slug}`}
          className="inline-flex items-center gap-1 mb-6 text-sm text-brand-muted hover:text-brand-text"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {trip.title}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 ring-1 ring-black/5 shadow-sm space-y-6"
            noValidate
          >
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary">
                Reserve your spot
              </span>
              <h1 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-brand-text leading-tight">
                Tell us who's coming
              </h1>
              <p className="mt-2 text-sm text-brand-muted">
                We'll use these details to confirm your reservation and send trip prep guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full name" error={errors.guestName?.message}>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  {...register('guestName')}
                  className={inputClass(errors.guestName)}
                />
              </Field>
              <Field label="Email address" error={errors.guestEmail?.message}>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...register('guestEmail')}
                  className={inputClass(errors.guestEmail)}
                />
              </Field>
            </div>

            <Field
              label="Phone number"
              error={errors.guestPhone?.message}
              hint="10-digit Indian mobile number"
            >
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="9876543210"
                {...register('guestPhone')}
                className={inputClass(errors.guestPhone)}
              />
            </Field>

            <Field label="Number of travellers" error={errors.seatCount?.message}>
              <SeatCounter
                value={seatCount}
                max={maxSeats}
                onChange={(n) => setValue('seatCount', n, { shouldValidate: true })}
              />
            </Field>

            {serverError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                as="button"
                onClick={() => navigate(`/trips/${slug}`)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={busy}>
                {createBooking.isPending
                  ? 'Reserving…'
                  : isProcessing
                    ? 'Opening payment…'
                    : pendingBooking
                      ? `Retry payment · ${formatINR(totalAmount)}`
                      : `Reserve & Pay · ${formatINR(totalAmount)}`}
              </Button>
            </div>
          </form>

          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl p-6 ring-1 ring-black/5 shadow-sm space-y-5">
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-brand-muted">
                  Trip Summary
                </h3>
                <div className="mt-3 flex gap-3">
                  <img
                    src={trip.coverImage}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-brand-text leading-tight line-clamp-2">
                      {trip.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-brand-muted">
                      <MapPin className="w-3 h-3" />
                      {trip.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <SummaryRow
                  icon={Calendar}
                  label="Departure"
                  value={formatDateRange(departure.startDate, departure.endDate)}
                />
                <SummaryRow icon={Clock} label="Duration" value={`${trip.durationDays} days`} />
                <SummaryRow
                  icon={TrendingUp}
                  label="Difficulty"
                  value={difficultyLabel(trip.difficulty)}
                />
                <SummaryRow
                  icon={Users}
                  label="Seats left"
                  value={`${departure.availableSeats} of ${departure.totalSeats}`}
                />
              </div>

              <div className="pt-5 border-t border-black/5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-muted">
                    {formatINR(departure.priceInPaise)} × {seatCount} traveller
                    {seatCount === 1 ? '' : 's'}
                  </span>
                  <span className="font-medium tabular-nums">{formatINR(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-text">Total</span>
                  <span className="text-xl font-bold tabular-nums text-brand-primary tracking-tight">
                    {formatINR(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-text mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-brand-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-brand-muted">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-right font-medium text-brand-text">{value}</span>
    </div>
  )
}

function SeatCounter({ value, max, onChange }) {
  const dec = () => onChange(Math.max(1, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  return (
    <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-white border border-gray-300">
      <button
        type="button"
        onClick={dec}
        disabled={value <= 1}
        className="w-9 h-9 rounded-md flex items-center justify-center text-brand-text hover:bg-brand-cream disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Decrease travellers"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className="w-9 h-9 rounded-md flex items-center justify-center text-brand-text hover:bg-brand-cream disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Increase travellers"
      >
        <Plus className="w-4 h-4" />
      </button>
      <span className="ml-2 text-xs text-brand-muted pr-2">max {max}</span>
    </div>
  )
}

function inputClass(error) {
  return `w-full px-4 py-2.5 rounded-lg bg-white border ${
    error ? 'border-red-400' : 'border-gray-300'
  } focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm transition-colors`
}

function PageSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 ring-1 ring-black/5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
          <aside>
            <div className="bg-white rounded-2xl p-6 ring-1 ring-black/5 space-y-4">
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function FallbackMessage({ title, body, ctaLabel, ctaTo }) {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl font-semibold text-brand-text">{title}</h1>
        <p className="mt-3 text-brand-muted">{body}</p>
        <Button to={ctaTo} variant="primary" size="md" className="mt-6">
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

export default BookingPage
