import { useLogger } from 'evlog'
import { defineHandler } from 'nitro/h3'

export default defineHandler((event) => {
  const log = useLogger(event)
  log.set({
    nitrov3: 'playground',
  })
  return { message: 'Hello from API!' }
})
