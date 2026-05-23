import { Link } from 'react-router-dom'
import { MapPin, Clock, TrendingUp, Calendar } from 'lucide-react'
import { formatINR, formatDateRange, difficultyLabel } from '../lib/format'

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  DIFFICULT: 'bg-orange-100 text-orange-800',
  CHALLENGING: 'bg-red-100 text-red-800',
}

function TripCard({ trip }) {
  const next = trip.departures?.[0]
  const lowSeats = next && next.availableSeats > 0 && next.availableSeats <= 5

  return (
    <Link
      to={`/trips/${trip.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow ring-1 ring-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={trip.coverImage}
          alt={trip.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-medium text-brand-primary">
          {trip.category.name}
        </span>
        {lowSeats && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-brand-accent text-white text-[11px] font-semibold shadow-sm">
            Only {next.availableSeats} left
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-xl font-semibold text-brand-text leading-tight line-clamp-2 sm:min-h-[3.25rem]">
          {trip.title}
        </h3>
        <p className="mt-2 text-sm text-brand-muted line-clamp-2 sm:min-h-[2.5rem]">
          {trip.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {trip.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {trip.durationDays} days
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
              difficultyColors[trip.difficulty] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {difficultyLabel(trip.difficulty)}
          </span>
        </div>

        {next ? (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-text">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span className="font-medium">Next departure:</span>
            <span>{formatDateRange(next.startDate, next.endDate)}</span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-brand-muted italic">No upcoming departures</div>
        )}

        <div className="mt-auto pt-4 border-t border-black/5 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-brand-muted">From</span>
            <div className="text-2xl font-bold tabular-nums text-brand-primary tracking-tight">
              {formatINR(trip.basePriceInPaise)}
            </div>
          </div>
          <span className="text-sm font-semibold text-brand-accent group-hover:translate-x-1 transition-transform">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

export default TripCard
