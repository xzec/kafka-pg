import { customAlphabet } from 'nanoid'

import type { Payment } from '~/payments/types'

const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)
const failureReasons = ['insufficient_funds', 'expired_card', 'gateway_timeout', 'fraud_suspected']

export function buildPayment(): Payment {
  const amount = Number((Math.random() * 900 + 100).toFixed(2))
  const statusOptions: Payment['status'][] = ['pending', 'completed', 'failed']
  const methods: Payment['method'][] = ['card', 'paypal', 'cash', 'wire']
  const status = statusOptions[Math.floor(Math.random() * statusOptions.length)]!

  return {
    paymentId: `pay_${generateId()}`,
    orderId: `order_${generateId().slice(0, 10).toLowerCase()}`,
    amount,
    currency: 'USD',
    status,
    method: methods[Math.floor(Math.random() * methods.length)]!,
    processedAt: new Date().toISOString(),
    failureReason: status === 'failed' ? failureReasons[Math.floor(Math.random() * failureReasons.length)]! : undefined,
  }
}
