// @ts-ignore
import {wait} from "~/utils/wait";
import {jsonSerializer, Producer, stringSerializer} from "@platformatic/kafka";
import {customAlphabet} from "nanoid";
import {buildOrder} from "~/utils/buildOrder.js";
import {Order} from "~/types.js";

const brokers = (process.env.KAFKA_BROKERS ?? "localhost:9092")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

const topic = process.env.ORDERS_TOPIC ?? "orders";
const batchSize = Number.parseInt(process.env.ORDER_BATCH_SIZE ?? "10", 10);
const pauseMs = Number.parseInt(process.env.ORDER_PAUSE_MS ?? "250", 10);

const generateId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 12);

if (brokers.length === 0) {
  throw new Error("KAFKA_BROKERS must include at least one broker address");
}

const producer = new Producer<string, Order, string, string>({
  clientId: "orders-producer",
  bootstrapBrokers: brokers,
  serializers: {
    key: stringSerializer,
    value: jsonSerializer<Order>,
    headerKey: stringSerializer,
    headerValue: stringSerializer,
  },
});

for (let i = 0; i < batchSize; i += 1) {
  const order = buildOrder();

  await producer.send({
    messages: [
      {
        topic,
        key: order.orderId,
        value: order,
        headers: {
          "content-type": "application/json",
          source: "orders-producer",
        },
      },
    ],
  });

  console.log(`Sent order ${order.orderId} (${i + 1}/${batchSize})`);

  if (pauseMs > 0 && i < batchSize - 1) {
    await wait(pauseMs);
  }
}

await producer.close();
console.log("Producer disconnected. Done.");
