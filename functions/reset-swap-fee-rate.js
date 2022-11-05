const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const { resetSwapFeeRate } = require("../domains/reset-swap-fee-rate");
const { getSwapFeeParams } = require("../helpers/getSwapFeeParams");
const { updateSwapFeeParams } = require("../helpers/updateSwapFeeParams");
const { createSlackMessage } = require("../helpers/createSlackMessage");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  MAX_SWAP_FEE,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getSigningClient,
    getSwapFeeParams,
    updateSwapFeeParams,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
      MAX_SWAP_FEE,
    },
  };

  const summary = await resetSwapFeeRate({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
