const fetch = require("node-fetch").default;

const { getSigningClient } = require("../helpers/getSigningClient");
const {
  getMtpsByAddressAndHeight,
} = require("../helpers/getMtpsByAddressAndHeight");
const { getPool } = require("../helpers/getPool");
const { getEvent } = require("../helpers/getEvent");
const { openMtp } = require("../helpers/openMtp");
const { closeMtps } = require("../helpers/closeMtps");
const { marginMarketMaker } = require("./domains/margin-market-maker");
const { getUserBalances } = require("../helpers/getUserBalances");
const { createSlackMessage } = require("../helpers/createSlackMessage");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  USER_MARGIN_MNEMONIC_PATH,
  COLLATERAL_AMOUNT,
  COLLATERAL_ASSET,
  BORROW_ASSET,
  LEVERAGE,
  POSITION,
  DURATION,
  MAX_POSITIONS,
  MIN_POOL_HEALTH,
} = process.env;

module.exports.handler = handler;

async function handler(event, context) {
  const ports = {
    getSigningClient,
    getMtpsByAddressAndHeight,
    getPool,
    getEvent,
    openMtp,
    closeMtps,
    getUserBalances,
    env: {
      USER_MARGIN_MNEMONIC_PATH,
      COLLATERAL_AMOUNT,
      COLLATERAL_ASSET,
      BORROW_ASSET,
      LEVERAGE,
      POSITION,
      DURATION,
      MAX_POSITIONS,
      MIN_POOL_HEALTH,
    },
  };

  const summary = await marginMarketMaker({ ports });
  console.table(summary);

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
}
