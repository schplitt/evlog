export { EvlogError, defineError } from './error'
export { createRequestLogger, getEnvironment, initLogger, log } from './logger'
export { useLogger } from './runtime/composables/useLogger'

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
