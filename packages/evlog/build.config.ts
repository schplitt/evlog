import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', name: 'index' },
    { input: 'src/nuxt/module', name: 'nuxt/module' },
    { input: 'src/nitro/plugin', name: 'nitro/plugin' },
    { input: 'src/runtime/composables/index', name: 'runtime/composables/index' },
    { input: 'src/runtime/composables/useLogger', name: 'runtime/composables/useLogger' },
    { input: 'src/runtime/composables/log', name: 'runtime/composables/log' },
    { input: 'src/runtime/plugin.client', name: 'runtime/plugin.client' },
    { input: 'src/error', name: 'error' },
    { input: 'src/logger', name: 'logger' },
    { input: 'src/utils', name: 'utils' },
    { input: 'src/types', name: 'types' },
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
    esbuild: {
      target: 'esnext',
    },
  },
  externals: [
    '#app',
    '#imports',
    'vue',
    'nuxt',
    '@nuxt/kit',
    '@nuxt/schema',
    'nitropack',
    'nitropack/runtime',
  ],
})
