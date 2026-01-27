import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './',
  // TODO: make playground work with evlog/nitro/v3
  plugins: ['../../packages/evlog/src/nitrov3/plugin.ts']
})
