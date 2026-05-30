import { prisma } from '../../config/db.js'

const tripCardSelect = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  location: true,
  durationDays: true,
  difficulty: true,
  basePriceInPaise: true,
  coverImage: true,
  category: { select: { id: true, slug: true, name: true } },
  departures: {
    where: {
      status: 'OPEN',
      startDate: { gte: new Date() },
      availableSeats: { gt: 0 },
    },
    orderBy: { startDate: 'asc' },
    take: 1,
    select: {
      startDate: true,
      endDate: true,
      availableSeats: true,
      totalSeats: true,
    },
  },
}

export async function listTrips({ category, difficulty, search, minPrice, maxPrice, page, limit }) {
  const where = { status: 'PUBLISHED' }

  if (category) where.category = { slug: category }
  if (difficulty) where.difficulty = difficulty
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePriceInPaise = {}
    if (minPrice !== undefined) where.basePriceInPaise.gte = minPrice * 100
    if (maxPrice !== undefined) where.basePriceInPaise.lte = maxPrice * 100
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
      { shortDescription: { contains: search, mode: 'insensitive' } },
    ]
  }

  const skip = (page - 1) * limit

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      select: tripCardSelect,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prisma.trip.count({ where }),
  ])

  return {
    trips,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

export async function getTripBySlug(slug) {
  const trip = await prisma.trip.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      departures: {
        where: {
          status: { in: ['OPEN', 'FULL'] },
          startDate: { gte: new Date() },
        },
        orderBy: { startDate: 'asc' },
      },
    },
  })

  return trip
}

export async function listCategories() {
  return prisma.tripCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      coverImage: true,
      _count: { select: { trips: { where: { status: 'PUBLISHED' } } } },
    },
  })
}

// ===== Admin operations =====

export async function adminListTrips({ status, category, difficulty, search, page = 1, limit = 20 }) {
  const where = {}
  if (status) where.status = status
  if (category) where.category = { slug: category }
  if (difficulty) where.difficulty = difficulty
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  const skip = (page - 1) * limit
  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        location: true,
        basePriceInPaise: true,
        coverImage: true,
        status: true,
        difficulty: true,
        durationDays: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, slug: true, name: true } },
        _count: { select: { departures: true } },
      },
    }),
    prisma.trip.count({ where }),
  ])
  return {
    trips,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  }
}

export async function adminGetTripById(id) {
  return prisma.trip.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, slug: true, name: true } },
      departures: { orderBy: { startDate: 'asc' } },
    },
  })
}

export async function adminCreateTrip(data) {
  return prisma.trip.create({
    data,
    include: { category: { select: { id: true, slug: true, name: true } } },
  })
}

export async function adminUpdateTrip(id, data) {
  return prisma.trip.update({
    where: { id },
    data,
    include: { category: { select: { id: true, slug: true, name: true } } },
  })
}

export async function adminArchiveTrip(id) {
  return prisma.trip.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  })
}

export async function adminDeleteTrip(id) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      departures: {
        include: { _count: { select: { bookings: true } } },
      },
    },
  })
  if (!trip) {
    const err = new Error('Trip not found')
    err.status = 404
    throw err
  }
  const hasBookings = trip.departures.some((d) => d._count.bookings > 0)
  if (hasBookings) {
    const err = new Error(
      'Cannot delete a trip that has bookings on its departures. Archive it instead.',
    )
    err.status = 409
    throw err
  }
  // Safe to hard-delete; cascade removes departures (no bookings exist)
  return prisma.trip.delete({ where: { id } })
}

export async function adminListAllCategories() {
  return prisma.tripCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    select: { id: true, slug: true, name: true },
  })
}

// ===== Departures =====

export async function adminCreateDeparture(tripId, data) {
  return prisma.tripDeparture.create({
    data: { ...data, tripId, availableSeats: data.totalSeats },
  })
}

export async function adminUpdateDeparture(id, data) {
  return prisma.tripDeparture.update({ where: { id }, data })
}

export async function adminDeleteDeparture(id) {
  const departure = await prisma.tripDeparture.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  })
  if (!departure) throw new Error('Departure not found')
  if (departure._count.bookings > 0) {
    const err = new Error('Cannot delete a departure with existing bookings; cancel it instead')
    err.status = 409
    throw err
  }
  return prisma.tripDeparture.delete({ where: { id } })
}
