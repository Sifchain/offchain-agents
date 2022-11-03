const { Decimal } = require("@cosmjs/math");

module.exports.getSwapFeeParams = getSwapFeeParams;

async function getSwapFeeParams({ queryClient }) {
  const { defaultSwapFeeRate, tokenParams } =
    await queryClient.clp.getSwapFeeParams();

  return {
    defaultRate: Decimal.fromAtomics(defaultSwapFeeRate, 18),
    tokenParams: tokenParams.reduce(
      (acc, { asset, swapFeeRate }) => ({
        ...acc,
        [asset]: Decimal.fromAtomics(swapFeeRate, 18),
      }),
      {}
    ),
  };
}
