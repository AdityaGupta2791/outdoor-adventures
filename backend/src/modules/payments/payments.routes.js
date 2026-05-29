import { Router } from 'express'
import * as paymentsController from './payments.controller.js'

const router = Router()

router.get('/status', paymentsController.status)
router.post('/create-order', paymentsController.createOrder)
router.post('/verify', paymentsController.verifyPayment)
router.post('/webhook', paymentsController.webhook)

export default router
