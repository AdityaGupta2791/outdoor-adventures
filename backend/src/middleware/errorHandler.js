import { logger } from '../lib/logger.js'
import { env } from '../config/env.js'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500

  logger.error({ err, path: req.path, method: req.method }, 'Request failed')

  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  })
}
