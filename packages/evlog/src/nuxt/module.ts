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

  /**
   * Route patterns to include in logging.
   * Supports glob patterns like '/api/**'.
   * If not set, all routes are logged.
   * @example ['/api/**', '/auth/**']
   */
  include?: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'evlog',
    configKey: 'evlog',
    docs: 'https://evlog.dev',
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
      src: resolver.resolve('../runtime/client/plugin'),
      mode: 'client',
    })

    addImports([
      {
        name: 'log',
        from: resolver.resolve('../runtime/client/log'),
      },
      {
        name: 'createEvlogError',
        from: resolver.resolve('../error'),
      },
      {
        name: 'parseError',
        from: resolver.resolve('../runtime/utils/parseError'),
      },
    ])

    addServerImports([
      {
        name: 'useLogger',
        from: resolver.resolve('../runtime/server/useLogger'),
      },
      {
        name: 'log',
        from: resolver.resolve('../runtime/client/log'),
      },
      {
        name: 'createEvlogError',
        from: resolver.resolve('../error'),
      },
    ])
  },
})
