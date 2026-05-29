import { prisma } from '../../config/db.js'
import { getRazorpay, verifyPaymentSignature } from '../../lib/razorpay.js'

class PaymentError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

export async function createOrder({ bookingId }) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, departure: { include: { trip: true } } },
  })

  if (!booking) throw new PaymentError('Booking not found', 404)
  if (booking.status === 'CONFIRMED') {
    throw new PaymentError('This booking is already confirmed', 409)
  }
  if (booking.status === 'CANCELLED') {
    throw new PaymentError('This booking has been cancelled', 409)
  }

  // Reuse an existing CREATED order if one exists (idempotent retries)
  if (booking.payment && booking.payment.status === 'CREATED') {
    return {
      orderId: booking.payment.razorpayOrderId,
      amountInPaise: booking.payment.amountInPaise,
      currency: booking.payment.currency,
      booking,
    }
  }

  const razorpay = getRazorpay()
  const order = await razorpay.orders.create({
    amount: booking.totalAmountInPaise,
    currency: 'INR',
    receipt: booking.bookingRef,
    notes: {
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      tripTitle: booking.departure.trip.title,
    },
  })

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      razorpayOrderId: order.id,
      amountInPaise: booking.totalAmountInPaise,
      currency: 'INR',
      status: 'CREATED',
    },
  })

  return {
    orderId: order.id,
    amountInPaise: booking.totalAmountInPaise,
    currency: 'INR',
    booking,
  }
}

export async function verifyAndConfirm({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  })

  if (!valid) {
    await prisma.payment
      .update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED', razorpayPaymentId: razorpay_payment_id },
      })
      .catch(() => {})
    throw new PaymentError('Payment signature verification failed', 400)
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: razorpay_order_id },
    include: { booking: true },
  })

  if (!payment) throw new PaymentError('Payment record not found', 404)

  // Idempotent: if already paid, just return current booking
  if (payment.status === 'PAID') {
    return getBookingWithDetails(payment.bookingId)
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    }),
  ])

  return getBookingWithDetails(payment.bookingId)
}

async function getBookingWithDetails(bookingId) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
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

export async function markPaidFromWebhook(razorpayOrderId, razorpayPaymentId) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
  })
  if (!payment || payment.status === 'PAID') return

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', razorpayPaymentId },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    }),
  ])
}

export { PaymentError }
