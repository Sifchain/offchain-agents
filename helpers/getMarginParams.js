module.exports.getMarginParams = getMarginParams;

async function getMarginParams({ queryClient }) {
  const { params } = await queryClient.margin.getParams();

  return params;
}
