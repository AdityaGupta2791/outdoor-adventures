import { tripListQuerySchema, tripSlugParamSchema } from './trips.validators.js'
import * as tripsService from './trips.service.js'

export async function listTrips(req, res, next) {
  try {
    const parsed = tripListQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid query parameters', issues: parsed.error.flatten() },
      })
    }
    const result = await tripsService.listTrips(parsed.data)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getTripBySlug(req, res, next) {
  try {
    const parsed = tripSlugParamSchema.safeParse(req.params)
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid slug', issues: parsed.error.flatten() },
      })
    }
    const trip = await tripsService.getTripBySlug(parsed.data.slug)
    if (!trip) {
      return res.status(404).json({ error: { message: 'Trip not found' } })
    }
    res.json({ trip })
  } catch (err) {
    next(err)
  }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await tripsService.listCategories()
    res.json({ categories })
  } catch (err) {
    next(err)
  }
}
