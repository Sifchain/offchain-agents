const fetch = require("node-fetch").default;

const { API_ENDPOINT } = process.env;

module.exports.getEvent = getEvent;

async function getEvent({ events }) {
  const api = `${API_ENDPOINT}`;

  const {
    tx_responses: [{ height: _height, logs }],
  } = await (
    await fetch(`${api}/cosmos/tx/v1beta1/txs?events=${events}`)
  ).json();

  return { height: Number(_height), logs };
}
