import {
  addImports,
  addPlugin,
  addServerImports,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { EnvironmentContext } from '../types'

export interface ModuleOptions {
  /**
   * Environment context overrides.
   */
  env?: Partial<EnvironmentContext>

  /**
   * Enable pretty printing.
   * @default true in development, false in production
   */
  pretty?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'evlog',
    configKey: 'evlog',
    docs: 'https://github.com/hugorcd/evlog',
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.evlog = options
    nuxt.options.runtimeConfig.public.evlog = {
      pretty: options.pretty,
    }

    addServerPlugin(resolver.resolve('../nitro/plugin'))

    addPlugin({
      src: resolver.resolve('../runtime/plugin.client'),
      mode: 'client',
    })

    addImports([
      {
        name: 'log',
        from: resolver.resolve('../runtime/composables/log'),
      },
      {
        name: 'createEvlogError',
        from: resolver.resolve('../error'),
      },
      {
        name: 'parseError',
        from: resolver.resolve('../runtime/composables/parseError'),
      },
    ])

    addServerImports([
      {
        name: 'useLogger',
        from: resolver.resolve('../runtime/composables/useLogger'),
      },
      {
        name: 'log',
        from: resolver.resolve('../runtime/composables/log'),
      },
      {
        name: 'createEvlogError',
        from: resolver.resolve('../error'),
      },
    ])
  },
})
