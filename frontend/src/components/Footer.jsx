import { Link } from 'react-router-dom'
import { Mountain, Mail } from 'lucide-react'

const explore = [
  { label: 'All Trips', to: '/trips' },
  { label: 'Trekking', to: '/trips?category=trekking' },
  { label: 'Camping', to: '/trips?category=camping' },
  { label: 'Hiking', to: '/trips?category=hiking' },
  { label: 'Adventure', to: '/trips?category=adventure' },
]

const company = [
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const support = [
  { label: 'FAQ', to: '#' },
  { label: 'Cancellation policy', to: '#' },
  { label: 'Safety standards', to: '#' },
  { label: 'Privacy policy', to: '#' },
  { label: 'Terms of service', to: '#' },
]

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

const socials = [
  { Icon: InstagramIcon, href: '#', label: 'Instagram' },
  { Icon: TwitterIcon, href: '#', label: 'Twitter' },
  { Icon: FacebookIcon, href: '#', label: 'Facebook' },
  { Icon: Mail, href: 'mailto:hello@outdooradventures.in', label: 'Email' },
]

function Footer() {
  return (
    <footer className="bg-brand-primary-dark text-white">
      <div className="px-6">
        <div className="max-w-7xl mx-auto py-10 sm:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 text-white">
                <Mountain className="w-6 h-6" strokeWidth={2.25} />
                <span className="font-display text-xl font-semibold tracking-tight">
                  Outdoor Adventures
                </span>
              </Link>
              <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-xs">
                Curated treks, camps and hikes across India. Certified guides. Honest pricing.
              </p>
              <div className="mt-5 flex items-center gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <FooterColumn title="Explore" items={explore} />
            <FooterColumn title="Company" items={company} />
            <FooterColumn title="Support" items={support} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <span>© {new Date().getFullYear()} Outdoor Adventures. All rights reserved.</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider font-semibold text-white/90 mb-4">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.to.startsWith('#') || item.to.startsWith('mailto:') ? (
              <a
                href={item.to}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.to}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Footer
