import { createError } from 'evlog'

export default defineEventHandler(async (event) => {
  const logger = useLogger(event)

  logger.set({
    user: { id: 'user_789', plan: 'premium' },
    action: 'checkout',
  })

  await new Promise(resolve => setTimeout(resolve, 300))

  throw createError({
    message: 'Payment processing failed',
    status: 402,
    why: 'Card declined by issuer - insufficient funds',
    fix: 'Please use a different payment method or contact your bank',
    link: 'https://docs.example.com/payments/declined',
  })
})
