/**
 * Environment context automatically included in every log event
 */
export interface EnvironmentContext {
  /** Service name (auto-detected from package.json or configurable) */
  service: string
  /** Environment: 'development', 'production', 'test', etc. */
  environment: 'development' | 'production' | 'test' | string
  /** Application version (auto-detected from package.json) */
  version?: string
  /** Git commit hash (auto-detected from CI/CD env vars) */
  commitHash?: string
  /** Deployment region (auto-detected from cloud provider env vars) */
  region?: string
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Environment context overrides */
  env?: Partial<EnvironmentContext>
  /** Enable pretty printing (auto-detected: true in dev, false in prod) */
  pretty?: boolean
}

/**
 * Base structure for all wide events
 */
export interface BaseWideEvent {
  timestamp: string
  level: 'info' | 'error' | 'warn' | 'debug'
  service: string
  environment: string
  version?: string
  commitHash?: string
  region?: string
}

/**
 * Wide event with arbitrary additional fields
 */
export type WideEvent = BaseWideEvent & Record<string, unknown>

/**
 * Request-scoped logger for building wide events
 *
 * @example
 * ```ts
 * const logger = useLogger(event)
 * logger.set({ user: { id: '123' } })
 * logger.set({ cart: { items: 3 } })
 * // emit() is called automatically by the plugin
 * ```
 */
export interface RequestLogger {
  /**
   * Add context to the wide event (shallow merge)
   */
  set: <T extends Record<string, unknown>>(context: T) => void

  /**
   * Log an error and capture its details
   */
  error: (error: Error | string, context?: Record<string, unknown>) => void

  /**
   * Emit the final wide event with all accumulated context
   */
  emit: (overrides?: Record<string, unknown>) => void

  /**
   * Get the current accumulated context
   */
  getContext: () => Record<string, unknown>
}

/**
 * Log level type
 */
export type LogLevel = 'info' | 'error' | 'warn' | 'debug'

/**
 * Simple logging API - as easy as console.log
 *
 * @example
 * ```ts
 * log.info('auth', 'User logged in')
 * log.error({ action: 'payment', error: 'failed' })
 * ```
 */
export interface Log {
  /**
   * Log an info message or wide event
   * @example log.info('auth', 'User logged in')
   * @example log.info({ action: 'login', userId: '123' })
   */
  info(tag: string, message: string): void
  info(event: Record<string, unknown>): void

  /**
   * Log an error message or wide event
   * @example log.error('payment', 'Payment failed')
   * @example log.error({ action: 'payment', error: 'declined' })
   */
  error(tag: string, message: string): void
  error(event: Record<string, unknown>): void

  /**
   * Log a warning message or wide event
   * @example log.warn('api', 'Rate limit approaching')
   * @example log.warn({ action: 'api', remaining: 10 })
   */
  warn(tag: string, message: string): void
  warn(event: Record<string, unknown>): void

  /**
   * Log a debug message or wide event
   * @example log.debug('cache', 'Cache miss')
   * @example log.debug({ action: 'cache', key: 'user_123' })
   */
  debug(tag: string, message: string): void
  debug(event: Record<string, unknown>): void
}

/**
 * Error options for creating structured errors
 */
export interface ErrorOptions {
  /** What actually happened */
  message: string
  /** HTTP status code (default: 500) */
  status?: number
  /** Why this error occurred */
  why?: string
  /** How to fix this issue */
  fix?: string
  /** Link to documentation or more information */
  link?: string
  /** The original error that caused this */
  cause?: Error
}

/**
 * H3 event context with evlog logger attached
 */
export interface EvlogEventContext {
  log?: RequestLogger
}
