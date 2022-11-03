const { getAllMtps } = require("./getAllMtps");

test("no mtps with one margin-enabled pool", async () => {
  const queryClient = {
    margin: {
      getParams: jest.fn(() => ({
        params: {
          pools: ["cusdc"],
        },
      })),
      getPositionsByPool: jest.fn(() => ({
        mtps: [],
      })),
    },
  };

  const { mtps } = await getAllMtps({ queryClient });

  expect(queryClient.margin.getParams).toHaveBeenCalledTimes(1);
  expect(queryClient.margin.getParams).toHaveBeenCalledWith();
  expect(queryClient.margin.getPositionsByPool).toHaveBeenCalledTimes(1);
  expect(queryClient.margin.getPositionsByPool).toHaveBeenCalledWith({
    asset: "cusdc",
  });

  expect(mtps).toHaveLength(0);
});

test("3 mtps with 2 margin-enabled pools", async () => {
  const queryClient = {
    margin: {
      getParams: jest.fn(() => ({
        params: {
          pools: ["cusdc", "ceth"],
        },
      })),
      getPositionsByPool: jest
        .fn()
        .mockImplementationOnce(() => ({
          mtps: [{}],
        }))
        .mockImplementationOnce(() => ({
          mtps: [{}, {}],
        })),
    },
  };

  const { mtps } = await getAllMtps({ queryClient });

  expect(queryClient.margin.getParams).toHaveBeenCalledTimes(1);
  expect(queryClient.margin.getParams).toHaveBeenCalledWith();
  expect(queryClient.margin.getPositionsByPool).toHaveBeenCalledTimes(2);
  expect(queryClient.margin.getPositionsByPool).toHaveBeenCalledWith({
    asset: "cusdc",
  });
  expect(queryClient.margin.getPositionsByPool).toHaveBeenCalledWith({
    asset: "ceth",
  });

  expect(mtps).toHaveLength(3);
});
