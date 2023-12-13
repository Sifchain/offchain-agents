module.exports.calcSwapFeeRate = calcSwapFeeRate;

function calcSwapFeeRate(
  priceOsmosis,
  priceSifchain,
  minSwapFeeRate,
  maxSwapFeeRate
) {
  // make sure all inputs are of type Number
  priceOsmosis = Number(priceOsmosis);
  priceSifchain = Number(priceSifchain);
  minSwapFeeRate = Number(minSwapFeeRate);
  maxSwapFeeRate = Number(maxSwapFeeRate);

  // check that none of the inputs are NaN
  if (
    isNaN(priceOsmosis) ||
    isNaN(priceSifchain) ||
    isNaN(minSwapFeeRate) ||
    isNaN(maxSwapFeeRate)
  ) {
    throw new Error("All inputs must be of type Number");
  }

  // both prices must be positive
  if (priceOsmosis <= 0 || priceSifchain <= 0) {
    throw new Error("Both prices must be positive");
  }

  // both max and min swap fee rates must be positive
  if (minSwapFeeRate < 0 || maxSwapFeeRate < 0) {
    throw new Error("Both max and min swap fee rates must be positive");
  }

  // max swap fee rate should be capped at 1
  if (maxSwapFeeRate > 1) {
    throw new Error("Max swap fee rate should be capped at 1");
  }

  // max swap fee rate should be greater than or equal to min swap fee rate
  if (maxSwapFeeRate < minSwapFeeRate) {
    throw new Error(
      "Max swap fee rate should be greater than or equal to min swap fee rate"
    );
  }

  // Calculate the price difference (Delta P)
  let deltaPrice = priceOsmosis - priceSifchain;

  // Determine swap fee rate based on the maximum of price difference and minimum fee, capped at maximum swap fee rate
  let swapFeeRate = Math.min(
    Math.max(deltaPrice / priceSifchain, minSwapFeeRate),
    maxSwapFeeRate
  );

  return swapFeeRate;
}
