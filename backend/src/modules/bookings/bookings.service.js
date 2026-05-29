import { prisma } from '../../config/db.js'

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateBookingRef() {
  let ref = 'OA-'
  for (let i = 0; i < 6; i++) {
    ref += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  }
  return ref
}

class BookingError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export async function createBooking({
  departureId,
  guestName,
  guestEmail,
  guestPhone,
  seatCount,
}) {
  return prisma.$transaction(async (tx) => {
    const departure = await tx.tripDeparture.findUnique({
      where: { id: departureId },
      include: {
        trip: { select: { id: true, slug: true, title: true } },
      },
    })

    if (!departure) {
      throw new BookingError('Trip departure not found', 404)
    }

    if (departure.status !== 'OPEN') {
      throw new BookingError('This departure is no longer accepting bookings', 409)
    }

    if (departure.availableSeats < seatCount) {
      throw new BookingError(
        `Only ${departure.availableSeats} seat${departure.availableSeats === 1 ? '' : 's'} left for this departure`,
        409,
      )
    }

    const totalAmountInPaise = departure.priceInPaise * seatCount
    const newAvailable = departure.availableSeats - seatCount

    await tx.tripDeparture.update({
      where: { id: departureId },
      data: {
        availableSeats: newAvailable,
        ...(newAvailable === 0 && { status: 'FULL' }),
      },
    })

    let bookingRef
    let attempt = 0
    while (attempt < 5) {
      const candidate = generateBookingRef()
      const existing = await tx.booking.findUnique({ where: { bookingRef: candidate } })
      if (!existing) {
        bookingRef = candidate
        break
      }
      attempt++
    }
    if (!bookingRef) {
      throw new BookingError('Could not generate booking reference, please retry', 500)
    }

    const booking = await tx.booking.create({
      data: {
        bookingRef,
        departureId,
        guestName,
        guestEmail,
        guestPhone,
        seatCount,
        totalAmountInPaise,
        status: 'PENDING',
      },
      include: {
        departure: {
          include: {
            trip: {
              select: { id: true, slug: true, title: true, coverImage: true, location: true },
            },
          },
        },
      },
    })

    return booking
  })
}

export async function getBookingById(id) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      departure: {
        include: {
          trip: {
            select: { id: true, slug: true, title: true, coverImage: true, location: true },
          },
        },
      },
    },
  })
}

export { BookingError }
