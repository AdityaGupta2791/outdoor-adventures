import { Zap } from 'lucide-react'

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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="font-display font-semibold text-white leading-[1.05] text-5xl sm:text-6xl md:text-7xl">
          Explore the world
          <br />
          with exciting people
        </h1>
        <p className="mt-7 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
          We help people to find ideal company for the joint trips — book in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-brand-accent text-white font-medium shadow-lg hover:bg-brand-accent-dark transition-colors"
          >
            <Zap className="w-4 h-4" fill="currentColor" strokeWidth={0} />
            Start
          </button>
          <button
            type="button"
            className="px-7 py-3 rounded-lg bg-white/95 backdrop-blur text-brand-text font-medium hover:bg-white transition-colors"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
