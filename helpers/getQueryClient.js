const { createQueryClient } = require("@sifchain/stargate");

const { RPC_PROTOCOL, RPC_HOSTNAME, RPC_PORT } = process.env;

module.exports.getQueryClient = getQueryClient;

async function getQueryClient() {
  const node = `${RPC_PROTOCOL}://${RPC_HOSTNAME}:${RPC_PORT}`;

  const queryClient = await createQueryClient(node);

  return { queryClient };
}
