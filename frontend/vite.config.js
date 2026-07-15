import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Baseline security headers, applied to the dev server and `vite preview`.
// In production these should also be set at the CDN/host level (a CSP is
// intentionally not set here — it would need per-environment tuning for the
// Google Fonts + nooncdn origins and would break dev HMR if too strict).
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: securityHeaders,
    // Proxy API calls to the backend during development so the frontend
    // and backend stay fully decoupled.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
  build: {
    // Split long-lived vendor code from app code so app-only changes don't
    // invalidate the (much larger) vendor chunk in users' caches.
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
