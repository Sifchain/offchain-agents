module.exports.getEntries = getEntries;

async function getEntries({ queryClient }) {
  const {
    registry: { entries },
  } = await queryClient.tokenRegistry.entries();

  return entries;
}
