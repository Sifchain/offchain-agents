const { queryDB } = require("../helpers/queryDB");
const { getSigningClient } = require("../helpers/getSigningClient");
const { adjustSwapFeeRate } = require("../domains/adjust-swap-fee-rate");
const { getSwapFeeParams } = require("../helpers/getSwapFeeParams");
const { updateSwapFeeParams } = require("../helpers/updateSwapFeeParams");
const { getPool } = require("../helpers/getPool");

const {
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  MAX_SWAP_FEE,
  INTRA_EPOCH_LENGTH,
  SF_INCREMENT,
  POOL_SYMBOL,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getPool,
    queryDB,
    getSigningClient,
    getSwapFeeParams,
    updateSwapFeeParams,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
      MAX_SWAP_FEE,
      INTRA_EPOCH_LENGTH,
      SF_INCREMENT,
      POOL_SYMBOL,
    },
  };

  const summary = await adjustSwapFeeRate({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
