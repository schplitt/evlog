import type { ErrorOptions } from './types'
import { colors, isServer } from './utils'

/**
 * Structured error with context for better debugging
 *
 * @example
 * ```ts
 * throw new EvlogError({
 *   message: 'Failed to sync repository',
 *   status: 503,
 *   why: 'GitHub API rate limit exceeded',
 *   fix: 'Wait 1 hour or use a different token',
 *   link: 'https://docs.github.com/en/rest/rate-limit',
 *   cause: originalError,
 * })
 * ```
 */
export class EvlogError extends Error {

  readonly status: number
  readonly why?: string
  readonly fix?: string
  readonly link?: string

  constructor(options: ErrorOptions | string) {
    const opts = typeof options === 'string' ? { message: options } : options

    super(opts.message, { cause: opts.cause })

    this.name = 'EvlogError'
    this.status = opts.status ?? 500
    this.why = opts.why
    this.fix = opts.fix
    this.link = opts.link

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EvlogError)
    }
  }

  /**
   * H3 compatibility: statusCode getter for automatic HTTP error handling
   */
  get statusCode(): number {
    return this.status
  }

  /**
   * H3 compatibility: data getter for passing structured error info to frontend
   */
  get data(): { why?: string, fix?: string, link?: string } | undefined {
    if (!this.why && !this.fix && !this.link) return undefined
    return {
      why: this.why,
      fix: this.fix,
      link: this.link,
    }
  }

  /**
   * Format error for console output with colors
   */
  override toString(): string {
    // Use colors only on server (terminal)
    const useColors = isServer()

    const red = useColors ? colors.red : ''
    const yellow = useColors ? colors.yellow : ''
    const cyan = useColors ? colors.cyan : ''
    const dim = useColors ? colors.dim : ''
    const reset = useColors ? colors.reset : ''
    const bold = useColors ? colors.bold : ''

    const lines: string[] = []

    lines.push(`${red}${bold}Error:${reset} ${this.message}`)

    if (this.why) {
      lines.push(`${yellow}Why:${reset} ${this.why}`)
    }

    if (this.fix) {
      lines.push(`${cyan}Fix:${reset} ${this.fix}`)
    }

    if (this.link) {
      lines.push(`${dim}More info:${reset} ${this.link}`)
    }

    if (this.cause) {
      lines.push(`${dim}Caused by:${reset} ${(this.cause as Error).message}`)
    }

    return lines.join('\n')
  }

  /**
   * Convert to plain object for JSON serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      why: this.why,
      fix: this.fix,
      link: this.link,
      cause: this.cause instanceof Error
        ? { name: this.cause.name, message: this.cause.message }
        : undefined,
      stack: this.stack,
    }
  }

}

/**
 * Create an EvlogError (functional alternative to `new EvlogError()`)
 *
 * @example
 * ```ts
 * throw createError({
 *   message: 'Payment failed',
 *   status: 402,
 *   why: 'Card declined by issuer',
 *   fix: 'Try a different payment method',
 * })
 * ```
 */
export function createError(options: ErrorOptions | string): EvlogError {
  return new EvlogError(options)
}

/**
 * Alias for createError - used for auto-imports to avoid conflicts with Nuxt/Nitro's createError
 */
export const createEvlogError = createError
