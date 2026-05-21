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
