const { Decimal } = require("@cosmjs/math");

const {
  calcMarginPositionProfitPercentage,
} = require("./calcMarginPositionProfitPercentage");

test("calc margin position upnl with no mtp", () => {
  const result = calcMarginPositionProfitPercentage({
    mtp: null,
  });
  expect(result).toEqual(0);
});

test("calc margin position upnl with mtp", () => {
  const result = calcMarginPositionProfitPercentage({
    mtp: {
      mtpHealth: Decimal.fromUserInput("1.25", 18).atomics,
      leverage: Decimal.fromUserInput("5.0", 18).atomics,
    },
  });
  expect(result).toEqual(0);
});

test("calc margin position upnl with mtpHealth set to 1.25 and leverage 5", () => {
  const result = calcMarginPositionProfitPercentage({
    mtp: {
      mtpHealth: Decimal.fromUserInput("1.25", 18).atomics,
      leverage: Decimal.fromUserInput("5.0", 18).atomics,
    },
  });
  expect(result).toEqual(0);
});

test("calc margin position upnl with mtpHealth set to 1.40 and leverage 5", () => {
  const result = calcMarginPositionProfitPercentage({
    mtp: {
      mtpHealth: Decimal.fromUserInput("1.40", 18).atomics,
      leverage: Decimal.fromUserInput("5.0", 18).atomics,
    },
  });
  expect(result).toEqual(59.999999999999964);
});

test("calc margin position upnl with mtpHealth set to 2.77 and leverage 5", () => {
  const result = calcMarginPositionProfitPercentage({
    mtp: {
      mtpHealth: Decimal.fromUserInput("2.772559250000000000", 18).atomics,
      leverage: Decimal.fromUserInput("5.0", 18).atomics,
    },
  });
  expect(result).toEqual(609.0237);
});
