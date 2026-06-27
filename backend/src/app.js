import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import productRoutes from './routes/products.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json())

  // Serve product images / uploads from the separate storage directory.
  app.use('/storage', express.static(config.storageDir))

  // Health check
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

  // Feature routes
  app.use('/api/products', productRoutes)

  return app
}
