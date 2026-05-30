import { z } from 'zod'

const itineraryDaySchema = z.object({
  day: z.coerce.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
})

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const tripBaseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, hyphens'),
  title: z.string().trim().min(3).max(200),
  shortDescription: z.string().trim().min(10).max(280),
  description: z.string().trim().min(20),
  categoryId: z.string().min(1),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING']),
  durationDays: z.coerce.number().int().positive().max(30),
  location: z.string().trim().min(2).max(120),
  basePriceInPaise: z.coerce.number().int().nonnegative(),
  coverImage: z.string().url('Cover image must be a valid URL'),
  images: z.array(z.string().url()).default([]),
  itinerary: z.array(itineraryDaySchema).min(1, 'Add at least one itinerary day'),
  inclusions: z.array(z.string().trim().min(1)).default([]),
  exclusions: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
})

export const createTripSchema = tripBaseSchema
export const updateTripSchema = tripBaseSchema.partial()

export const departureBaseSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  priceInPaise: z.coerce.number().int().nonnegative(),
  totalSeats: z.coerce.number().int().positive().max(200),
  status: z.enum(['OPEN', 'FULL', 'CANCELLED', 'COMPLETED']).optional(),
})

export const createDepartureSchema = departureBaseSchema.refine(
  (d) => d.endDate >= d.startDate,
  { message: 'End date must be on or after start date', path: ['endDate'] },
)

export const updateDepartureSchema = departureBaseSchema.partial().extend({
  availableSeats: z.coerce.number().int().nonnegative().optional(),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']),
})

export const adminBookingsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const adminTripsQuerySchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  category: z.string().trim().min(1).optional(),
  difficulty: z.enum(['EASY', 'MODERATE', 'DIFFICULT', 'CHALLENGING']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
