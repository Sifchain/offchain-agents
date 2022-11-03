module.exports.getPool = getPool;

async function getPool({ queryClient, symbol }) {
  const { pool, height: _height } = await queryClient.clp.getPool({ symbol });

  return { pool, height: Number(_height) };
}
