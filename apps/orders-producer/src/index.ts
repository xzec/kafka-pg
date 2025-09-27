import { jsonSerializer, Producer, stringSerializer } from '@platformatic/kafka'
import { env } from '~/env'
import type { Order } from '~/types'
import { buildOrder } from '~/utils/buildOrder'
import { wait } from '~/utils/wait'

const batchSize = env.ORDER_BATCH_SIZE
const pauseMs = env.ORDER_PAUSE_MS

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
          source: env.KAFKA_HEADER_SOURCE,
        },
      },
    ],
  })

  console.log(`Sent order ${order.orderId} (${i + 1}/${batchSize})`)

  if (pauseMs > 0 && i < batchSize - 1) {
    await wait(pauseMs)
  }
}

await producer.close()
console.log('Producer disconnected. Done.')
