const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
const QUEUE_NAME = process.env.QUEUE_NAME || "books.created";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(attempts = 20) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      return connection;
    } catch (error) {
      lastError = error;
      console.log(`RabbitMQ недоступен, попытка ${attempt}/${attempts}...`);
      await delay(1500);
    }
  }

  throw lastError;
}

async function createChannel({ confirm = false } = {}) {
  const connection = await connectWithRetry();
  const channel = confirm
    ? await connection.createConfirmChannel()
    : await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  return { connection, channel };
}

module.exports = {
  RABBITMQ_URL,
  QUEUE_NAME,
  createChannel,
};
