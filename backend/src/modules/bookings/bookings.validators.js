import { z } from 'zod'

export const createBookingSchema = z.object({
  departureId: z.string().min(1),
  guestName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  guestEmail: z.string().trim().toLowerCase().email('Enter a valid email address'),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  seatCount: z.coerce.number().int().min(1).max(10),
})

export const bookingIdParamSchema = z.object({
  id: z.string().min(1),
})
