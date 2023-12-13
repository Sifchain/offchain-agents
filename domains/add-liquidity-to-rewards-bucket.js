const BigNumber = require("bignumber.js");

module.exports.addLiquidityToRewardsBucket = addLiquidityToRewardsBucket;

async function addLiquidityToRewardsBucket({ ports }) {
  let endDate = ports.env.END_DATE;

  // keep adding new liquidity to rewards bucket every hour

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  const summary = {};

  // get wallet balances
  const { balances } = await ports.getUserBalances({ queryClient, account });

  // remove rowan from the list of balances
  let filteredBalances = balances.filter(({ denom }) => denom !== "rowan");

  const hasEnoughBalances = filteredBalances.length > 0;
  summary.hasEnoughBalances = hasEnoughBalances;

  if (!hasEnoughBalances) {
    return summary;
  }

  // convert endDate to Date
  endDate = new Date(endDate);

  // calculate the number of hours left unit endDate
  let hoursLeft = (endDate - Date.now()) / 1000 / 60 / 60;
  // convert hoursLeft to int
  hoursLeft = parseInt(hoursLeft);
  summary.hoursLeft = hoursLeft;

  // hoursLeft must be positive
  if (hoursLeft <= 0) {
    return summary;
  }

  // get the amount of liquidity to add to rewards bucket
  const amount = filteredBalances.map(({ denom, amount }) => ({
    denom,
    amount: BigNumber(amount).dividedBy(hoursLeft).toFixed(0),
  }));

  // convert amount to string
  const amountStr = amount
    .map((coin) => `${coin.amount}${coin.denom}`)
    .join(", ");

  summary.amount = amountStr;

  await ports.addLiquidityToRewardsBucket({
    signingClient,
    account,
    amount,
  });

  return summary;
}
