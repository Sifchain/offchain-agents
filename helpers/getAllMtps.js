const _ = require("lodash");

module.exports.getAllMtps = getAllMtps;

async function getAllMtps({ queryClient }) {
  const {
    params: { pools },
  } = await queryClient.margin.getParams();

  const mtpsByPool = await Promise.all(
    pools.map(async (asset) => {
      const { mtps } = await queryClient.margin.getPositionsByPool({
        asset,
      });
      return mtps;
    })
  );

  const mtps = _.flatten(mtpsByPool);

  return { mtps };
}
