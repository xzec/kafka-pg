import { env } from '~/env'
import { createConsumer } from '~/runtime/createConsumer'
import { stringifyValue } from '~/utils/stringifyValue'

console.log(`Connecting to Kafka brokers: ${env.KAFKA_BROKERS.join(', ')}`)
const consumer = createConsumer()

console.log(`Subscribing to topics: ${env.KAFKA_TOPICS.join(', ')} as group ${env.KAFKA_GROUP_ID}`)
const stream = await consumer.consume({ topics: env.KAFKA_TOPICS })

let shuttingDown = false

const shutdown = async (reason: string): Promise<void> => {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  console.log(`Shutting down consumer (${reason})`)

  try {
    consumer.close(true, () => console.log('Consumer shut down.'))
  } catch (error) {
    console.warn('Failed to shut down consumer or stream.', error)
  }
}

stream.on('error', (error) => {
  console.error('Kafka stream emitted error', error)
})

stream.on('autocommit', (error, offsets) => {
  if (error) {
    console.warn(`Autocommit error: ${error.message}`)
    return
  }

  const simplified = offsets.map((entry) => ({
    topic: entry.topic,
    partition: entry.partition,
    offset: entry.offset.toString(),
  }))

  console.log('Offsets autocommitted', simplified)
})

process.once('SIGINT', () => {
  void shutdown('SIGINT')
})

process.once('SIGTERM', () => {
  void shutdown('SIGTERM')
})

try {
  for await (const message of stream) {
    const key = message.key ?? '<null>'
    const headers = Object.fromEntries(message.headers.entries())
    const formattedHeaders = Object.keys(headers).length ? ` headers=${JSON.stringify(headers)}` : ''
    const valueString = stringifyValue(message.value)

    console.log(
      `[${message.topic}] partition=${message.partition} offset=${message.offset.toString()} key=${key} value=${valueString}${formattedHeaders}`,
    )
  }
} catch (error) {
  console.error('Error while consuming messages', error)
  process.exitCode = 1
  await shutdown('error')
}

await shutdown('stream ended')
