import { Navigate, Outlet, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import GuestOnlyRoute from '../components/auth/GuestOnlyRoute'
import AdminRoute from '../components/auth/AdminRoute'
import AdminLayout from '../components/admin/AdminLayout'
import { useSessionRestore } from '../features/auth/auth.hooks'
import HomePage from '../pages/HomePage'
import TripListPage from '../pages/TripListPage'
import TripDetailPage from '../pages/TripDetailPage'
import BookingPage from '../pages/BookingPage'
import BookingConfirmationPage from '../pages/BookingConfirmationPage'
import AboutPage from '../pages/AboutPage'
import ContactPage from '../pages/ContactPage'
import LoginPage from '../pages/LoginPage'
import SignupPage from '../pages/SignupPage'
import AuthCallbackPage from '../pages/AuthCallbackPage'
import DashboardPage from '../pages/DashboardPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminTripsListPage from '../pages/admin/AdminTripsListPage'
import AdminTripFormPage from '../pages/admin/AdminTripFormPage'
import AdminBookingsListPage from '../pages/admin/AdminBookingsListPage'
import AdminBookingDetailPage from '../pages/admin/AdminBookingDetailPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import NotFoundPage from '../pages/NotFoundPage'

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
  useSessionRestore()

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin — own layout, no public navbar/footer */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="trips" element={<AdminTripsListPage />} />
          <Route path="trips/new" element={<AdminTripFormPage />} />
          <Route path="trips/:id" element={<AdminTripFormPage />} />
          <Route path="bookings" element={<AdminBookingsListPage />} />
          <Route path="bookings/:id" element={<AdminBookingDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Public + customer routes — public layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripListPage />} />
          <Route path="/trips/:slug" element={<TripDetailPage />} />
          <Route path="/trips/:slug/book" element={<BookingPage />} />
          <Route path="/bookings/:id" element={<BookingConfirmationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestOnlyRoute>
                <SignupPage />
              </GuestOnlyRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default AppRoutes
