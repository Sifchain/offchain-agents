const { gasFee } = require("./constants");

module.exports.closeMtps = closeMtps;

async function closeMtps({ account, signingClient, ids }) {
  const msgs = ids.map((id) => ({
    typeUrl: "/sifnode.margin.v1.MsgClose",
    value: {
      signer: account.address,
      id,
    },
  }));
  const checkTx = await signingClient.signAndBroadcast(
    account.address,
    msgs,
    gasFee
  );
  console.log(checkTx);
}
