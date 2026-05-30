import { api } from '../../lib/axios'

// Stats
export const fetchAdminStats = () => api.get('/admin/stats').then((r) => r.data)

// Trips
export const fetchAdminTrips = (params) =>
  api.get('/admin/trips', { params }).then((r) => r.data)
export const fetchAdminTrip = (id) => api.get(`/admin/trips/${id}`).then((r) => r.data.trip)
export const fetchAdminCategories = () =>
  api.get('/admin/trips/categories').then((r) => r.data.categories)
export const createAdminTrip = (data) =>
  api.post('/admin/trips', data).then((r) => r.data.trip)
export const updateAdminTrip = (id, data) =>
  api.patch(`/admin/trips/${id}`, data).then((r) => r.data.trip)
export const archiveAdminTrip = (id) =>
  api.post(`/admin/trips/${id}/archive`).then((r) => r.data.trip)
export const deleteAdminTrip = (id) => api.delete(`/admin/trips/${id}`)

// Departures
export const createAdminDeparture = (tripId, data) =>
  api.post(`/admin/trips/${tripId}/departures`, data).then((r) => r.data.departure)
export const updateAdminDeparture = (id, data) =>
  api.patch(`/admin/departures/${id}`, data).then((r) => r.data.departure)
export const deleteAdminDeparture = (id) => api.delete(`/admin/departures/${id}`)

// Bookings
export const fetchAdminBookings = (params) =>
  api.get('/admin/bookings', { params }).then((r) => r.data)
export const fetchAdminBooking = (id) =>
  api.get(`/admin/bookings/${id}`).then((r) => r.data.booking)
export const cancelAdminBooking = (id) =>
  api.post(`/admin/bookings/${id}/cancel`).then((r) => r.data.booking)
export const updateAdminBookingStatus = (id, status) =>
  api.patch(`/admin/bookings/${id}/status`, { status }).then((r) => r.data.booking)
export const deleteAdminBooking = (id) => api.delete(`/admin/bookings/${id}`)

// Users
export const fetchAdminUsers = (params) =>
  api.get('/admin/users', { params }).then((r) => r.data)
export const updateAdminUserRole = (id, role) =>
  api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.user)
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`)
