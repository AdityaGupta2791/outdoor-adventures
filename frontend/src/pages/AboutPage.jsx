import { Compass, Shield, Sparkles } from 'lucide-react'
import CallToAction from '../components/CallToAction'
import SectionHeader from '../components/SectionHeader'

const stats = [
  { value: '15+', label: 'Curated Trips' },
  { value: '4', label: 'Adventure Categories' },
  { value: 'India', label: 'Wide Coverage' },
]

const values = [
  {
    icon: Compass,
    title: 'Curated, not crowded',
    body: 'Every trip on Outdoor Adventures is hand-picked. We obsess over the small things — the right departure window, a fair price, the right guide.',
  },
  {
    icon: Shield,
    title: 'Safety first, always',
    body: 'Certified trek leaders, mandatory acclimatization, real-time weather monitoring, and gear rated for the terrain. Adventure should never compromise on safety.',
  },
  {
    icon: Sparkles,
    title: 'Built for travellers',
    body: 'Transparent pricing in INR, honest difficulty ratings, and trip prep guidance that actually helps. No fluff, no surprises.',
  },
]

function AboutPage() {
  return (
    <>
      <div className="min-h-screen pt-28 pb-12 px-6 bg-brand-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            eyebrow="About us"
            title="Real adventures across India, made simple to book."
            description="Outdoor Adventures helps people discover and book pre-organized treks, camps, and hikes across India — from beginner-friendly weekend escapes to challenging high-altitude expeditions in the Himalayas."
            align="center"
            size="lg"
          />

          <section className="mt-16 grid grid-cols-3 gap-2 sm:gap-8 bg-white rounded-2xl ring-1 ring-black/5 shadow-sm py-6 sm:py-8 px-3 sm:px-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center ${
                  i < stats.length - 1 ? 'border-r border-gray-200' : ''
                }`}
              >
                <div className="font-display text-xl sm:text-3xl md:text-4xl font-semibold text-brand-primary tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] sm:text-sm text-brand-muted leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 ring-1 ring-black/5 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-display text-xl font-semibold text-brand-text">{title}</h2>
                <p className="mt-2 text-sm text-brand-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </section>

          <section className="mt-16 bg-white rounded-2xl p-8 sm:p-12 ring-1 ring-black/5 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-brand-primary">
                  Our story
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-brand-text leading-tight">
                  Built around how you actually plan a trip.
                </h2>
              </div>
              <div className="lg:col-span-2 space-y-4 text-brand-text leading-relaxed">
                <p>
                  India has some of the most remarkable trekking and outdoor terrain in the world
                  — the high passes of Ladakh, the green valleys of Kullu, the rhododendron
                  ridges of Sikkim. But booking a real adventure has always been harder than it
                  should be.
                </p>
                <p>
                  Existing platforms force you into rigid filters: pick a date, pick a price,
                  pick a category. But you don't think in filters — you think in <em>intent</em>.
                  A quiet 3-day trek near water. A beginner-friendly snow trek under ₹10k.
                  Outdoor Adventures is built around that intent.
                </p>
                <p>
                  We curate a small, high-quality catalog. We work with experienced organizers.
                  And we believe every traveller deserves the same prep that an expedition leader
                  gets.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <CallToAction />
    </>
  )
}

export default AboutPage
