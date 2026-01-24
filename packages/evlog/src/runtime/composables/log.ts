import type { Log, LogLevel } from '../../types'

const IS_CLIENT = typeof window !== 'undefined'

let clientPretty = true
let clientService = 'client'

const LEVEL_COLORS: Record<string, string> = {
  error: 'color: #ef4444; font-weight: bold',
  warn: 'color: #f59e0b; font-weight: bold',
  info: 'color: #06b6d4; font-weight: bold',
  debug: 'color: #6b7280; font-weight: bold',
}

export function initLog(options: { pretty?: boolean, service?: string } = {}): void {
  clientPretty = options.pretty ?? true
  clientService = options.service ?? 'client'
}

function getConsoleMethod(level: LogLevel): 'log' | 'error' | 'warn' {
  return level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
}

function emitClientWideEvent(level: LogLevel, event: Record<string, unknown>): void {
  const formatted = {
    timestamp: new Date().toISOString(),
    level,
    service: clientService,
    ...event,
  }

  const method = getConsoleMethod(level)

  if (clientPretty) {
    const { level: lvl, service, ...rest } = formatted
    console[method](`%c[${service}]%c ${lvl}`, LEVEL_COLORS[lvl] || '', 'color: inherit', rest)
  } else {
    console[method](JSON.stringify(formatted))
  }
}

function emitClientTaggedLog(level: LogLevel, tag: string, message: string): void {
  if (clientPretty) {
    console[getConsoleMethod(level)](`%c[${tag}]%c ${message}`, LEVEL_COLORS[level] || '', 'color: inherit')
  } else {
    emitClientWideEvent(level, { tag, message })
  }
}

function createLogMethod(level: LogLevel) {
  return function logMethod(tagOrEvent: string | Record<string, unknown>, message?: string): void {
    if (IS_CLIENT) {
      if (typeof tagOrEvent === 'string' && message !== undefined) {
        emitClientTaggedLog(level, tagOrEvent, message)
      } else if (typeof tagOrEvent === 'object') {
        emitClientWideEvent(level, tagOrEvent)
      } else {
        emitClientTaggedLog(level, 'log', String(tagOrEvent))
      }
    } else {
      import('../../logger').then(({ log: serverLog }) => {
        if (typeof tagOrEvent === 'string' && message !== undefined) {
          serverLog[level](tagOrEvent, message)
        } else if (typeof tagOrEvent === 'object') {
          serverLog[level](tagOrEvent)
        } else {
          serverLog[level]('log', String(tagOrEvent))
        }
      })
    }
  }
}

/**
 * Universal logging API - works on both client and server.
 *
 * @example
 * ```ts
 * log.info('auth', 'User logged in')
 * log.info({ action: 'checkout', items: 3 })
 * ```
 */
export const log: Log = {
  info: createLogMethod('info'),
  error: createLogMethod('error'),
  warn: createLogMethod('warn'),
  debug: createLogMethod('debug'),
}
