const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const {
  adjustSwapFeeRateToMarket,
} = require("../domains/adjust-swap-fee-rate-to-market");
const { getSwapFeeParams } = require("../helpers/getSwapFeeParams");
const { updateSwapFeeParams } = require("../helpers/updateSwapFeeParams");
const { getPool } = require("../helpers/getPool");
const { getOsmosisPrice } = require("../helpers/getOsmosisPrice");
const { calcSwapFeeRate } = require("../helpers/calcSwapFeeRate");
const { createSlackMessage } = require("../helpers/createSlackMessage");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  MAX_SWAP_FEE,
  MIN_SWAP_FEE,
  SIFCHAIN_SYMBOL,
  OSMOSIS_SYMBOL,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getPool,
    getOsmosisPrice,
    calcSwapFeeRate,
    getSigningClient,
    getSwapFeeParams,
    updateSwapFeeParams,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
      MAX_SWAP_FEE,
      MIN_SWAP_FEE,
      SIFCHAIN_SYMBOL,
      OSMOSIS_SYMBOL,
    },
  };

  const summary = await adjustSwapFeeRateToMarket({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
