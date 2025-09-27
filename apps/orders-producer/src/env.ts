/** biome-ignore-all lint/style/noProcessEnv: This is the only file to handle process.env. All other access should come through imports of this file. */
import { config } from 'dotenv'
import { z } from 'zod'

if (!process.env.NODE_ENV) {
  throw new Error('No NODE_ENV provided. Make sure to set it and try again.')
}
config({ path: [`.env.${process.env.NODE_ENV}`, `.env.${process.env.NODE_ENV}.local`], quiet: true })

const envSchema = z.object({
  NODE_ENV: z.enum(['orders', 'payments']).describe('Selects which producer to launch.'),
  ENV_FILE: z.string().optional().describe('Optional explicit path to the env file that should override defaults.'),
  KAFKA_BROKERS: z
    .string()
    .min(1, 'KAFKA_BROKERS is required')
    .transform((brokers) =>
      brokers
        .split(',')
        .map((broker) => broker.trim())
        .filter(Boolean),
    )
    .describe('Comma-separated list of brokers.'),
  KAFKA_CLIENT_ID: z
    .string()
    .min(1, 'KAFKA_CLIENT_ID is required')
    .describe('Label Kafka shows in logs/metrics for this producer connection.'),
  KAFKA_PRODUCER_ID: z.coerce
    .bigint()
    .default(1n)
    .describe('Stable 64-bit identifier used so Kafka can dedupe idempotent sends.'),
  KAFKA_TOPIC: z
    .string()
    .min(1, 'KAFKA_TOPIC is required')
    .describe('Topic name the current producer should publish into.'),
  KAFKA_HEADER_SOURCE: z
    .string()
    .min(1, 'KAFKA_HEADER_SOURCE is required')
    .optional()
    .describe('Optional header value identifying the producer; defaults are scenario-specific.'),
  ORDER_BATCH_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .describe('How many messages to emit before exiting.'),
  ORDER_PAUSE_MS: z.coerce
    .number()
    .int()
    .min(0)
    .default(250)
    .describe('Delay in milliseconds between messages to avoid flooding Kafka.'),
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

export type Env = typeof env
