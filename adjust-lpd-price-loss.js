const fetch = require("node-fetch").default;

const { getSigningClient } = require("./helpers/getSigningClient");
const { getPriceWindow } = require("./helpers/getPriceWindow");
const { updateLPDParams } = require("./helpers/updateLPDParams");
const { calcPriceIncrease } = require("./helpers/calcPriceIncrease");

const { adjustLpdPriceLoss } = require("./domains/adjust-lpd-price-loss");

const { createSlackMessage } = require("./helpers/createSlackMessage");

const {
  SLACK_OFFCHAIN_CHANNEL_WEBHOOK,
  ADMIN_CLP_DEX_MNEMONIC_PATH,
  IS_ACTIVE,
  DRY_RUN,
  SYMBOL,
  BLOCK_WINDOW,
  MOD,
  DAILY_RATE,
  EPOCH_LENGTH,
  MAX_RATE,
  ENABLE_MAX_RATE_MOD,
  INITIAL_BLOCK,
  BLOCK_WINDOW_OFFSET,
} = process.env;

module.exports.handler = async (event, context) => {
  const ports = {
    getSigningClient,
    getPriceWindow,
    updateLPDParams,
    calcPriceIncrease,
    env: {
      ADMIN_CLP_DEX_MNEMONIC_PATH,
      IS_ACTIVE,
      DRY_RUN,
      SYMBOL,
      BLOCK_WINDOW,
      MOD,
      DAILY_RATE,
      EPOCH_LENGTH,
      MAX_RATE,
      ENABLE_MAX_RATE_MOD,
      INITIAL_BLOCK,
      BLOCK_WINDOW_OFFSET,
    },
  };

  const summary = await adjustLpdPriceLoss({ ports });

  await fetch(SLACK_OFFCHAIN_CHANNEL_WEBHOOK, {
    method: "post",
    body: JSON.stringify(
      createSlackMessage({ summary, title: context.functionName })
    ),
    headers: { "Content-Type": "application/json" },
  });
};
