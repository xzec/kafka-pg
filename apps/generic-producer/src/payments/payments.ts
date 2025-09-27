import { jsonSerializer, Producer, stringSerializer } from '@platformatic/kafka'

import { env } from '~/env'
import { buildPayment } from '~/payments/buildPayment'
import type { Payment } from '~/payments/types'
import { wait } from '~/utils/wait'

export async function startPaymentsProducer(): Promise<void> {
  const producer = new Producer<string, Payment, string, string>({
    producerId: env.KAFKA_PRODUCER_ID,
    clientId: env.KAFKA_CLIENT_ID,
    bootstrapBrokers: env.KAFKA_BROKERS,
    serializers: {
      key: stringSerializer,
      value: jsonSerializer<Payment>,
      headerKey: stringSerializer,
      headerValue: stringSerializer,
    },
  })

  const batchSize = env.ORDER_BATCH_SIZE
  const pauseMs = env.ORDER_PAUSE_MS
  const headerSource = env.KAFKA_HEADER_SOURCE ?? 'payments-producer'

  console.log(`Starting payments producer for topic ${env.KAFKA_TOPIC}`)

  try {
    for (let i = 0; i < batchSize; i += 1) {
      const payment = buildPayment()

      await producer.send({
        messages: [
          {
            topic: env.KAFKA_TOPIC,
            key: payment.paymentId,
            value: payment,
            headers: {
              'content-type': 'application/json',
              source: headerSource,
              'event-type': 'payment',
            },
          },
        ],
      })

      console.log(`Sent payment ${payment.paymentId} (${i + 1}/${batchSize})`)

      if (pauseMs > 0 && i < batchSize - 1) {
        await wait(pauseMs)
      }
    }
  } finally {
    await producer.close()
    console.log('Payments producer disconnected. Done.')
  }
}
