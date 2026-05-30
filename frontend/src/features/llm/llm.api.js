import { api } from '../../lib/axios'

export async function fetchLLMStatus() {
  const { data } = await api.get('/llm/status')
  return data
}

export async function searchByNL(query) {
  const { data } = await api.post('/llm/search', { query })
  return data
}

export async function generateTripCopy(input) {
  const { data } = await api.post('/llm/trip-copy', input)
  return data
}
