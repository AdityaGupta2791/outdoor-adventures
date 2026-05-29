import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'
import HomePage from '../pages/HomePage'
import TripListPage from '../pages/TripListPage'
import TripDetailPage from '../pages/TripDetailPage'
import BookingPage from '../pages/BookingPage'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'

function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-6">
      <div>
        <h1 className="font-display text-5xl font-semibold">404</h1>
        <p className="mt-3 text-brand-muted">This page doesn’t exist.</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripListPage />} />
          <Route path="/trips/:slug" element={<TripDetailPage />} />
          <Route path="/trips/:slug/book" element={<BookingPage />} />
          <Route path="/bookings/:id" element={<BookingConfirmationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default AppRoutes
