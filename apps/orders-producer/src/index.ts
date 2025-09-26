import { Kafka, logLevel } from "kafkajs";
import { customAlphabet } from "nanoid";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const topic = process.env.ORDERS_TOPIC ?? "orders";
const batchSize = Number.parseInt(process.env.ORDER_BATCH_SIZE ?? "10", 10);
const pauseMs = Number.parseInt(process.env.ORDER_PAUSE_MS ?? "250", 10);

const generateId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

// Build a dummy order document with basic totals and metadata.
function buildOrder() {
  const amount = Number((Math.random() * 900 + 100).toFixed(2));
  const statusOptions = ["pending", "processing", "fulfilled", "cancelled"] as const;
  const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  const paymentMethods = ["card", "paypal", "cash", "wire"] as const;

  return {
    orderId: generateId(),
    customerId: `cust-${generateId().slice(0, 6).toLowerCase()}`,
    amount,
    currency: "USD",
    status,
    paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
    items: Math.floor(Math.random() * 5) + 1,
    createdAt: new Date().toISOString(),
  };
}

async function main() {
  if (brokers.length === 0) {
    throw new Error("KAFKA_BROKERS must include at least one broker address");
  }

  const kafka = new Kafka({
    clientId: "orders-producer",
    brokers,
    logLevel: logLevel.ERROR,
  });

  const producer = kafka.producer();

  console.log(`Connecting to Kafka brokers: ${brokers.join(", ")}`);
  await producer.connect();
  console.log(`Connected. Sending ${batchSize} orders to topic '${topic}'.`);

  for (let i = 0; i < batchSize; i += 1) {
    const order = buildOrder();
    await producer.send({
      topic,
      messages: [
        {
          key: order.orderId,
          value: JSON.stringify(order),
          headers: {
            "content-type": "application/json",
            source: "orders-producer",
          },
        },
      ],
    });

    console.log(`Sent order ${order.orderId} (${i + 1}/${batchSize})`);

    if (pauseMs > 0 && i < batchSize - 1) {
      await new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
  }

  await producer.disconnect();
  console.log("Producer disconnected. Done.");
}

main().catch((error) => {
  console.error("Failed to publish orders", error);
  process.exitCode = 1;
});
