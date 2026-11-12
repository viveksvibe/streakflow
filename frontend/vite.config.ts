import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react'
              }
              if (id.includes('framer-motion') || id.includes('lucide-react')) {
                return 'vendor-ui'
              }
              if (id.includes('zustand')) {
                return 'vendor-state'
              }
              if (id.includes('axios') || id.includes('picocolors')) {
                return 'vendor-utils'
              }
              if (id.includes('@react-oauth/google')) {
                return 'vendor-auth'
              }
              if (id.includes('react-hot-toast')) {
                return 'vendor-toast'
              }
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
