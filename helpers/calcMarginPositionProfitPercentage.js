const { Decimal } = require("@cosmjs/math");

module.exports.calcMarginPositionProfitPercentage =
  calcMarginPositionProfitPercentage;

function calcMarginPositionProfitPercentage({ mtp }) {
  if (!mtp) {
    return 0;
  }

  mtpHealth = Number(Decimal.fromAtomics(mtp.mtpHealth, 18).toString());
  leverage = Number(Decimal.fromAtomics(mtp.leverage, 18).toString());

  return ((mtpHealth - 1) * (leverage - 1) - 1) * 100;
}
