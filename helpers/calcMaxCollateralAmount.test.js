const { calcMaxCollateralAmount } = require("./calcMaxCollateralAmount");

test("1% price impact with 5x leverage", () => {
  const maxCollateralAmount = calcMaxCollateralAmount({
    balance: "45565.367875",
    liabilities: "16243.2",
    priceImpact: 1,
    leverage: 5,
  });
  expect(maxCollateralAmount).toEqual(124.8657936868687);
});

test("1% price impact with 2x leverage", () => {
  const maxCollateralAmount = calcMaxCollateralAmount({
    balance: "45565.367875",
    liabilities: "16243.2",
    priceImpact: 1,
    leverage: 2,
  });
  expect(maxCollateralAmount).toEqual(312.1644842171718);
});

test("15% price impact with 2x leverage", () => {
  const maxCollateralAmount = calcMaxCollateralAmount({
    balance: "45565.367875",
    liabilities: "16243.2",
    priceImpact: 15,
    leverage: 2,
  });
  expect(maxCollateralAmount).toEqual(363.5798110294118);
});
