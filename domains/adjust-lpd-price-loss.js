module.exports.adjustLpdPriceLoss = adjustLpdPriceLoss;

async function adjustLpdPriceLoss({ ports }) {
  const isActive = ports.env.IS_ACTIVE === "true"; // if false turn off LPD entirely
  const dryRun = ports.env.DRY_RUN === "true"; // if true turn off LPD parameter update
  const blockWindow = Number(ports.env.BLOCK_WINDOW); // time period to apply adjusted rate
  const mod = Number(ports.env.MOD); // LPD mod = 100
  const dailyRate = Number(ports.env.DAILY_RATE); // 7.5%
  const epochLength = Number(ports.env.EPOCH_LENGTH); // daily block length (14'400)
  const maxRate = Number(ports.env.MAX_RATE); // 30%, max LPD mod rate
  const enableMaxRateMod = ports.env.ENABLE_MAX_RATE_MOD === "true"; // if true, max rate is scaled down to mod cycle
  const initialBlock = Number(ports.env.INITIAL_BLOCK); // initial block used to retrieve initial price and elapsedMods
  const blockWindowOffset = Number(ports.env.BLOCK_WINDOW_OFFSET); // number of blocks used to offset block window so all the LPD cycles happens between start and end block (50)

  const { signingClient, account } = await ports.getSigningClient(
    ports.env.ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // 1) calc priceTarget = initialPrice * (1 + baseRate) ^ ((currentHeight - initialHeight) / mod) (baseRate ~0.0005%, mod = 100)
  // 2) if currentPrice is gth or eq to priceTarget then newRate = baseRate
  // 3) otherwise calc priceTargetRate to reach priceTarget from currentPrice + baseRate; newRate = calcPriceIncrease(priceTarget, currentPrice) + baseRate
  // 4) if newRate gth than maxRate (30%) then newRate = maxRate

  const blockWindowBaseRate =
    (1 + dailyRate) ** (blockWindow / epochLength) - 1;
  const baseRate = (1 + dailyRate) ** (mod / epochLength) - 1;

  const {
    initialPrice,
    currentPrice,
    pastPrice,
    priceChange,
    initialHeight,
    currentHeight,
  } = await ports.getPriceWindow({
    symbol: ports.env.SYMBOL,
    blockWindow,
    initialBlock,
  });

  const elapsedMods = (currentHeight - initialHeight) / mod;

  const priceTarget = initialPrice * (1 + baseRate) ** elapsedMods;
  const priceTargetRate = ports.calcPriceIncrease({
    newPrice: priceTarget,
    oldPrice: currentPrice,
  });
  const priceTargetMissed = currentPrice - priceTarget < 0;

  const bonusRate = priceTargetMissed
    ? (1 + priceTargetRate) ** (mod / blockWindow) - 1
    : 0;
  const maxModRate = enableMaxRateMod
    ? (1 + maxRate) ** (mod / blockWindow) - 1
    : maxRate;
  const newRate = Math.min(baseRate + bonusRate, maxModRate);

  const startBlock = currentHeight - blockWindowOffset;
  const endBlock = currentHeight + blockWindow - blockWindowOffset;

  const summary = {
    isActive,
    initialHeight,
    currentHeight,
    elapsedMods,
    initialPrice,
    blockWindow,
    mod,
    dailyRate,
    epochLength,
    maxRate,
    maxModRate,
    blockWindowBaseRate,
    priceTarget,
    priceTargetRate,
    priceTargetMissed,
    baseRate,
    bonusRate,
    newRate,
    pastPrice,
    currentPrice,
    priceChange,
    startBlock,
    endBlock,
    blockWindowOffset,
  };
  console.table(summary);

  if (!dryRun) {
    await ports.updateLPDParams({
      account,
      signingClient,
      isActive,
      blockRate: newRate,
      startBlock,
      endBlock,
      mod,
    });
  }

  return summary;
}
