const BigNumber = require("bignumber.js");

module.exports.addLiquidityToRewardsBucket = addLiquidityToRewardsBucket;

const hoursInTwoWeekPeriod = 14 * 24;
const identifier = "hour";

async function addLiquidityToRewardsBucket({ ports }) {
  // keep adding new liquidity to rewards bucket every hour

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  const summary = {};

  // get epoch infos
  const currentEpoch = await ports.getCurrentEpoch({
    queryClient,
    identifier,
  });

  // check that currentEpoch is not null
  const hasCurrentEpoch = currentEpoch !== null;
  summary.hasCurrentEpoch = hasCurrentEpoch;

  if (!hasCurrentEpoch) {
    return summary;
  }

  // get wallet balances
  const { balances } = await ports.getUserBalances({ queryClient, account });

  // remove rowan from the list of balances
  let filteredBalances = balances.filter(({ denom }) => denom !== "rowan");

  const hasEnoughBalances = filteredBalances.length > 0;
  summary.hasEnoughBalances = hasEnoughBalances;

  if (!hasEnoughBalances) {
    return summary;
  }

  // calculate the number of hours left until end of 2-week period
  const hoursLeft =
    hoursInTwoWeekPeriod - (currentEpoch % hoursInTwoWeekPeriod);
  summary.hoursLeft = hoursLeft;

  // hoursLeft must be positive
  if (hoursLeft <= 0) {
    return summary;
  }

  // get the amount of liquidity to add to rewards bucket
  const amount = filteredBalances
    .map(({ denom, amount }) => ({
      denom,
      amount: BigNumber(amount).dividedBy(hoursLeft).toFixed(0),
    }))
    .filter(({ amount }) => amount > 0);

  // convert balance to string
  const balanceStr = filteredBalances
    .map((coin) => `${coin.amount}${coin.denom}`)
    .join(", ");
  summary.balance = balanceStr;
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
