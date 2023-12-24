const fetch = require("node-fetch").default;

const { API_ENDPOINT } = process.env;

module.exports.getPoolBySymbolAndHeight = getPoolBySymbolAndHeight;

async function getPoolBySymbolAndHeight({ symbol, height }) {
  const api = `${API_ENDPOINT}`;

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
