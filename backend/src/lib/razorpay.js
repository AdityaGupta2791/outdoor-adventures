import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import { env } from '../config/env.js'

let client = null

export function isRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)
}

export function getRazorpay() {
  if (!isRazorpayConfigured()) {
    const err = new Error('Payment gateway is not configured')
    err.status = 503
    throw err
  }
  if (!client) {
    client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    })
  }
  return client
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return safeEqual(expected, signature)
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  return safeEqual(expected, signature)
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}
