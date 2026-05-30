import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const SALT_ROUNDS = 10

export function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export function verifyPassword(plain, hash) {
  if (!hash) return Promise.resolve(false)
  return bcrypt.compare(plain, hash)
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  )
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, env.JWT_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET)
}

export const REFRESH_COOKIE = 'oa_refresh'

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  }
}
