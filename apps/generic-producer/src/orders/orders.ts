import { jsonSerializer, Producer, stringSerializer } from '@platformatic/kafka'

import { env } from '~/env'
import { buildOrder } from '~/orders/buildOrder'
import type { Order } from '~/orders/types'
import { wait } from '~/utils/wait'

export async function startOrdersProducer(): Promise<void> {
  const producer = new Producer<string, Order, string, string>({
    producerId: env.KAFKA_PRODUCER_ID,
    clientId: env.KAFKA_CLIENT_ID,
    bootstrapBrokers: env.KAFKA_BROKERS,
    serializers: {
      key: stringSerializer,
      value: jsonSerializer<Order>,
      headerKey: stringSerializer,
      headerValue: stringSerializer,
    },
  })

  const batchSize = env.ORDER_BATCH_SIZE
  const pauseMs = env.ORDER_PAUSE_MS
  const headerSource = env.KAFKA_HEADER_SOURCE ?? 'orders-producer'

  console.log(`Starting orders producer for topic ${env.KAFKA_TOPIC}`)

  try {
    for (let i = 0; i < batchSize; i += 1) {
      const order = buildOrder()

      await producer.send({
        messages: [
          {
            topic: env.KAFKA_TOPIC,
            key: order.orderId,
            value: order,
            headers: {
              'content-type': 'application/json',
              source: headerSource,
            },
          },
        ],
      })

      console.log(`Sent order ${order.orderId} (${i + 1}/${batchSize})`)

      if (pauseMs > 0 && i < batchSize - 1) {
        await wait(pauseMs)
      }
    }
  } finally {
    await producer.close()
    console.log('Orders producer disconnected. Done.')
  }
}
