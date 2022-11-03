const { getPool } = require("./getPool");

test("get pool", async () => {
  const queryClient = {
    clp: {
      getPool: jest.fn(() => ({
        pool: { externalAsset: { symbol: "my-token" } },
      })),
    },
  };

  const { pool } = await getPool({ queryClient, symbol: "my-token" });

  expect(pool).toEqual({ externalAsset: { symbol: "my-token" } });
});
