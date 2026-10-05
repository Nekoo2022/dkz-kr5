const { QUEUE_NAME, createChannel } = require("./rabbit");

let channel;

async function connectProducer() {
  const rabbit = await createChannel({ confirm: true });
  channel = rabbit.channel;
  console.log(`Producer подключён к очереди "${QUEUE_NAME}"`);
}

async function publishBookCreated(book) {
  if (!channel) {
    throw new Error("Producer не подключён к RabbitMQ");
  }

  const payload = {
    event: "book.created",
    book,
  };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  await channel.waitForConfirms();

  console.log("Сообщение отправлено в очередь:", payload);
}

module.exports = { connectProducer, publishBookCreated };
