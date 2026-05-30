import { Router } from 'express'
import * as bookingsController from './bookings.controller.js'
import { requireAuth, optionalAuth } from '../../middleware/auth.js'

const router = Router()

router.post('/', optionalAuth, bookingsController.createBooking)
router.get('/me', requireAuth, bookingsController.listMyBookings)
router.get('/:id', bookingsController.getBookingById)

export default router
