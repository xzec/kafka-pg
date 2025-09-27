import { Consumer, jsonDeserializer, stringDeserializer } from '@platformatic/kafka'
import { env } from '~/env'

function stringifyValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  try {
    return JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item), 2)
  } catch (error) {
    return `/* unable to stringify value: ${String(error)} */`
  }
}

async function main() {
  const consumer = new Consumer<string, unknown, string, string>({
    groupId: env.KAFKA_GROUP_ID,
    clientId: env.KAFKA_CLIENT_ID,
    bootstrapBrokers: env.KAFKA_BROKERS,
    autocommit: env.KAFKA_AUTOCOMMIT_INTERVAL_MS,
    sessionTimeout: env.KAFKA_SESSION_TIMEOUT_MS,
    heartbeatInterval: env.KAFKA_HEARTBEAT_INTERVAL_MS,
    deserializers: {
      key: stringDeserializer,
      value: jsonDeserializer<unknown>,
      headerKey: stringDeserializer,
      headerValue: stringDeserializer,
    },
  })

  console.log(`Connecting to Kafka brokers: ${env.KAFKA_BROKERS.join(', ')}`)
  console.log(`Subscribing to topics: ${env.KAFKA_TOPICS.join(', ')} as group ${env.KAFKA_GROUP_ID}`)

  const stream = await consumer.consume({
    topics: env.KAFKA_TOPICS,
  })

  let shuttingDown = false

  const shutdown = async (reason: string) => {
    if (shuttingDown) {
      return
    }

    shuttingDown = true
    console.log(`Shutting down consumer (${reason})`)

    try {
      await stream.close()
    } catch (error) {
      console.warn('Error closing Kafka stream', error)
    }

    try {
      await consumer.close()
    } catch (error) {
      console.warn('Error closing Kafka consumer', error)
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
      const headerMap = Object.fromEntries(message.headers.entries())
      const formattedHeaders = Object.keys(headerMap).length ? ` headers=${JSON.stringify(headerMap)}` : ''
      const valueString = stringifyValue(message.value)

      console.log(
        `[${message.topic}] partition=${message.partition} offset=${message.offset.toString()} key=${key} value=${valueString}${formattedHeaders}`,
      )
    }
  } catch (error) {
    console.error('Error while consuming messages', error)
    await shutdown('error')
    process.exitCode = 1
    return
  }

  await shutdown('stream ended')
}

await main()
