export { EvlogError, createError, createEvlogError } from './error'
export { createRequestLogger, getEnvironment, initLogger, log } from './logger'
export { useLogger } from './runtime/composables/useLogger'
export { parseError } from './runtime/composables/parseError'

export type {
  BaseWideEvent,
  EnvironmentContext,
  ErrorOptions,
  EvlogEventContext,
  Log,
  LoggerConfig,
  LogLevel,
  RequestLogger,
  WideEvent,
} from './types'

export type { ParsedError } from './runtime/composables/parseError'
