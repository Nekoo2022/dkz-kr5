const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { typeDefs, resolvers } = require("./schema");
const { connectProducer } = require("./producer");

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await connectProducer();

  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
  });

  console.log(`GraphQL API запущен: ${url}`);
  console.log("Apollo Sandbox открывается в браузере по этому адресу");
}

main().catch((error) => {
  console.error("Сервер не запустился:", error.message);
  process.exit(1);
});
