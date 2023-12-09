const { parseCoins } = require("@cosmjs/stargate");

module.exports.addLiquidityToRewardsBucket = addLiquidityToRewardsBucket;

async function addLiquidityToRewardsBucket({ ports }) {
  // keep adding new liquidity to rewards bucket every hour

  const { signingClient, account } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // get amount
  const amount = parseCoins(ports.env.AMOUNT);

  const summary = {
    amount: amount.toString(),
  };

  await ports.addLiquidityToRewardsBucket({
    signingClient,
    account,
    amount,
  });

  return summary;
}
