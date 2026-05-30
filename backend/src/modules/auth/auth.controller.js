import { registerSchema, loginSchema } from './auth.validators.js'
import * as authService from './auth.service.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from '../../lib/auth.js'

function issueSession(res, user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions())
  return accessToken
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        error: { message: 'Invalid details', issues: parsed.error.flatten() },
      })
    }
    const user = await authService.registerUser(parsed.data)
    const accessToken = issueSession(res, user)
    res.status(201).json({ user, accessToken })
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: { message: 'Invalid details' } })
    }
    const user = await authService.loginUser(parsed.data)
    const accessToken = issueSession(res, user)
    res.json({ user, accessToken })
  } catch (err) {
    if (err instanceof authService.AuthError) {
      return res.status(err.status).json({ error: { message: err.message } })
    }
    next(err)
  }
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) {
    return res.status(401).json({ error: { message: 'No active session' } })
  }
  try {
    const payload = verifyToken(token)
    if (payload.type !== 'refresh') throw new Error('wrong token type')
    const user = await authService.getUserById(payload.sub)
    if (!user) throw new Error('user gone')
    const accessToken = issueSession(res, user)
    res.json({ user, accessToken })
  } catch {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
    return res.status(401).json({ error: { message: 'Session expired, please sign in again' } })
  }
}

export async function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
  res.json({ ok: true })
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id)
    if (!user) return res.status(404).json({ error: { message: 'User not found' } })
    res.json({ user })
  } catch (err) {
    next(err)
  }
}

export { issueSession }
