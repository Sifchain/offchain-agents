const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const { getAllMtps } = require("../helpers/getAllMtps");
const { arrayToMap } = require("../helpers/arrayToMap");
const { adminCloseMtps } = require("../helpers/adminCloseMtps");
const {
  calcMarginPositionProfitPercentage,
} = require("../helpers/calcMarginPositionProfitPercentage");
const {
  marginAutoClosePositions,
} = require("./domains/margin-auto-close-positions");
const { createSlackMessage } = require("../helpers/createSlackMessage");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_MARGIN_MNEMONIC_PATH,
  PROFIT_PERCENTAGE_THRESHOLD,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getSigningClient,
    arrayToMap,
    getAllMtps,
    adminCloseMtps,
    calcMarginPositionProfitPercentage,
    env: {
      ADMIN_MARGIN_MNEMONIC_PATH,
      PROFIT_PERCENTAGE_THRESHOLD,
    },
  };

  const summary = await marginAutoClosePositions({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
