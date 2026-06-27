import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const config = {
  port: process.env.PORT ?? 4000,
  // Where uploaded product images / static assets live (separate storage layer).
  storageDir:
    process.env.STORAGE_DIR ?? path.resolve(__dirname, '../../../storage'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
