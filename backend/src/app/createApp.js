import cors from 'cors'
import express from 'express'
import { env } from '../config/env.js'
import { registerFeatureRoutes } from './registerFeatureRoutes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ name: 'vinovault-api', status: 'ok' })
  })

  registerFeatureRoutes(app)

  return app
}
