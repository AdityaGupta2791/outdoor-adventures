import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBooking, fetchBookingById } from './bookings.api'

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      qc.setQueryData(['booking', booking.id], booking)
      qc.invalidateQueries({ queryKey: ['trip', booking.departure.trip.slug] })
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingById(id),
    enabled: Boolean(id),
  })
}
