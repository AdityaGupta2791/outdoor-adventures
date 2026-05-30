import { createBookingSchema, bookingIdParamSchema } from './bookings.validators.js'
import * as bookingsService from './bookings.service.js'

export async function createBooking(req, res, next) {
  try {
    const parsed = createBookingSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid booking details', issues: parsed.error.flatten() },
      })
    }
    const booking = await bookingsService.createBooking({
      ...parsed.data,
      userId: req.user?.id ?? null,
    })
    res.status(201).json({ booking })
  } catch (err) {
    if (err instanceof bookingsService.BookingError) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function listMyBookings(req, res, next) {
  try {
    const bookings = await bookingsService.listBookingsForUser({
      userId: req.user.id,
      email: req.user.email,
    })
    res.json({ bookings })
  } catch (err) {
    next(err)
  }
}

export async function getBookingById(req, res, next) {
  try {
    const parsed = bookingIdParamSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid booking id' } })
    }
    const booking = await bookingsService.getBookingById(parsed.data.id)
    if (!booking) {
      return res.status(404).json({ error: { message: 'Booking not found' } })
    }
    res.json({ booking })
  } catch (err) {
    next(err)
  }
}
