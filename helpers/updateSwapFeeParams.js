const { gasFee } = require("./constants");

module.exports.updateSwapFeeParams = updateSwapFeeParams;

async function updateSwapFeeParams({
  account,
  signingClient,
  defaultRate,
  tokenParams,
}) {
  const msgs = [
    {
      typeUrl: "/sifnode.clp.v1.MsgUpdateSwapFeeParamsRequest",
      value: {
        signer: account.address,
        defaultSwapFeeRate: defaultRate.atomics,
        tokenParams: Object.entries(tokenParams).map(([asset, rate]) => ({
          asset,
          swapFeeRate: rate.atomics,
        })),
      },
    },
  ];
  const checkTx = await signingClient.signAndBroadcast(
    account.address,
    msgs,
    gasFee
  );
  console.log(checkTx);
}
