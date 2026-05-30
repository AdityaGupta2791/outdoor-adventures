import { z } from 'zod'

export const searchByNLSchema = z.object({
  query: z.string().trim().min(3, 'Tell us what you’re looking for').max(300),
})

export const tripCopyInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  location: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(60),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING']),
  durationDays: z.coerce.number().int().positive().max(30),
})
