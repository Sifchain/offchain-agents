const { gasFee } = require("./constants");

module.exports.updateLiquidityProtectionParams = async ({
  account,
  signingClient,
  maxRowanLiquidityThreshold = "1000000000000",
  currentRowanLiquidityThreshold = "1000000000000",
  maxRowanLiquidityThresholdAsset = "cusdc",
  epochLength = 14400,
  isActive = true,
}) => {
  const msgs = [
    {
      typeUrl: "/sifnode.clp.v1.MsgUpdateLiquidityProtectionParams",
      value: {
        signer: account.address,
        maxRowanLiquidityThreshold,
        maxRowanLiquidityThresholdAsset,
        epochLength,
        isActive,
      },
    },
    {
      typeUrl: "/sifnode.clp.v1.MsgModifyLiquidityProtectionRates",
      value: {
        signer: account.address,
        currentRowanLiquidityThreshold,
      },
    },
  ];
  const checkTx = await signingClient.signAndBroadcast(
    account.address,
    msgs,
    gasFee
  );
  console.log(checkTx);
};
