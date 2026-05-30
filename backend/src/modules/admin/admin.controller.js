import {
  adminTripsQuerySchema,
  createTripSchema,
  updateTripSchema,
  createDepartureSchema,
  updateDepartureSchema,
  adminBookingsQuerySchema,
  updateBookingStatusSchema,
  updateUserRoleSchema,
} from './admin.validators.js'
import * as tripsService from '../trips/trips.service.js'
import * as adminService from './admin.service.js'

function badRequest(res, parsed) {
  return res.status(400).json({
    error: { message: 'Invalid request', issues: parsed.error.flatten() },
  })
}

// ===== Trips =====

export async function listTrips(req, res, next) {
  try {
    const parsed = adminTripsQuerySchema.safeParse(req.query)
    if (!parsed.success) return badRequest(res, parsed)
    const data = await tripsService.adminListTrips(parsed.data)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await tripsService.adminGetTripById(req.params.id)
    if (!trip) return res.status(404).json({ error: { message: 'Trip not found' } })
    res.json({ trip })
  } catch (err) {
    next(err)
  }
}

export async function createTrip(req, res, next) {
  try {
    const parsed = createTripSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    const trip = await tripsService.adminCreateTrip(parsed.data)
    res.status(201).json({ trip })
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { message: 'A trip with this slug already exists' } })
    }
    next(err)
  }
}

export async function updateTrip(req, res, next) {
  try {
    const parsed = updateTripSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    const trip = await tripsService.adminUpdateTrip(req.params.id, parsed.data)
    res.json({ trip })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Trip not found' } })
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { message: 'A trip with this slug already exists' } })
    }
    next(err)
  }
}

export async function archiveTrip(req, res, next) {
  try {
    const trip = await tripsService.adminArchiveTrip(req.params.id)
    res.json({ trip })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Trip not found' } })
    }
    next(err)
  }
}

export async function deleteTrip(req, res, next) {
  try {
    await tripsService.adminDeleteTrip(req.params.id)
    res.status(204).end()
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: { message: err.message } })
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Trip not found' } })
    }
    next(err)
  }
}

export async function listCategories(_req, res, next) {
  try {
    const categories = await tripsService.adminListAllCategories()
    res.json({ categories })
  } catch (err) {
    next(err)
  }
}

// ===== Departures =====

export async function createDeparture(req, res, next) {
  try {
    const parsed = createDepartureSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    const departure = await tripsService.adminCreateDeparture(req.params.tripId, parsed.data)
    res.status(201).json({ departure })
  } catch (err) {
    next(err)
  }
}

export async function updateDeparture(req, res, next) {
  try {
    const parsed = updateDepartureSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    const departure = await tripsService.adminUpdateDeparture(req.params.id, parsed.data)
    res.json({ departure })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'Departure not found' } })
    }
    next(err)
  }
}

export async function deleteDeparture(req, res, next) {
  try {
    await tripsService.adminDeleteDeparture(req.params.id)
    res.status(204).end()
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

// ===== Bookings =====

export async function listBookings(req, res, next) {
  try {
    const parsed = adminBookingsQuerySchema.safeParse(req.query)
    if (!parsed.success) return badRequest(res, parsed)
    const data = await adminService.listBookings(parsed.data)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getBooking(req, res, next) {
  try {
    const booking = await adminService.getBookingById(req.params.id)
    if (!booking) return res.status(404).json({ error: { message: 'Booking not found' } })
    res.json({ booking })
  } catch (err) {
    next(err)
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await adminService.cancelBooking(req.params.id)
    res.json({ booking })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: { message: err.message } })
    next(err)
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const parsed = updateBookingStatusSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    const booking = await adminService.updateBookingStatus(req.params.id, parsed.data.status)
    res.json({ booking })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: { message: err.message } })
    next(err)
  }
}

export async function deleteBooking(req, res, next) {
  try {
    await adminService.deleteBooking(req.params.id)
    res.status(204).end()
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: { message: err.message } })
    next(err)
  }
}

// ===== Users =====

export async function listUsers(req, res, next) {
  try {
    const role = req.query.role
    const validRole = role === 'USER' || role === 'ADMIN' ? role : undefined
    const data = await adminService.listUsers({
      search: req.query.search,
      role: validRole,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
    })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const parsed = updateUserRoleSchema.safeParse(req.body)
    if (!parsed.success) return badRequest(res, parsed)
    if (req.user.id === req.params.id && parsed.data.role !== 'ADMIN') {
      return res.status(400).json({
        error: { message: "You cannot remove your own admin role" },
      })
    }
    const user = await adminService.updateUserRole(req.params.id, parsed.data.role)
    res.json({ user })
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'User not found' } })
    }
    next(err)
  }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ error: { message: 'You cannot delete your own account' } })
    }
    await adminService.deleteUser(req.params.id)
    res.status(204).end()
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { message: 'User not found' } })
    }
    next(err)
  }
}

// ===== Stats =====

export async function getStats(_req, res, next) {
  try {
    const stats = await adminService.getStats()
    res.json(stats)
  } catch (err) {
    next(err)
  }
}
