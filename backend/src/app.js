import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import { requestLogger } from './middleware/requestLogger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import tripsRouter from './modules/trips/trips.routes.js'
import bookingsRouter from './modules/bookings/bookings.routes.js'
import paymentsRouter from './modules/payments/payments.routes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/trips', tripsRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/payments', paymentsRouter)
// app.use('/api/auth', authRouter)
// app.use('/api/llm', llmRouter)

app.use(notFound)
app.use(errorHandler)

export default app
