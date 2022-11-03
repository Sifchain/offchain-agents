const { getEntries } = require("./getEntries");

test("get entries", async () => {
  const queryClient = {
    tokenRegistry: {
      entries: jest.fn(() => ({
        registry: { entries: [{ denom: "my-token", decimals: 6 }] },
      })),
    },
  };

  const entries = await getEntries({ queryClient });

  expect(entries).toEqual([{ denom: "my-token", decimals: 6 }]);
});
