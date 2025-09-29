/** biome-ignore-all lint/style/noProcessEnv: This is the only file to handle process.env. All other access should come through imports of this file. */
import { config } from 'dotenv'
import { z } from 'zod'

// Load base configuration once so scenario-specific files can override values.
config({ path: '.env', quiet: true })

const commaSeparated = (value: string): string[] =>
  value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

const envSchema = z.object({
  KAFKA_BROKERS: z
    .string()
    .min(1, 'KAFKA_BROKERS is required')
    .transform(commaSeparated)
    .describe('Comma-separated Kafka bootstrap broker list.'),
  KAFKA_CLIENT_ID: z
    .string()
    .min(1, 'KAFKA_CLIENT_ID is required')
    .describe('Identifier shown in Kafka logs for this consumer instance.'),
  KAFKA_GROUP_ID: z
    .string()
    .min(1, 'KAFKA_GROUP_ID is required')
    .describe('Consumer group id so multiple instances can coordinate partitions.'),
  KAFKA_TOPICS: z
    .string()
    .min(1, 'KAFKA_TOPICS is required')
    .transform(commaSeparated)
    .describe('Comma-separated list of topics the consumer subscribes to.'),
  KAFKA_SESSION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(30000)
    .describe('Kafka session timeout in milliseconds for the consumer group.'),
  KAFKA_HEARTBEAT_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(3000)
    .describe('Heartbeat interval in milliseconds between the consumer and Kafka.'),
  KAFKA_AUTOCOMMIT_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5000)
    .describe('Autocommit interval in milliseconds; set 0 to disable automatically committing offsets.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').startsWith('redis://').describe('URL to redis.'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')
  for (const issue of parsedEnv.error.issues) {
    const path = issue.path.join('.') || '(root)'
    console.error(` - ${path}: ${issue.message}`)
  }
  process.exit(1)
}

export const env = parsedEnv.data
