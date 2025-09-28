import { Consumer, jsonDeserializer, stringDeserializer } from '@platformatic/kafka'

import { env } from '~/env'

export function createConsumer(): Consumer<string, unknown, string, string> {
  return new Consumer<string, unknown, string, string>({
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
}
