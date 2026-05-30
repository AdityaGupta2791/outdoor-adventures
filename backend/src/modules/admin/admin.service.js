import { prisma } from '../../config/db.js'

// ===== Bookings =====

export async function listBookings({ status, search, page = 1, limit = 20 }) {
  const where = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { bookingRef: { contains: search, mode: 'insensitive' } },
      { guestEmail: { contains: search, mode: 'insensitive' } },
      { guestName: { contains: search, mode: 'insensitive' } },
    ]
  }
  const skip = (page - 1) * limit
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        departure: {
          include: {
            trip: { select: { id: true, slug: true, title: true, coverImage: true } },
          },
        },
        user: { select: { id: true, email: true, name: true } },
        payment: { select: { id: true, status: true, razorpayPaymentId: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])
  return {
    bookings,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      departure: {
        include: {
          trip: {
            select: {
              id: true,
              slug: true,
              title: true,
              coverImage: true,
              location: true,
              category: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      },
      user: { select: { id: true, email: true, name: true } },
      payment: true,
    },
  })
}

export async function cancelBooking(id) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { departure: true },
    })
    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    if (booking.status === 'CANCELLED') return booking

    // Return seats to inventory
    await tx.tripDeparture.update({
      where: { id: booking.departureId },
      data: {
        availableSeats: { increment: booking.seatCount },
        // If the departure was FULL, reopen it now that seats are available
        ...(booking.departure.status === 'FULL' && { status: 'OPEN' }),
      },
    })

    return tx.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        departure: {
          include: { trip: { select: { id: true, slug: true, title: true } } },
        },
        user: { select: { id: true, email: true, name: true } },
      },
    })
  })
}

const isActiveBookingStatus = (s) => s === 'PENDING' || s === 'CONFIRMED'

const VALID_BOOKING_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['REFUNDED', 'CANCELLED'],
  CANCELLED: [],
  REFUNDED: [],
}

export async function updateBookingStatus(id, newStatus) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { departure: true },
    })
    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    if (booking.status === newStatus) {
      return getBookingById(id)
    }

    const allowed = VALID_BOOKING_TRANSITIONS[booking.status] ?? []
    if (!allowed.includes(newStatus)) {
      const err = new Error(
        `Cannot change status from ${booking.status} to ${newStatus}`,
      )
      err.status = 409
      throw err
    }

    const wasActive = isActiveBookingStatus(booking.status)
    const willBeActive = isActiveBookingStatus(newStatus)

    if (wasActive && !willBeActive) {
      // Release seats back to inventory
      await tx.tripDeparture.update({
        where: { id: booking.departureId },
        data: {
          availableSeats: { increment: booking.seatCount },
          ...(booking.departure.status === 'FULL' && { status: 'OPEN' }),
        },
      })
    } else if (!wasActive && willBeActive) {
      // Re-decrement seats — may fail if inventory is gone
      if (booking.departure.availableSeats < booking.seatCount) {
        const err = new Error(
          `Cannot reactivate: only ${booking.departure.availableSeats} seat${booking.departure.availableSeats === 1 ? '' : 's'} left on this departure`,
        )
        err.status = 409
        throw err
      }
      const newAvailable = booking.departure.availableSeats - booking.seatCount
      await tx.tripDeparture.update({
        where: { id: booking.departureId },
        data: {
          availableSeats: newAvailable,
          ...(newAvailable === 0 && { status: 'FULL' }),
        },
      })
    }

    await tx.booking.update({ where: { id }, data: { status: newStatus } })
    return tx.booking.findUnique({
      where: { id },
      include: {
        departure: {
          include: {
            trip: { select: { id: true, slug: true, title: true } },
          },
        },
        user: { select: { id: true, email: true, name: true } },
        payment: { select: { id: true, status: true, razorpayPaymentId: true } },
      },
    })
  })
}

export async function deleteBooking(id) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { departure: true },
    })
    if (!booking) {
      const err = new Error('Booking not found')
      err.status = 404
      throw err
    }
    // For active bookings (seats still held), restore the seats.
    // CANCELLED/REFUNDED bookings already released their seats.
    const needsSeatRestore = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
    if (needsSeatRestore) {
      await tx.tripDeparture.update({
        where: { id: booking.departureId },
        data: {
          availableSeats: { increment: booking.seatCount },
          ...(booking.departure.status === 'FULL' && { status: 'OPEN' }),
        },
      })
    }
    // Drop the linked payment first (FK) — works whether or not one exists
    await tx.payment.deleteMany({ where: { bookingId: id } })
    return tx.booking.delete({ where: { id } })
  })
}

// ===== Users =====

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerified: true,
  avatarUrl: true,
  createdAt: true,
  _count: { select: { bookings: true } },
}

export async function listUsers({ search, role, page = 1, limit = 20 }) {
  const where = {}
  if (role) where.role = role
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ]
  }
  const skip = (page - 1) * limit
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: userSelect,
    }),
    prisma.user.count({ where }),
  ])
  return {
    users,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
}

export async function updateUserRole(id, role) {
  return prisma.user.update({ where: { id }, data: { role }, select: userSelect })
}

export async function deleteUser(id) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } })
    if (!user) {
      const err = new Error('User not found')
      err.status = 404
      throw err
    }

    // Match by userId (linked) AND by guestEmail (unlinked guest bookings on the same email)
    const bookings = await tx.booking.findMany({
      where: { OR: [{ userId: id }, { guestEmail: user.email }] },
      include: { departure: true },
    })

    // Restore seats per departure for any still-active bookings
    const seatsByDeparture = {}
    const departureStatuses = {}
    for (const b of bookings) {
      if (b.status === 'PENDING' || b.status === 'CONFIRMED') {
        seatsByDeparture[b.departureId] =
          (seatsByDeparture[b.departureId] ?? 0) + b.seatCount
        departureStatuses[b.departureId] = b.departure.status
      }
    }
    for (const [departureId, seats] of Object.entries(seatsByDeparture)) {
      await tx.tripDeparture.update({
        where: { id: departureId },
        data: {
          availableSeats: { increment: seats },
          ...(departureStatuses[departureId] === 'FULL' && { status: 'OPEN' }),
        },
      })
    }

    // Cascade delete payments + bookings (payments first for FK)
    const bookingIds = bookings.map((b) => b.id)
    if (bookingIds.length) {
      await tx.payment.deleteMany({ where: { bookingId: { in: bookingIds } } })
      await tx.booking.deleteMany({ where: { id: { in: bookingIds } } })
    }

    // Account rows cascade automatically (onDelete: Cascade on the schema)
    return tx.user.delete({ where: { id } })
  })
}

// ===== Stats =====

export async function getStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalTrips,
    publishedTrips,
    draftTrips,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalUsers,
    revenueAgg,
    recentBookings,
  ] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.count({ where: { status: 'PUBLISHED' } }),
    prisma.trip.count({ where: { status: 'DRAFT' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.user.count(),
    prisma.booking.aggregate({
      _sum: { totalAmountInPaise: true },
      where: { status: 'CONFIRMED' },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        bookingRef: true,
        guestName: true,
        guestEmail: true,
        seatCount: true,
        totalAmountInPaise: true,
        status: true,
        createdAt: true,
        departure: {
          select: {
            startDate: true,
            endDate: true,
            trip: { select: { id: true, slug: true, title: true } },
          },
        },
      },
    }),
  ])

  return {
    trips: { total: totalTrips, published: publishedTrips, draft: draftTrips },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      pending: pendingBookings,
    },
    users: { total: totalUsers },
    revenueInPaise: revenueAgg._sum.totalAmountInPaise ?? 0,
    recentBookings,
  }
}
