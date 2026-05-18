import app from './app.js'
import { env } from './config/env.js'
import { logger } from './lib/logger.js'

const server = app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`)
})

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`)
  server.close(() => {
    logger.info('Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
