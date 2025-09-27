import { type Env, env } from '~/env'

const scenarios = {
  orders: async () => {
    const { startOrdersProducer } = await import('~/orders/orders')
    await startOrdersProducer()
  },
  payments: async () => {
    const { startPaymentsProducer } = await import('~/payments/payments')
    await startPaymentsProducer()
  },
} satisfies Record<Env['NODE_ENV'], () => Promise<void>>

const startScenario = scenarios[env.NODE_ENV]

await startScenario()
