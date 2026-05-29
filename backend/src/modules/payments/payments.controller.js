import { createOrderSchema, verifyPaymentSchema } from './payments.validators.js'
import * as paymentsService from './payments.service.js'
import { env } from '../../config/env.js'
import { isRazorpayConfigured, verifyWebhookSignature } from '../../lib/razorpay.js'
import { logger } from '../../lib/logger.js'

export async function createOrder(req, res, next) {
  try {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid request' } })
    }
    const result = await paymentsService.createOrder(parsed.data)
    res.status(201).json({
      orderId: result.orderId,
      amountInPaise: result.amountInPaise,
      currency: result.currency,
      keyId: env.RAZORPAY_KEY_ID,
      booking: {
        id: result.booking.id,
        bookingRef: result.booking.bookingRef,
        guestName: result.booking.guestName,
        guestEmail: result.booking.guestEmail,
        guestPhone: result.booking.guestPhone,
      },
    })
  } catch (err) {
    if (err instanceof paymentsService.PaymentError || err.status) {
      return res.status(err.status || 400).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const parsed = verifyPaymentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid payment payload' } })
    }
    const booking = await paymentsService.verifyAndConfirm(parsed.data)
    res.json({ booking })
  } catch (err) {
    if (err instanceof paymentsService.PaymentError) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function webhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature']
    const rawBody = req.rawBody // Buffer captured via express.json verify hook
    const valid = rawBody && verifyWebhookSignature(rawBody, signature)
    if (!valid) {
      return res.status(400).json({ error: { message: 'Invalid webhook signature' } })
    }

    const event = JSON.parse(rawBody.toString('utf8'))
    if (event.event === 'payment.captured') {
      const entity = event.payload?.payment?.entity
      if (entity?.order_id) {
        await paymentsService.markPaidFromWebhook(entity.order_id, entity.id)
      }
    }
    res.json({ received: true })
  } catch (err) {
    logger.error({ err }, 'Razorpay webhook handling failed')
    res.status(200).json({ received: true })
  }
}

export function status(req, res) {
  res.json({ configured: isRazorpayConfigured() })
}
