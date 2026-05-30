import { verifyToken } from '../lib/auth.js'

function extractToken(req) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7)
  }
  return null
}

export function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) {
    return res.status(401).json({ error: { message: 'Authentication required' } })
  }
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name }
    next()
  } catch {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } })
  }
}

export function optionalAuth(req, _res, next) {
  const token = extractToken(req)
  if (token) {
    try {
      const payload = verifyToken(token)
      req.user = { id: payload.sub, email: payload.email, role: payload.role, name: payload.name }
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: { message: 'Authentication required' } })
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Admin access required' } })
  }
  next()
}
