import { Router } from 'express'
import * as admin from './admin.controller.js'
import { requireAuth, requireAdmin } from '../../middleware/auth.js'

const router = Router()

router.use(requireAuth, requireAdmin)

// Stats
router.get('/stats', admin.getStats)

// Trips
router.get('/trips', admin.listTrips)
router.post('/trips', admin.createTrip)
router.get('/trips/categories', admin.listCategories)
router.get('/trips/:id', admin.getTrip)
router.patch('/trips/:id', admin.updateTrip)
router.post('/trips/:id/archive', admin.archiveTrip)
router.delete('/trips/:id', admin.deleteTrip)

// Departures (nested under trip for create; flat for update/delete)
router.post('/trips/:tripId/departures', admin.createDeparture)
router.patch('/departures/:id', admin.updateDeparture)
router.delete('/departures/:id', admin.deleteDeparture)

// Bookings
router.get('/bookings', admin.listBookings)
router.get('/bookings/:id', admin.getBooking)
router.post('/bookings/:id/cancel', admin.cancelBooking)
router.patch('/bookings/:id/status', admin.updateBookingStatus)
router.delete('/bookings/:id', admin.deleteBooking)

// Users
router.get('/users', admin.listUsers)
router.patch('/users/:id/role', admin.updateUserRole)
router.delete('/users/:id', admin.deleteUser)

export default router
