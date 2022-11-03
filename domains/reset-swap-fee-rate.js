const { Decimal } = require("@cosmjs/math");

module.exports.resetSwapFeeRate = resetSwapFeeRate;

async function resetSwapFeeRate({ ports }) {
  // spec: https://hackmd.io/MhRTYAsfR2qtP83jvmDdmQ?view#Swap-Fee-Changing-Over-Time
  //
  // reset rowan swap fee rate to max swap fee rate

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // get max_swap_fee
  const maxSwapFee = Decimal.fromUserInput(ports.env.MAX_SWAP_FEE, 18);

  // get swap fee params
  const { defaultRate, tokenParams } = await ports.getSwapFeeParams({
    queryClient,
  });
  const rowanSwapFee = tokenParams.rowan || maxSwapFee;

  const summary = {
    maxSwapFee: maxSwapFee.toString(),
    defaultRate: defaultRate.toString(),
    rowanSwapFee: rowanSwapFee.toString(),
  };

  // reset rowan_swap_fee to max_swap_fee
  const newRowanSwapFee = maxSwapFee;
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
