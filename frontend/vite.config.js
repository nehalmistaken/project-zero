import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {proxy: {'/analysis-api': {target: 'http://127.0.0.1:5001', rewrite: p=>p.replace('/analysis-api','')}}},
  preview: {proxy: {'/analysis-api': {target: 'http://127.0.0.1:5001', rewrite: p=>p.replace('/analysis-api','')}}},
})
