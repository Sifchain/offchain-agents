const { calcSwapFeeRate } = require("./calcSwapFeeRate");

describe("calcSwapFeeRate function", () => {
  test("calculates swap fee rate for an extreme scenario", () => {
    const priceOsmosis = 0.0014;
    const priceSifchain = "0.01";
    const minSwapFeeRate = "0.005";
    const maxSwapFeeRate = 1;
    const reducerCoefficient = 1;

    const swapFeeRate = calcSwapFeeRate(
      priceOsmosis,
      priceSifchain,
      minSwapFeeRate,
      maxSwapFeeRate,
      reducerCoefficient
    );

    expect(swapFeeRate).toBeCloseTo(1);
  });

  test("calculates swap fee rate for an extreme scenario with reducer coeficient", () => {
    const priceOsmosis = 0.0014;
    const priceSifchain = "0.01";
    const minSwapFeeRate = "0.005";
    const maxSwapFeeRate = 1;
    const reducerCoefficient = 0.9;

    const swapFeeRate = calcSwapFeeRate(
      priceOsmosis,
      priceSifchain,
      minSwapFeeRate,
      maxSwapFeeRate,
      reducerCoefficient
    );

    expect(swapFeeRate).toBeCloseTo(0.9);
  });

  test("calculates swap fee rate for an extreme scenario capped at max swap fee rate", () => {
    const priceOsmosis = 0.0014;
    const priceSifchain = 0.01;
    const minSwapFeeRate = 0.005;
    const maxSwapFeeRate = 0.5;
    const reducerCoefficient = 1;

    const swapFeeRate = calcSwapFeeRate(
      priceOsmosis,
      priceSifchain,
      minSwapFeeRate,
      maxSwapFeeRate,
      reducerCoefficient
    );

    expect(swapFeeRate).toBeCloseTo(0.5);
  });

  test("calculates swap fee rate for a standard scenario", () => {
    const priceOsmosis = 0.0014;
    const priceSifchain = 0.0018;
    const minSwapFeeRate = 0.005;
    const maxSwapFeeRate = 1;
    const reducerCoefficient = 1;

    const swapFeeRate = calcSwapFeeRate(
      priceOsmosis,
      priceSifchain,
      minSwapFeeRate,
      maxSwapFeeRate,
      reducerCoefficient
    );

    expect(swapFeeRate).toBeCloseTo(0.2857142857142857);
  });

  test("calculates swap fee rate for a minimum fee scenario", () => {
    const priceSifchain = 0.001;
    const priceOsmosis = 0.0014;
    const minSwapFeeRate = 0.005;
    const maxSwapFeeRate = 1;
    const reducerCoefficient = 1;

    const swapFeeRate = calcSwapFeeRate(
      priceOsmosis,
      priceSifchain,
      minSwapFeeRate,
      maxSwapFeeRate,
      reducerCoefficient
    );

    expect(swapFeeRate).toBe(minSwapFeeRate);
  });

  test("throws an error for non-positive prices", () => {
    expect(() => calcSwapFeeRate(-0.0018, 0.0014, 0.005, 1, 1)).toThrow(
      "Both prices must be positive"
    );
    expect(() => calcSwapFeeRate(0.0018, -0.0014, 0.005, 1, 1)).toThrow(
      "Both prices must be positive"
    );
    expect(() => calcSwapFeeRate(0, 0.0014, 0.005, 1, 1)).toThrow(
      "Both prices must be positive"
    );
  });
});
