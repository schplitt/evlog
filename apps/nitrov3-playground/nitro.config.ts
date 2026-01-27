import { defineConfig } from 'nitro'

export default defineConfig({
  serverDir: './',
  // TODO: make playground work with evlog/nitrov3
  plugins: ['../../packages/evlog/src/nitrov3/plugin.ts']
})
