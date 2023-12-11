const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const { addLiquidityToRewardsBucket: addLiquidityToRewardsBucketDomain } = require("../domains/add-liquidity-to-rewards-bucket");
const { addLiquidityToRewardsBucket } = require("../helpers/addLiquidityToRewardsBucket");
const { createSlackMessage } = require("../helpers/createSlackMessage");
const { getUserBalances } = require("../helpers/getUserBalances");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  END_DATE,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getSigningClient,
    getUserBalances,
    addLiquidityToRewardsBucket,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
      END_DATE,
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
