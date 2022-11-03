const { getMarginParams } = require("./getMarginParams");

test("get margin params", async () => {
  const queryClient = {
    margin: {
      getParams: jest.fn(() => ({ params: { something: true } })),
    },
  };
  const params = await getMarginParams({ queryClient });
  expect(params).toEqual({ something: true });
});
