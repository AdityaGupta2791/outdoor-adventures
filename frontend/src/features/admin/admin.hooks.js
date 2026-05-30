import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import * as api from './admin.api'

const k = {
  stats: ['admin', 'stats'],
  trips: (p) => ['admin', 'trips', p],
  trip: (id) => ['admin', 'trip', id],
  categories: ['admin', 'categories'],
  bookings: (p) => ['admin', 'bookings', p],
  booking: (id) => ['admin', 'booking', id],
  users: (p) => ['admin', 'users', p],
}

export function useAdminStats() {
  return useQuery({ queryKey: k.stats, queryFn: api.fetchAdminStats })
}

export function useAdminTrips(params) {
  return useQuery({
    queryKey: k.trips(params),
    queryFn: () => api.fetchAdminTrips(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminTrip(id) {
  return useQuery({
    queryKey: k.trip(id),
    queryFn: () => api.fetchAdminTrip(id),
    enabled: Boolean(id),
  })
}

export function useAdminCategories() {
  return useQuery({
    queryKey: k.categories,
    queryFn: api.fetchAdminCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAdminCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createAdminTrip,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trips'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export function useAdminUpdateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateAdminTrip(id, data),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: ['admin', 'trips'] })
      qc.invalidateQueries({ queryKey: k.trip(trip.id) })
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['trip', trip.slug] })
    },
  })
}

export function useAdminArchiveTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.archiveAdminTrip,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trips'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export function useAdminDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAdminTrip,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'trips'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export function useAdminCreateDeparture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tripId, data }) => api.createAdminDeparture(tripId, data),
    onSuccess: (_d, { tripId }) => {
      qc.invalidateQueries({ queryKey: k.trip(tripId) })
      qc.invalidateQueries({ queryKey: ['admin', 'trips'] })
    },
  })
}

export function useAdminUpdateDeparture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateAdminDeparture(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useAdminDeleteDeparture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAdminDeparture,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  })
}

export function useAdminBookings(params) {
  return useQuery({
    queryKey: k.bookings(params),
    queryFn: () => api.fetchAdminBookings(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminBooking(id) {
  return useQuery({
    queryKey: k.booking(id),
    queryFn: () => api.fetchAdminBooking(id),
    enabled: Boolean(id),
  })
}

export function useAdminCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.cancelAdminBooking,
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      qc.invalidateQueries({ queryKey: k.booking(booking.id) })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminUpdateBookingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.updateAdminBookingStatus(id, status),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      qc.invalidateQueries({ queryKey: k.booking(booking.id) })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminDeleteBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAdminBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useAdminUsers(params) {
  return useQuery({
    queryKey: k.users(params),
    queryFn: () => api.fetchAdminUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }) => api.updateAdminUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteAdminUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}
