import { Compass, ChevronDown } from 'lucide-react'
import Button from './Button'

function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <img
        src="/hero-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="font-display font-semibold text-white leading-[1.05] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          Curated adventures
          <br />
          across India.
        </h1>
        <p className="mt-6 sm:mt-7 text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
          Hand-picked treks, camps and hikes — with certified guides, honest difficulty ratings,
          and transparent pricing.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button to="/trips" variant="primary" size="lg">
            <Compass className="w-4 h-4" />
            Browse Trips
          </Button>
          <Button href="#how-it-works" variant="light" size="lg">
            How it works
          </Button>
        </div>
      </div>

      <a
        href="#featured"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 inline-flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors text-xs"
        aria-label="Scroll to featured trips"
      >
        <span>Explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </a>
    </section>
  )
}

export default Hero
