import { useMutation, useQuery } from '@tanstack/react-query'
import * as api from './llm.api'

export function useLLMStatus() {
  return useQuery({
    queryKey: ['llm', 'status'],
    queryFn: api.fetchLLMStatus,
    staleTime: 5 * 60 * 1000,
  })
}

export function useNLSearch() {
  return useMutation({
    mutationFn: (query) => api.searchByNL(query),
  })
}

export function useGenerateTripCopy() {
  return useMutation({
    mutationFn: (input) => api.generateTripCopy(input),
  })
}
