import { defineNitroPlugin } from 'nitropack/runtime'
import { createRequestLogger, initLogger } from '../logger'
import type { RequestLogger } from '../types'

interface ServerEvent {
  method: string
  path: string
  context: {
    requestId?: string
    log?: RequestLogger
    [key: string]: unknown
  }
  node?: { res?: { statusCode?: number } }
  response?: Response
}

function getResponseStatus(event: ServerEvent): number {
  // Node.js style
  if (event.node?.res?.statusCode) {
    return event.node.res.statusCode
  }

  // Web Standard
  if (event.response?.status) {
    return event.response.status
  }

  // Context-based
  if (typeof event.context.status === 'number') {
    return event.context.status
  }

  return 200
}

export default defineNitroPlugin((nitroApp) => {
  initLogger()

  nitroApp.hooks.hook('request', (event) => {
    const e = event as ServerEvent
    const log = createRequestLogger({
      method: e.method,
      path: e.path,
      requestId: e.context.requestId || crypto.randomUUID(),
    })
    e.context.log = log
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const e = event as ServerEvent
    const log = e.context.log as RequestLogger | undefined
    if (log) {
      log.set({ status: getResponseStatus(e) })
      log.emit()
    }
  })

  nitroApp.hooks.hook('error', (error, { event }) => {
    const e = event as ServerEvent | undefined
    const log = e?.context.log as RequestLogger | undefined
    if (log) {
      log.error(error as Error)
    }
  })
})
