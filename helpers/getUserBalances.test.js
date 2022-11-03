const { getUserBalances } = require("./getUserBalances");

test("get user balances", async () => {
  const queryClient = {
    bank: {
      allBalances: jest.fn(() => []),
    },
  };

  const balances = await getUserBalances({
    queryClient,
    account: { address: "sif1234" },
  });

  expect(balances).toEqual({ balances: [] });
});
