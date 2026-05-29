import { Router } from 'express'
import * as bookingsController from './bookings.controller.js'

const router = Router()

router.post('/', bookingsController.createBooking)
router.get('/:id', bookingsController.getBookingById)

export default router
