const fetch = require("node-fetch").default;

const { getSigningClient } = require("./helpers/getSigningClient");
const {
  updateLiquidityProtectionParams,
} = require("./helpers/updateLiquidityProtectionParams");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  MAX_ROWAN_LIQUIDITY_THRESHOLD_PERCENTAGE,
  EPOCH_LENGTH,
  IS_ACTIVE,
} = process.env;

const { createSlackMessage } = require("./helpers/createSlackMessage");

module.exports.handler = async (event, context) => {
  const maxRowanLiquidityThresholdAsset = "rowan";
  const isActive = IS_ACTIVE === "true";

  const { signingClient, account } = await getSigningClient(
    ADMIN_CLP_DEX_MNEMONIC_PATH
  );

  // retrieve pools
  const { pools } = await signingClient
    .getQueryClient()
    .clp.getPools({ limit: 200 });

  // calculate tvl
  const tvl = pools.reduce(
    (acc, { nativeAssetBalance }) => acc + BigInt(nativeAssetBalance),
    0n
  );

  // calculate max threshold value
  const maxRowanLiquidityThreshold =
    (tvl * BigInt(Number(MAX_ROWAN_LIQUIDITY_THRESHOLD_PERCENTAGE) * 100)) /
    (100n * 100n);

  // retrieve current rolling threshold value
  const {
    rateParams: {
      currentRowanLiquidityThreshold: candidateCurrentRowanLiquidityThreshold,
    },
  } = await signingClient.getQueryClient().clp.getLiquidityProtectionParams();

  // make sure current threshold value is equal or lower than new max threshold value
  const currentRowanLiquidityThreshold =
    BigInt(candidateCurrentRowanLiquidityThreshold) <=
    BigInt(maxRowanLiquidityThreshold)
      ? candidateCurrentRowanLiquidityThreshold
      : maxRowanLiquidityThreshold;

  const summary = {
    tvl,
    maxRowanLiquidityThreshold: String(maxRowanLiquidityThreshold),
    currentRowanLiquidityThreshold: String(currentRowanLiquidityThreshold),
    maxRowanLiquidityThresholdAsset,
    epochLength: EPOCH_LENGTH,
    isActive,
  };
  console.table(summary);

  // update liqp params
  await updateLiquidityProtectionParams({
    account,
    signingClient,
    maxRowanLiquidityThreshold: String(maxRowanLiquidityThreshold),
    currentRowanLiquidityThreshold: String(currentRowanLiquidityThreshold),
    maxRowanLiquidityThresholdAsset,
    epochLength: EPOCH_LENGTH,
    isActive,
  });

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
};
