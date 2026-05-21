import { Router } from 'express'
import * as tripsController from './trips.controller.js'

const router = Router()

// Order matters: /categories must be declared before /:slug
router.get('/categories', tripsController.listCategories)
router.get('/', tripsController.listTrips)
router.get('/:slug', tripsController.getTripBySlug)

export default router
