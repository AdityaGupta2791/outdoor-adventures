function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center p-2 rounded-lg bg-[#E8F2EC]/95 backdrop-blur-md shadow-md ring-1 ring-black/5">
        <ul className="flex items-center gap-1 text-sm font-medium text-brand-primary">
          <li>
            <a
              href="#home"
              className="block px-5 py-2 rounded-full bg-brand-primary text-white"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#programs"
              className="block px-5 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
            >
              Programs &amp; Trips
            </a>
          </li>
          <li>
            <a
              href="#testimonials"
              className="block px-5 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
            >
              Testimonials
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="block px-5 py-2 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
