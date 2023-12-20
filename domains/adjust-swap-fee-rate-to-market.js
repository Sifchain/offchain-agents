const { Decimal } = require("@cosmjs/math");

module.exports.adjustSwapFeeRateToMarket = adjustSwapFeeRateToMarket;

async function adjustSwapFeeRateToMarket({ ports }) {
  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // get sifchain price
  const {
    height: currentHeight,
    pool: { swapPriceNative: _sifchainPrice },
  } = await ports.getPool({
    queryClient,
    symbol: ports.env.SIFCHAIN_SYMBOL,
  });
  const sifchainPrice = Number(
    Decimal.fromAtomics(_sifchainPrice, 18).toString()
  );

  // get osmosis price
  const osmosisPrice = await ports.getOsmosisPrice(process.env.OSMOSIS_SYMBOL);

  // get max_swap_fee
  const maxSwapFee = ports.env.MAX_SWAP_FEE;

  // get min_swap_fee
  const minSwapFee = ports.env.MIN_SWAP_FEE;

  // get swap fee params
  const { defaultRate, tokenParams } = await ports.getSwapFeeParams({
    queryClient,
  });
  const rowanSwapFee = tokenParams.rowan || maxSwapFee;

  const summary = {
    currentHeight,
    sifchainPrice,
    osmosisPrice,
    maxSwapFee: maxSwapFee,
    minSwapFee: minSwapFee,
    defaultRate: defaultRate.toString(),
    currentRowanSwapFee: rowanSwapFee.toString(),
  };

  // calculate new swap fee
  let newRowanSwapFee = ports.calcSwapFeeRate(
    osmosisPrice,
    sifchainPrice,
    minSwapFee,
    maxSwapFee
  );

  newRowanSwapFee = Decimal.fromUserInput(newRowanSwapFee.toString(), 18);
  summary.newRowanSwapFee = newRowanSwapFee.toString();
  tokenParams.rowan = newRowanSwapFee;

  updated = newRowanSwapFee.toString() !== rowanSwapFee.toString();
  summary.updated = updated;

  if (updated) {
    await ports.updateSwapFeeParams({
      signingClient,
      account,
      defaultRate,
      tokenParams,
    });
  }
  return summary;
}
