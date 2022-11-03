const { Decimal } = require("@cosmjs/math");
const { gasFee } = require("./constants");

module.exports.updateLPDParams = async ({
  account,
  signingClient,
  isActive,
  blockRate,
  startBlock,
  endBlock,
  mod,
}) => {
  const msgs = [
    {
      typeUrl: "/sifnode.clp.v1.MsgAddProviderDistributionPeriodRequest",
      value: {
        signer: account.address,
        distributionPeriods: isActive
          ? [
              {
                distributionPeriodBlockRate: Decimal.fromUserInput(
                  blockRate.toFixed(18),
                  18
                ).atomics,
                distributionPeriodStartBlock: startBlock,
                distributionPeriodEndBlock: endBlock,
                distributionPeriodMod: mod,
              },
            ]
          : [],
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
