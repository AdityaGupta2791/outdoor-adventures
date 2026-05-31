import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createPaymentOrder, verifyPayment, loadRazorpayScript } from './payments.api'

export function useRazorpayCheckout() {
  const qc = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [dismissedNotice, setDismissedNotice] = useState(null)

  async function startCheckout(booking) {
    setError(null)
    setDismissedNotice(null)
    setIsProcessing(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        throw new Error('Could not load the payment gateway. Check your connection and retry.')
      }

      const order = await createPaymentOrder(booking.id)

      const confirmed = await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency,
          name: 'Outdoor Adventures',
          description: `Booking ${order.booking.bookingRef}`,
          order_id: order.orderId,
          prefill: {
            name: order.booking.guestName,
            email: order.booking.guestEmail,
            contact: order.booking.guestPhone,
          },
          theme: { color: '#228B22' },
          handler: async (response) => {
            try {
              const c = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              qc.setQueryData(['booking', c.id], c)
              resolve(c)
            } catch (err) {
              reject(
                new Error(
                  err?.response?.data?.error?.message ||
                    'Payment verification failed. If money was deducted, contact support with your booking reference.',
                ),
              )
            }
          },
          modal: {
            ondismiss: () => reject(new Error('DISMISSED')),
          },
        })
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp?.error?.description || 'Payment failed. Please try again.'))
        })
        rzp.open()
      })

      return { status: 'confirmed', booking: confirmed }
    } catch (err) {
      if (err.message === 'DISMISSED') {
        setDismissedNotice(
          'Payment was cancelled. Your seats are still held — resume when you’re ready.',
        )
        return { status: 'dismissed' }
      }
      setError(err.message || 'Something went wrong during payment.')
      return { status: 'failed' }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    startCheckout,
    isProcessing,
    error,
    dismissedNotice,
    clearError: () => setError(null),
    clearDismissedNotice: () => setDismissedNotice(null),
  }
}
