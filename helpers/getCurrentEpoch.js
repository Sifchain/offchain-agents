module.exports.getCurrentEpoch = getCurrentEpoch;

async function getCurrentEpoch({ queryClient, identifier }) {
  const { currentEpoch } = await queryClient.epochs.currentEpoch({
    identifier,
  });

  const currentEpochNumber = currentEpoch.toNumber();

  return currentEpochNumber;
}
