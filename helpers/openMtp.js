const { Decimal } = require("@cosmjs/math");
const { gasFee } = require("./constants");

module.exports.openMtp = openMtp;

async function openMtp({
  account,
  signingClient,
  collateralAsset,
  collateralAmount,
  borrowAsset,
  position,
  leverage,
}) {
  const msgs = [
    {
      typeUrl: "/sifnode.margin.v1.MsgOpen",
      value: {
        signer: account.address,
        collateralAsset,
        collateralAmount,
        borrowAsset,
        position: position === "long" ? 1 : 2,
        leverage: Decimal.fromUserInput(leverage.toFixed(18), 18).atomics,
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
