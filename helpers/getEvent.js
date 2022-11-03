const fetch = require("node-fetch").default;

const { API_PROTOCOL, API_HOSTNAME, API_PORT } = process.env;

module.exports.getEvent = getEvent;

async function getEvent({ events }) {
  const api = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}`;

  const {
    tx_responses: [{ height: _height, logs }],
  } = await (
    await fetch(`${api}/cosmos/tx/v1beta1/txs?events=${events}`)
  ).json();

  return { height: Number(_height), logs };
}
