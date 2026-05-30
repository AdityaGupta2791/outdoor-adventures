import { z } from 'zod'

export const tripListQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  minDurationDays: z.coerce.number().int().positive().optional(),
  maxDurationDays: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
})

export const tripSlugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase letters, numbers, hyphens'),
})
