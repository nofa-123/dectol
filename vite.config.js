import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
    proxy: {
      // Use the staging server IP locally while preserving Laravel's virtual host.
      // This avoids intermittent local DNS failures for jstaging.system-11.net.
      '/backend-api': {
        target: 'http://195.250.26.84',
        changeOrigin: false,
        secure: false,
        headers: {
          Host: 'jstaging.system-11.net',
        },
        rewrite: (path) => path.replace(/^\/backend-api/, ''),
      },
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'safari16',
    // Route-level code splitting comes from the dynamic imports in the router;
    // the bundler handles vendor chunking on its own.
    chunkSizeWarningLimit: 700,
  },
})
