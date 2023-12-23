const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const {
  addLiquidityToRewardsBucket: addLiquidityToRewardsBucketDomain,
} = require("../domains/add-liquidity-to-rewards-bucket");
const {
  addLiquidityToRewardsBucket,
} = require("../helpers/addLiquidityToRewardsBucket");
const { createSlackMessage } = require("../helpers/createSlackMessage");
const { getUserBalances } = require("../helpers/getUserBalances");
const { getCurrentEpoch } = require("../helpers/getCurrentEpoch");

const { SLACK_OFFCHAIN_CHANNEL_WEBHOOK, ADMIN_CLP_DEX_MNEMONIC_PATH } =
  process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getSigningClient,
    getUserBalances,
    getCurrentEpoch,
    addLiquidityToRewardsBucket,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
    },
  };

  const summary = await addLiquidityToRewardsBucketDomain({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
