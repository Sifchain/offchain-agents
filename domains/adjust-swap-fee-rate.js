const { Decimal } = require("@cosmjs/math");

module.exports.adjustSwapFeeRate = adjustSwapFeeRate;

async function adjustSwapFeeRate({ ports }) {
  // spec: https://hackmd.io/MhRTYAsfR2qtP83jvmDdmQ?view#Swap-Fee-Changing-Over-Time
  //
  // get current block height and max swap fee rate
  // get rowan_swap_fee from CLP params
  // get past intra_epoch_length blocks swap_successful events with swap_begin_token = rowan and height > current_height - intra_epoch_length
  // if found events and total amount sold gth than min total amount then stop
  // if no events found reduce rowan_swap_fee by sf_increment and stop

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // get current_height
  const {
    height: currentHeight,
    pool: { swapPriceNative },
  } = await ports.getPool({
    queryClient,
    symbol: ports.env.MIN_TOTAL_ASSET,
  });

  // get max_swap_fee
  const maxSwapFee = Decimal.fromUserInput(ports.env.MAX_SWAP_FEE, 18);

  // get swap fee params
  const { defaultRate, tokenParams } = await ports.getSwapFeeParams({
    queryClient,
  });
  const rowanSwapFee = tokenParams.rowan || maxSwapFee;

  const summary = {
    currentHeight,
    maxSwapFee: maxSwapFee.toString(),
    defaultRate: defaultRate.toString(),
    rowanSwapFee: rowanSwapFee.toString(),
  };

  // get intra_epoch_length
  const intraEpochLength = Number(ports.env.INTRA_EPOCH_LENGTH);
  summary.intraEpochLength = intraEpochLength;

  const notEnoughBlocksAvailable = currentHeight < intraEpochLength;

  // not enough blocks available
  if (notEnoughBlocksAvailable) {
    summary.notEnoughBlocksAvailable = notEnoughBlocksAvailable;
    return summary;
  }

  // get count_swap_txs
  const {
    rows: [{ count_swap_txs, total_amount }],
  } = await ports.queryDB(
    "select count(height) as count_swap_txs, sum(swap_begin_amount) as total_amount from events_audit where type='swap_successful' and swap_begin_token='rowan' and height>$1 and height<=$2",
    [currentHeight - intraEpochLength, currentHeight]
  );

  const countSwapTxs = Number(count_swap_txs);
  summary.countSwapTxs = countSwapTxs;
  const totalAmountInRowan = Number(total_amount);
  summary.totalAmountInRowan = totalAmountInRowan;
  const totalAmount = totalAmountInRowan * Number(swapPriceNative);
  summary.totalAmount = totalAmount;
  const minTotalAmount = Number(ports.env.MIN_TOTAL_AMOUNT);
  summary.minTotalAmount = minTotalAmount;
  const foundSwaps = countSwapTxs > 0;
  summary.foundSwaps = foundSwaps;

  // if found events then skip
  if (foundSwaps && totalAmount >= minTotalAmount) {
    return summary;
  }

  // get sf_increment
  const sfIncrement = Decimal.fromUserInput(ports.env.SF_INCREMENT, 18);
  summary.sfIncrement = sfIncrement.toString();

  // if no events found then reduce rowan_swap_fee by sf_increment
  const newRowanSwapFee = rowanSwapFee.isGreaterThan(sfIncrement)
    ? rowanSwapFee.minus(sfIncrement)
    : defaultRate;
  summary.newRowanSwapFee = newRowanSwapFee.toString();
  tokenParams.rowan = newRowanSwapFee;

  await ports.updateSwapFeeParams({
    signingClient,
    account,
    defaultRate,
    tokenParams,
  });
  return summary;
}
