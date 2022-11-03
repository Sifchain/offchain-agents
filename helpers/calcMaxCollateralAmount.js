module.exports.calcMaxCollateralAmount = calcMaxCollateralAmount;

function calcMaxCollateralAmount({
  balance,
  liabilities,
  priceImpact,
  leverage,
}) {
  return (
    (Number(balance) + Number(liabilities)) /
    ((100 - Number(priceImpact)) * Number(leverage))
  );
}
