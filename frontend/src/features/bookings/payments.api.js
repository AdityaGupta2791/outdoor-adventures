import { api } from '../../lib/axios'

export async function createPaymentOrder(bookingId) {
  const { data } = await api.post('/payments/create-order', { bookingId })
  return data
}

export async function verifyPayment(payload) {
  const { data } = await api.post('/payments/verify', payload)
  return data.booking
}

let scriptPromise = null

export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => {
      scriptPromise = null
      resolve(false)
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}
