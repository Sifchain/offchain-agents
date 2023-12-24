const fetch = require("node-fetch").default;

const { API_ENDPOINT } = process.env;

module.exports.getMtpsByAddressAndHeight = getMtpsByAddressAndHeight;

async function getMtpsByAddressAndHeight({ address, height }) {
  const api = `${API_ENDPOINT}`;

  const { height: _height, result } = await (
    await fetch(
      `${api}/margin/mtps-by-address?address=${address}${
        height ? `&height=${height}` : ``
      }`
    )
  ).json();

  return { height: Number(_height), mtps: result.mtps || [] };
}
