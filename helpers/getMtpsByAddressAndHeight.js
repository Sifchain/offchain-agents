const fetch = require("node-fetch").default;

const { API_PROTOCOL, API_HOSTNAME, API_PORT } = process.env;

module.exports.getMtpsByAddressAndHeight = getMtpsByAddressAndHeight;

async function getMtpsByAddressAndHeight({ address, height }) {
  const api = `${API_PROTOCOL}://${API_HOSTNAME}:${API_PORT}`;

  const { height: _height, result } = await (
    await fetch(
      `${api}/margin/mtps-by-address?address=${address}${
        height ? `&height=${height}` : ``
      }`
    )
  ).json();

  return { height: Number(_height), mtps: result.mtps || [] };
}
