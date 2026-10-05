const { QUEUE_NAME, createChannel } = require("./rabbit");

async function main() {
  const { channel } = await createChannel();
  console.log(`Consumer слушает очередь "${QUEUE_NAME}"`);

  channel.consume(QUEUE_NAME, (message) => {
    if (!message) {
      return;
    }

    const payload = JSON.parse(message.content.toString());
    const { book } = payload;

    console.log("Получено сообщение о созданной книге:");
    console.log(`  id: ${book.id}`);
    console.log(`  название: ${book.title}`);
    console.log(`  год: ${book.year}`);
    console.log(`  authorId: ${book.authorId}`);

    channel.ack(message);
  });
}

main().catch((error) => {
  console.error("Consumer не запустился:", error.message);
  process.exit(1);
});
