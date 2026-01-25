import type { RequestLogger } from '../../types'

interface ServerEvent {
  context: {
    log?: RequestLogger
    [key: string]: unknown
  }
}

/**
 * Get the request-scoped logger from the event context.
 * Must be called within a server handler.
 *
 * @example
 * ```ts
 * export default defineEventHandler((event) => {
 *   const logger = useLogger(event)
 *   logger.set({ userId: '123' })
 *   logger.set({ action: 'checkout' })
 *   return { ok: true }
 *   // emit() is called automatically by the Nitro plugin
 * })
 * ```
 */
export function useLogger(event: ServerEvent): RequestLogger {
  const log = event.context.log as RequestLogger | undefined

  if (!log) {
    throw new Error(
      '[evlog] Logger not initialized. Make sure the evlog Nitro plugin is registered. '
      + 'If using Nuxt, add "evlog" to your modules.',
    )
  }

  return log
}
