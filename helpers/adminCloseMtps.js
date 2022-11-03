const { gasFee } = require("./constants");

module.exports.adminCloseMtps = adminCloseMtps;

async function adminCloseMtps({
  account,
  signingClient,
  mtpsToClose,
  takeMarginFund = false,
}) {
  const msgs = mtpsToClose.map(({ id, mtpAddress }) => ({
    typeUrl: "/sifnode.margin.v1.MsgAdminClose",
    value: {
      signer: account.address,
      mtpAddress,
      id: id.toString(),
      takeMarginFund,
    },
  }));
  const checkTx = await signingClient.signAndBroadcast(
    account.address,
    msgs,
    gasFee
  );
  console.log(checkTx);
}
