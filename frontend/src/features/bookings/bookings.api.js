import { api } from '../../lib/axios'

export async function createBooking(payload) {
  const { data } = await api.post('/bookings', payload)
  return data.booking
}

export async function fetchBookingById(id) {
  const { data } = await api.get(`/bookings/${id}`)
  return data.booking
}
