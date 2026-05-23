import { Compass, MessageCircle } from 'lucide-react'
import Button from './Button'

function CallToAction({
  headline = 'Your next adventure is waiting.',
  subtext = "Pick a trip, pick a date — we'll handle the rest.",
  primaryLabel = 'Browse Trips',
  primaryTo = '/trips',
  secondaryLabel = 'Talk to Us',
  secondaryTo = '/contact',
  bgImage = '/hero-bg.jpg',
}) {
  return (
    <section className="px-6 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />

          <div className="relative px-6 sm:px-12 py-14 sm:py-20 md:py-24 text-center text-white">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight max-w-3xl mx-auto">
              {headline}
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/85 max-w-2xl mx-auto">
              {subtext}
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button to={primaryTo} variant="primary" size="lg">
                <Compass className="w-4 h-4" />
                {primaryLabel}
              </Button>
              <Button to={secondaryTo} variant="light" size="lg">
                <MessageCircle className="w-4 h-4" />
                {secondaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CallToAction
