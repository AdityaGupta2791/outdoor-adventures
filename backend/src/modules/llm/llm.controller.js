import { searchByNLSchema, tripCopyInputSchema } from './llm.validators.js'
import * as llmService from './llm.service.js'
import { isGeminiConfigured } from '../../lib/gemini.js'
import { logger } from '../../lib/logger.js'

export function status(_req, res) {
  res.json({ configured: isGeminiConfigured() })
}

export async function searchByNL(req, res, next) {
  try {
    const parsed = searchByNLSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid search query', issues: parsed.error.flatten() },
      })
    }
    const result = await llmService.parseAndSearch(parsed.data.query)
    logger.info(
      { query: parsed.data.query, hits: result.trips.length },
      'NL trip search',
    )
    res.json(result)
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function generateTripCopy(req, res, next) {
  try {
    const parsed = tripCopyInputSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: 'Provide title, location, category, difficulty, and durationDays first',
          issues: parsed.error.flatten(),
        },
      })
    }
    const copy = await llmService.generateTripCopy(parsed.data)
    logger.info(
      { title: parsed.data.title, days: parsed.data.durationDays },
      'AI trip-copy generated',
    )
    res.json(copy)
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}
