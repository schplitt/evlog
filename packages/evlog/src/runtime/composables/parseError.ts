import type { FetchError } from 'ofetch'

/**
 * Parsed evlog error with all fields at the top level
 */
export interface ParsedError {
  /** Error message */
  message: string
  /** HTTP status code */
  status: number
  /** Why this error occurred */
  why?: string
  /** How to fix this issue */
  fix?: string
  /** Link to documentation */
  link?: string
  /** Raw error object */
  raw: unknown
}

/**
 * Parse a FetchError into a flat structure with evlog fields
 *
 * @example
 * ```ts
 * try {
 *   await $fetch('/api/checkout')
 * } catch (err) {
 *   const error = parseError(err)
 *
 *   toast.add({
 *     title: error.message,
 *     description: error.why,
 *     color: 'error',
 *   })
 *
 *   if (error.fix) console.info(`💡 Fix: ${error.fix}`)
 *   if (error.link) window.open(error.link)
 * }
 * ```
 */
export function parseError(error: unknown): ParsedError {
  // Handle FetchError from $fetch
  if (error && typeof error === 'object' && 'data' in error) {
    const { data, message: fetchMessage, statusCode: fetchStatusCode } = error as FetchError

    // Extract evlog data from H3 error response
    const evlogData = data?.data as { why?: string, fix?: string, link?: string } | undefined

    return {
      message: data?.message || fetchMessage || 'An error occurred',
      status: data?.statusCode || fetchStatusCode || 500,
      why: evlogData?.why,
      fix: evlogData?.fix,
      link: evlogData?.link,
      raw: error,
    }
  }

  // Handle regular Error
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      raw: error,
    }
  }

  // Handle unknown
  return {
    message: String(error),
    status: 500,
    raw: error,
  }
}
