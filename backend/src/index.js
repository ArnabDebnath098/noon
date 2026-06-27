import { createApp } from './app.js'
import { config } from './config/index.js'

const app = createApp()

app.listen(config.port, () => {
  console.log(`noon backend listening on http://localhost:${config.port}`)
  console.log(`serving storage from: ${config.storageDir}`)
})
