import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import * as llmController from './llm.controller.js'
import { requireAuth, requireAdmin } from '../../middleware/auth.js'

const router = Router()

// Stricter rate limit — LLM calls cost money per request.
const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many AI requests. Please slow down.' } },
})

router.get('/status', llmController.status)
router.post('/search', llmLimiter, llmController.searchByNL)
router.post(
  '/trip-copy',
  requireAuth,
  requireAdmin,
  llmLimiter,
  llmController.generateTripCopy,
)

export default router
