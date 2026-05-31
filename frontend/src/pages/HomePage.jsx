import { Link } from 'react-router-dom'
import { Search, Calendar, Compass, ArrowRight, Mountain, Tent, Footprints, Flame } from 'lucide-react'
import Hero from '../components/Hero'
import TripCard from '../components/TripCard'
import CallToAction from '../components/CallToAction'
import SectionHeader from '../components/SectionHeader'
import { TripCardSkeletonGrid } from '../components/TripCardSkeleton'
import { useTrips, useCategories } from '../features/trips/trips.hooks'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const categoryIcons = {
  trekking: Mountain,
  camping: Tent,
  hiking: Footprints,
  adventure: Flame,
}

const steps = [
  {
    icon: Search,
    title: 'Discover',
    body: 'Browse curated treks, camps, and hikes — filtered by skill, duration, and category.',
  },
  {
    icon: Calendar,
    title: 'Pick a date',
    body: 'Choose from upcoming departures with real seat availability and transparent pricing.',
  },
  {
    icon: Compass,
    title: 'Get ready',
    body: 'Receive a gear checklist, prep guidance, and your guide details — all in one place.',
  },
]

const seeAllLink = (
  <Link
    to="/trips"
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:underline"
  >
    See all trips
    <ArrowRight className="w-4 h-4" />
  </Link>
)

function HomePage() {
  useDocumentTitle('Curated adventures across India')
  return (
    <>
      <Hero />
      <FeaturedTrips />
      <BrowseByCategory />
      <HowItWorks />
      <CallToAction />
    </>
  )
}

function FeaturedTrips() {
  const { data, isLoading } = useTrips({ page: 1, limit: 6 })

  return (
    <section id="featured" className="py-14 sm:py-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Featured"
          title="Adventures worth booking"
          action={seeAllLink}
          className="mb-10"
        />

        {isLoading ? (
          <TripCardSkeletonGrid count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
          </div>
        )}

        <div className="mt-10 sm:hidden text-center">{seeAllLink}</div>
      </div>
    </section>
  )
}

function BrowseByCategory() {
  const { data: categories, isLoading } = useCategories()

  return (
    <section className="py-14 sm:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="Categories"
          title="Browse by what you love"
          description="From weekend hikes to high-altitude expeditions — pick the kind of adventure that fits you."
          action={
            <Link
              to="/trips"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:underline"
            >
              View all trips
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
          className="mb-10"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-2xl animate-pulse ring-1 ring-black/5"
                />
              ))
            : categories?.map((cat) => {
                const Icon = categoryIcons[cat.slug] ?? Mountain
                return (
                  <Link
                    key={cat.slug}
                    to={`/trips?category=${cat.slug}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={cat.coverImage}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white">
                      <Icon className="w-6 h-6 mb-2 opacity-90" strokeWidth={2} />
                      <h3 className="font-display text-xl font-semibold">{cat.name}</h3>
                      <p className="mt-0.5 text-xs text-white/80">
                        {cat._count.trips} trip{cat._count.trips === 1 ? '' : 's'}
                      </p>
                    </div>
                  </Link>
                )
              })}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20 px-6 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="How it works"
          title="From idea to summit, in three steps"
          align="center"
          className="mb-12"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="relative bg-white rounded-2xl p-6 ring-1 ring-black/5 shadow-sm"
            >
              <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-brand-primary text-white text-sm font-semibold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-semibold text-brand-text">{title}</h3>
              <p className="mt-2 text-sm text-brand-muted leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomePage
