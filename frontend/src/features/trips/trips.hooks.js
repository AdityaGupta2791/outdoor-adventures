import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchTrips, fetchTripBySlug, fetchCategories } from './trips.api'

export function useTrips(params) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => fetchTrips(params),
    placeholderData: keepPreviousData,
  })
}

export function useTrip(slug) {
  return useQuery({
    queryKey: ['trip', slug],
    queryFn: () => fetchTripBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['trip-categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  })
}
