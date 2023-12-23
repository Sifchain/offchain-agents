module.exports.calcSwapFeeRate = calcSwapFeeRate;

function calcSwapFeeRate(
  priceOsmosis,
  priceSifchain,
  minSwapFeeRate,
  maxSwapFeeRate,
  reducerCoefficient
) {
  // make sure all inputs are of type Number
  priceOsmosis = Number(priceOsmosis);
  priceSifchain = Number(priceSifchain);
  minSwapFeeRate = Number(minSwapFeeRate);
  maxSwapFeeRate = Number(maxSwapFeeRate);
  reducerCoefficient = Number(reducerCoefficient);

  // check that none of the inputs are NaN
  if (
    isNaN(priceOsmosis) ||
    isNaN(priceSifchain) ||
    isNaN(minSwapFeeRate) ||
    isNaN(maxSwapFeeRate) ||
    isNaN(reducerCoefficient)
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

  // reducer coefficient should be between 0 and 1
  if (reducerCoefficient < 0 || reducerCoefficient > 1) {
    throw new Error("Reducer coefficient should be between 0 and 1");
  }

  // Calculate the price difference (Delta P)
  let deltaPrice = priceSifchain - priceOsmosis;

  // Determine swap fee rate based on the maximum of price difference and minimum fee, capped at maximum swap fee rate
  let swapFeeRate = Math.min(
    Math.max(deltaPrice / priceOsmosis, minSwapFeeRate),
    maxSwapFeeRate
  );

  // Apply reducer coefficient
  swapFeeRate = swapFeeRate * reducerCoefficient;

  return swapFeeRate;
}
