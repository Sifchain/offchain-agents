const { gasFee } = require("./constants");

module.exports.addLiquidityToRewardsBucket = addLiquidityToRewardsBucket;

async function addLiquidityToRewardsBucket({ account, signingClient, amount }) {
  const msgs = [
    {
      typeUrl: "/sifnode.clp.v1.MsgAddLiquidityToRewardsBucketRequest",
      value: {
        signer: account.address,
        amount: amount,
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
