module.exports.marginAutoClosePositions = marginAutoClosePositions;

async function marginAutoClosePositions({ ports }) {
  const profitPercentageThreshold = Number(
    ports.env.PROFIT_PERCENTAGE_THRESHOLD
  );

  const { signingClient, account, queryClient } = await ports.getSigningClient(
    ports.env.ADMIN_MARGIN_MNEMONIC_PATH
  );

  let summary = {};

  // retrieve all mtps
  const { mtps } = await ports.getAllMtps({ queryClient });

  summary.mtps = mtps.length;

  if (!mtps.length) {
    return summary;
  }

  // calc profit percentage for each position (use asset decimals)
  const mtpsWithProfitPercentage = mtps
    .map((mtp) => ({
      ...mtp,
      profitPercentage: ports.calcMarginPositionProfitPercentage({ mtp }),
    }))
    .filter(
      ({ profitPercentage }) => profitPercentage >= profitPercentageThreshold
    )
    .sort(
      (
        { profitPercentage: profitPercentageA },
        { profitPercentage: profitPercentageB }
      ) => profitPercentageB - profitPercentageA
    );

  summary.mtpsToClose = mtpsWithProfitPercentage.length;

  if (!mtpsWithProfitPercentage.length) {
    return summary;
  }

  const [{ id, address: mtpAddress }] = mtpsWithProfitPercentage;

  summary = { ...summary, id: id.toString(), mtpAddress };

  // admin close the first mtp in the list
  await ports.adminCloseMtps({
    account,
    signingClient,
    mtpsToClose: [{ mtpAddress, id }],
  });

  return summary;
}
