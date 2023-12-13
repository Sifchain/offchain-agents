const fetch = require("node-fetch").default;

module.exports.getOsmosisPrice = getOsmosisPrice;

async function getOsmosisPrice(tokenSymbol) {
  // chech tokenSymbol is set
  if (!tokenSymbol) {
    throw new Error("tokenSymbol must be set");
  }

  try {
    const url = `https://api-osmosis.imperator.co/tokens/v2/price/${tokenSymbol}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${data.message}`);
    }

    return data.price;
  } catch (error) {
    console.error("Error fetching Osmosis price:", error.message);
    throw error;
  }
}
