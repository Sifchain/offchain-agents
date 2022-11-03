const fetch = require("node-fetch").default;

const { API_PROTOCOL, API_HOSTNAME, API_PORT } = process.env;

module.exports.getPoolBySymbolAndHeight = getPoolBySymbolAndHeight;

async function getPoolBySymbolAndHeight({ symbol, height }) {
  const api = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}`;

  const {
    height: _height,
    result: { pool },
  } = await (
    await fetch(
      `${api}/clp/getPool?symbol=${symbol}${height ? `&height=${height}` : ``}`
    )
  ).json();

  return { height: Number(_height), pool };
}
