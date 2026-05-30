import { Link } from 'react-router-dom'
import { Map, CalendarCheck, Users, IndianRupee, TrendingUp } from 'lucide-react'
import { useAdminStats } from '../../features/admin/admin.hooks'
import { formatINR, formatDateRange } from '../../lib/format'

const statusStyles = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
}

function AdminDashboardPage() {
  const { data, isLoading, isError } = useAdminStats()

  if (isLoading) return <DashboardSkeleton />
  if (isError || !data) {
    return <div className="text-center py-16 text-red-600">Failed to load dashboard.</div>
  }

  const cards = [
    {
      label: 'Trips',
      value: data.trips.total,
      sub: `${data.trips.published} published · ${data.trips.draft} draft`,
      icon: Map,
    },
    {
      label: 'Bookings',
      value: data.bookings.total,
      sub: `${data.bookings.confirmed} confirmed · ${data.bookings.pending} pending`,
      icon: CalendarCheck,
    },
    {
      label: 'Users',
      value: data.users.total,
      sub: 'Registered customers',
      icon: Users,
    },
    {
      label: 'Revenue',
      value: formatINR(data.revenueInPaise),
      sub: 'From confirmed bookings',
      icon: IndianRupee,
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-brand-text">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          A quick look at trips, bookings, users, and revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, sub, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-muted">
                {label}
              </span>
              <span className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </span>
            </div>
            <div className="font-display text-2xl sm:text-3xl font-semibold text-brand-text tabular-nums">
              {value}
            </div>
            <div className="mt-1 text-xs text-brand-muted">{sub}</div>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl ring-1 ring-black/5 shadow-sm">
        <header className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <h2 className="font-semibold text-brand-text">Recent bookings</h2>
          </div>
          <Link
            to="/admin/bookings"
            className="text-sm font-semibold text-brand-accent hover:underline"
          >
            View all →
          </Link>
        </header>
        {data.recentBookings.length === 0 ? (
          <div className="p-8 text-center text-brand-muted text-sm">No recent bookings yet.</div>
        ) : (
          <ul className="divide-y divide-black/5">
            {data.recentBookings.map((b) => (
              <li key={b.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-brand-primary">
                      {b.bookingRef}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                        statusStyles[b.status] ?? statusStyles.PENDING
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-brand-text truncate">
                    <span className="font-medium">{b.guestName}</span> —{' '}
                    <Link
                      to={`/admin/trips/${b.departure.trip.id}`}
                      className="hover:text-brand-primary"
                    >
                      {b.departure.trip.title}
                    </Link>
                  </div>
                  <div className="text-xs text-brand-muted">
                    {formatDateRange(b.departure.startDate, b.departure.endDate)} ·{' '}
                    {b.seatCount} seat{b.seatCount === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold tabular-nums text-brand-primary">
                    {formatINR(b.totalAmountInPaise)}
                  </div>
                  <Link
                    to={`/admin/bookings/${b.id}`}
                    className="text-xs text-brand-accent hover:underline"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl ring-1 ring-black/5 p-5 space-y-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage
