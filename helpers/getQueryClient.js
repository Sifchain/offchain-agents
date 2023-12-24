const { createQueryClient } = require("@sifchain/stargate");

const { RPC_ENDPOINT } = process.env;

module.exports.getQueryClient = getQueryClient;

async function getQueryClient() {
  const node = `${RPC_ENDPOINT}`;

  const queryClient = await createQueryClient(node);

  return { queryClient };
}
