import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// Detect Docker environment (libs mounted at /libs)
const isDocker = fs.existsSync('/libs/DDZ.Libs/DDZ.Shared.React')
const backendTarget = process.env.VITE_PROXY_TARGET
  || (isDocker ? 'http://ddz-__appname__-api:8080' : 'http://localhost:5195')
const sharedReactPath = isDocker
  ? '/libs/DDZ.Libs/DDZ.Shared.React/src'
  : path.resolve(__dirname, '../../libs/DDZ.Libs/DDZ.Shared.React/src')
const sharedAdminPath = isDocker
  ? '/libs/DDZ.Libs/DDZ.Shared.Admin/src/frontend/src'
  : path.resolve(__dirname, '../../libs/DDZ.Libs/DDZ.Shared.Admin/src/frontend/src')
const tasksPath = isDocker
  ? '/libs/DDZ.Libs/DDZ.Shared.Tasks/src/frontend/src'
  : path.resolve(__dirname, '../../libs/DDZ.Libs/DDZ.Shared.Tasks/src/frontend/src')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ddz/shared-react': sharedReactPath,
      '@ddz/shared-admin': sharedAdminPath,
      '@ddz/tasks': tasksPath,
      // Force single instance of React packages
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-toastify': path.resolve(__dirname, './node_modules/react-toastify'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
      '@microsoft/signalr': path.resolve(__dirname, './node_modules/@microsoft/signalr'),
      'date-fns': path.resolve(__dirname, './node_modules/date-fns'),
      'lucide-react': path.resolve(__dirname, './node_modules/lucide-react'),
      'class-variance-authority': path.resolve(__dirname, './node_modules/class-variance-authority'),
      'clsx': path.resolve(__dirname, './node_modules/clsx'),
      'tailwind-merge': path.resolve(__dirname, './node_modules/tailwind-merge'),
      '@radix-ui/react-dropdown-menu': path.resolve(__dirname, './node_modules/@radix-ui/react-dropdown-menu'),
      '@tanstack/react-table': path.resolve(__dirname, './node_modules/@tanstack/react-table'),
      'react-day-picker': path.resolve(__dirname, './node_modules/react-day-picker'),
    },
    dedupe: ['react', 'react-dom', 'react-toastify', 'react-day-picker'],
  },
  optimizeDeps: {
    exclude: ['@ddz/shared-react', '@ddz/shared-admin', '@ddz/tasks'],
    include: ['react-toastify'],
  },
  server: {
    port: 5315,
    strictPort: true,
    allowedHosts: true,
    watch: {
      ignored: ['!**/libs/**'],
    },
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/admin': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/status': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/hubs': {
        target: backendTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
