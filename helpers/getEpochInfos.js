module.exports.getEpochInfos = getEpochInfos;

async function getEpochInfos({ queryClient }) {
  const { epochs } = await queryClient.epochs.epochInfos();

  const epochsObj = epochs.reduce(
    (acc, epoch) => ({ ...acc, [epoch.identifier]: epoch }),
    {}
  );

  return epochsObj;
}
