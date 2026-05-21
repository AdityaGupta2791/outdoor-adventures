import { api } from '../../lib/axios'

export async function fetchTrips(params) {
  const { data } = await api.get('/trips', { params })
  return data
}

export async function fetchTripBySlug(slug) {
  const { data } = await api.get(`/trips/${slug}`)
  return data.trip
}

export async function fetchCategories() {
  const { data } = await api.get('/trips/categories')
  return data.categories
}
