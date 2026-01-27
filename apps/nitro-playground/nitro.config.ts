import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './',
  plugins: ['./node_modules/evlog/nitro'],
})
