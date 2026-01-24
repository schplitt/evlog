import type { H3Event } from 'h3'
import { defineNitroPlugin } from 'nitropack/runtime'
import { createRequestLogger, initLogger } from '../logger'
import type { RequestLogger } from '../types'

function getResponseStatus(event: H3Event): number {
  return event.node?.res?.statusCode ?? 200
}

export default defineNitroPlugin((nitroApp) => {
  initLogger()

  nitroApp.hooks.hook('request', (event) => {
    const log = createRequestLogger({
      method: event.method,
      path: event.path,
      requestId: event.context.requestId || crypto.randomUUID(),
    })
    event.context.log = log
  })

  nitroApp.hooks.hook('afterResponse', (event) => {
    const log = event.context.log as RequestLogger | undefined
    if (log) {
      log.set({ status: getResponseStatus(event) })
      log.emit()
    }
  })

  nitroApp.hooks.hook('error', (error, { event }) => {
    const log = event?.context.log as RequestLogger | undefined
    if (log) {
      log.error(error as Error)
    }
  })
})
