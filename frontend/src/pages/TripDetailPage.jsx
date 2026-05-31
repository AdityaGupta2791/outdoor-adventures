import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  Users,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'
import { useTrip, useTrips } from '../features/trips/trips.hooks'
import { formatINR, formatDateRange, difficultyLabel } from '../lib/format'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import TripCard from '../components/TripCard'
import Button from '../components/Button'
import SectionHeader from '../components/SectionHeader'

function TripDetailPage() {
  const { slug } = useParams()
  const { data: trip, isLoading, isError } = useTrip(slug)
  useDocumentTitle(trip?.title)

  if (isLoading) return <DetailSkeleton />

  if (isError || !trip) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 text-center bg-brand-cream">
        <p className="text-brand-muted">Trip not found.</p>
        <Link to="/trips" className="mt-4 inline-block text-brand-accent hover:underline">
          ← Back to all trips
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs trip={trip} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                <span className="inline-block px-3 py-1 rounded-full bg-white/95 text-xs font-medium text-brand-primary mb-2 sm:mb-3">
                  {trip.category.name}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                  {trip.title}
                </h1>
                <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 text-xs sm:text-sm text-white/95">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {trip.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {trip.durationDays} days
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {difficultyLabel(trip.difficulty)}
                  </span>
                </div>
              </div>
            </div>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3 text-brand-text">
                About this trip
              </h2>
              <p className="text-brand-text leading-relaxed whitespace-pre-line">
                {trip.description}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4 text-brand-text">
                Itinerary
              </h2>
              <ol className="relative">
                <div
                  aria-hidden="true"
                  className="absolute left-0 w-0.5 bg-brand-primary/20"
                  style={{ top: '18px', bottom: '18px' }}
                />
                {trip.itinerary.map((day, i) => (
                  <li
                    key={day.day}
                    className={`relative pl-12 ${
                      i === trip.itinerary.length - 1 ? 'pb-0' : 'pb-8'
                    }`}
                  >
                    <span className="absolute left-0 -translate-x-1/2 top-0 w-9 h-9 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center">
                      {day.day}
                    </span>
                    <h3 className="font-semibold text-brand-text">{day.title}</h3>
                    {day.description && (
                      <p className="mt-1 text-sm text-brand-muted">{day.description}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="font-display text-xl font-semibold mb-3 text-brand-text">
                  What’s included
                </h2>
                <ul className="space-y-2">
                  {trip.inclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold mb-3 text-brand-text">
                  Not included
                </h2>
                <ul className="space-y-2">
                  {trip.exclusions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-brand-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {trip.images?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4 text-brand-text">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {trip.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full object-cover rounded-2xl"
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-6">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-brand-muted">
                Upcoming Departures
              </h3>

              {trip.departures.length === 0 ? (
                <p className="mt-3 text-sm text-brand-muted">
                  No upcoming departures. Check back soon.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {trip.departures.map((d) => {
                    const soldOut = d.availableSeats === 0 || d.status === 'FULL'
                    return (
                      <li
                        key={d.id}
                        className="p-4 rounded-2xl bg-brand-cream/60 ring-1 ring-black/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text">
                              <Calendar className="w-4 h-4 text-brand-primary" />
                              {formatDateRange(d.startDate, d.endDate)}
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 text-xs text-brand-muted">
                              <Users className="w-3.5 h-3.5" />
                              {soldOut
                                ? 'Sold out'
                                : `${d.availableSeats} of ${d.totalSeats} seats left`}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold tabular-nums text-brand-primary leading-none">
                              {formatINR(d.priceInPaise)}
                            </div>
                            <div className="mt-1 text-[11px] text-brand-muted">per person</div>
                          </div>
                        </div>
                        <Button
                          to={soldOut ? undefined : `/trips/${trip.slug}/book?departureId=${d.id}`}
                          variant="primary"
                          size="md"
                          fullWidth
                          disabled={soldOut}
                          className="mt-3"
                        >
                          {soldOut ? 'Sold out' : 'Book Now'}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>

        <RelatedTrips currentSlug={trip.slug} categorySlug={trip.category.slug} />
      </div>
    </div>
  )
}

function Breadcrumbs({ trip }) {
  const item = 'inline-flex items-center text-brand-muted hover:text-brand-text transition-colors shrink-0'
  const sep = 'mx-1 w-3.5 h-3.5 text-brand-muted/60 shrink-0'
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center text-xs sm:text-sm flex-wrap gap-y-1"
    >
      <Link to="/trips" className={item}>
        Trips
      </Link>
      <ChevronRight className={sep} />
      <Link to={`/trips?category=${trip.category.slug}`} className={item}>
        {trip.category.name}
      </Link>
      <ChevronRight className={sep} />
      <span className="text-brand-text font-medium truncate max-w-[10rem] sm:max-w-[16rem] md:max-w-none">
        {trip.title}
      </span>
    </nav>
  )
}

function RelatedTrips({ currentSlug, categorySlug }) {
  const { data } = useTrips({ category: categorySlug, limit: 6, page: 1 })
  const related = (data?.trips ?? []).filter((t) => t.slug !== currentSlug).slice(0, 3)

  if (related.length === 0) return null

  return (
    <section className="mt-20">
      <SectionHeader
        eyebrow="More like this"
        title="Similar trips you might like"
        description="More adventures in the same category."
        size="sm"
        className="mb-6"
        action={
          <Link
            to={`/trips?category=${categorySlug}`}
            className="text-sm font-semibold text-brand-accent hover:underline"
          >
            View all →
          </Link>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {related.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-[16/9] bg-gray-200 rounded-2xl animate-pulse" />
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            </div>
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 ring-1 ring-black/5 shadow-sm space-y-4">
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default TripDetailPage
