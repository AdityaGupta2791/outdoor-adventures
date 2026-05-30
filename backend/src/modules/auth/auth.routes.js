import { Router } from 'express'
import * as authController from './auth.controller.js'
import { issueSession } from './auth.controller.js'
import { requireAuth } from '../../middleware/auth.js'
import { passport, isGoogleConfigured } from '../../config/passport.js'
import { env } from '../../config/env.js'

const router = Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', requireAuth, authController.me)

router.get('/providers', (_req, res) => {
  res.json({ google: isGoogleConfigured() })
})

router.get('/google', (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.status(503).json({ error: { message: 'Google sign-in is not configured' } })
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

router.get('/google/callback', (req, res, next) => {
  if (!isGoogleConfigured()) {
    return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_unavailable`)
  }
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${env.CORS_ORIGIN}/login?error=oauth_failed`)
    }
    issueSession(res, user)
    res.redirect(`${env.CORS_ORIGIN}/auth/callback`)
  })(req, res, next)
})

export default router
